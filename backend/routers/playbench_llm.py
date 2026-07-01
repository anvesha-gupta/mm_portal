from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import text
import json
import time

from database import get_db
from routers.auth_dependency import get_current_user_dep
from services.usage_guard import check_user_quota, log_usage
from services.tool_executor import extract_tool_call, execute_tool
from services.llm_routers import route_llm
from services.model_access import get_allowed_models
from services.prompt_templates import build_playbench_prompt

router = APIRouter(prefix="/playbench", tags=["Playbench LLM"])


class ChatRequest(BaseModel):
    prompt: str
    model: Literal["gpt-4o", "claude-3-5-sonnet", "llama-3"]
    session_id: str | None = None


class SessionRenameRequest(BaseModel):
    title: str


@router.get("/models")
def list_allowed_models(user=Depends(get_current_user_dep)):
    allowed_models = get_allowed_models(user.role.label if user.role else None)
    return {"models": allowed_models}


@router.post("/chat/stream")
def chat_stream(
    req: ChatRequest,
    user=Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    user_id = str(user.id)

    if not check_user_quota(user_id):
        raise HTTPException(status_code=429, detail="Daily token limit exceeded")

    allowed_models = get_allowed_models(user.role.label if user.role else None)
    if req.model not in allowed_models:
        raise HTTPException(status_code=403, detail="Model not allowed for your role")

    session_id = req.session_id or str(uuid4())

    db.execute(
        text(
            """
            INSERT INTO playbench_sessions (id, user_id, created_at)
            VALUES (:id, :user_id, NOW())
            ON CONFLICT (id) DO NOTHING
            """
        ),
        {"id": session_id, "user_id": user_id},
    )

    db.execute(
        text(
            """
            INSERT INTO playbench_messages (id, session_id, role, content, created_at)
            VALUES (:id, :session_id, 'user', :content, NOW())
            """
        ),
        {"id": str(uuid4()), "session_id": session_id, "content": req.prompt},
    )

    db.commit()

    history = db.execute(
        text(
            """
            SELECT role, content
            FROM playbench_messages
            WHERE session_id = :session_id
            ORDER BY created_at ASC
            """
        ),
        {"session_id": session_id},
    ).mappings().all()

    prompt_text = build_playbench_prompt(history, req.prompt)

    try:
        response, prompt_tokens, response_tokens = route_llm(model=req.model, prompt=prompt_text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    tool_call = extract_tool_call(response)
    if tool_call:
        tool_call["args"]["user_id"] = user_id
        try:
            tool_result = execute_tool(tool_call)
        except Exception as exc:
            tool_result = f"Tool execution failed: {exc}"

        prompt_text = build_playbench_prompt(history, req.prompt)
        prompt_text += f"\nTOOL_RESULT: {tool_result}\nASSISTANT:"
        response, prompt_tokens, response_tokens = route_llm(model=req.model, prompt=prompt_text)

    def event_generator():
        streamed_text = ""

        for token in response.split():
            streamed_text += token + " "
            yield f"data: {json.dumps({'token': token, 'text': streamed_text})}\n\n"
            time.sleep(0.02)

        db.execute(
            text(
                """
                INSERT INTO playbench_messages (id, session_id, role, content, created_at)
                VALUES (:id, :session_id, 'assistant', :content, NOW())
                """
            ),
            {"id": str(uuid4()), "session_id": session_id, "content": response},
        )
        db.commit()
        log_usage(
            user_id=user_id,
            model=req.model,
            prompt_tokens=prompt_tokens,
            response_tokens=response_tokens,
        )

        yield f"data: {json.dumps({'done': True, 'full': response, 'session_id': session_id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/sessions")
def get_sessions(user=Depends(get_current_user_dep), db: Session = Depends(get_db)):
    result = db.execute(
        text(
            """
            SELECT id, created_at
            FROM playbench_sessions
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            """
        ),
        {"user_id": str(user.id)},
    )
    return {"sessions": [dict(r) for r in result.mappings().all()]}


@router.get("/sessions/{session_id}/messages")
def get_messages(
    session_id: str,
    user=Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    result = db.execute(
        text(
            """
            SELECT role, content, created_at
            FROM playbench_messages
            WHERE session_id = :session_id
            ORDER BY created_at ASC
            """
        ),
        {"session_id": session_id},
    )
    return {"messages": [dict(r) for r in result.mappings().all()]}


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: str,
    user=Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    db.execute(
        text(
            """
            DELETE FROM playbench_sessions
            WHERE id = :session_id AND user_id = :user_id
            """
        ),
        {"session_id": session_id, "user_id": str(user.id)},
    )
    db.commit()
    return None
