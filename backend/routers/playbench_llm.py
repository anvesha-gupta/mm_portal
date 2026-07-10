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

DEFAULT_ASSIGNED_TOKENS = 10_000


class ChatRequest(BaseModel):
    prompt: str
    model: str
    session_id: str | None = None


class SessionRenameRequest(BaseModel):
    title: str


def _ensure_user_assignments(user_id: str, db: Session) -> None:
    """Ensure every active LLM model is assigned to the user, seeding missing ones."""
    active_models = db.execute(
        text("SELECT id FROM mm_portal.llm_models WHERE is_active = true"),
    ).mappings().all()

    changed = False
    for m in active_models:
        result = db.execute(
            text(
                """
                INSERT INTO public.employee_assignments
                    (employee_id, llm_id, assigned_tokens, used_tokens, remaining_tokens, active)
                VALUES (:uid, :llm_id, :tokens, 0, :tokens, true)
                ON CONFLICT (employee_id, llm_id) DO NOTHING
                """
            ),
            {"uid": user_id, "llm_id": m["id"], "tokens": DEFAULT_ASSIGNED_TOKENS},
        )
        if result.rowcount:
            changed = True
    if changed:
        db.commit()


@router.get("/models")
def list_allowed_models(user=Depends(get_current_user_dep), db: Session = Depends(get_db)):
    user_id = str(user.id)
    _ensure_user_assignments(user_id, db)
    result = db.execute(
        text(
            """
            SELECT
                e.llm_id,
                m.display_name,
                m.provider,
                e.assigned_tokens,
                e.used_tokens,
                e.remaining_tokens,
                c.model_name
            FROM public.employee_assignments e
            JOIN mm_portal.llm_models m ON e.llm_id = m.id
            LEFT JOIN public.llm_model_configs c ON m.id = c.llm_id
            WHERE e.employee_id = :user_id AND e.active = true AND m.is_active = true
            ORDER BY m.sort_order
            """
        ),
        {"user_id": user_id},
    ).mappings().all()

    return {"models": [dict(row) for row in result]}


@router.get("/token-summary")
def get_token_summary(user=Depends(get_current_user_dep), db: Session = Depends(get_db)):
    user_id = str(user.id)
    _ensure_user_assignments(user_id, db)
    result = db.execute(
        text(
            """
            SELECT 
                COALESCE(SUM(assigned_tokens), 0) as assigned,
                COALESCE(SUM(used_tokens), 0) as used,
                COALESCE(SUM(remaining_tokens), 0) as remaining
            FROM public.employee_assignments
            WHERE employee_id = :user_id AND active = true
            """
        ),
        {"user_id": user_id},
    ).mappings().first()
    return dict(result) if result else {"assigned": 0, "used": 0, "remaining": 0}


@router.post("/chat/stream")
def chat_stream(
    req: ChatRequest,
    user=Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    user_id = str(user.id)
    _ensure_user_assignments(user_id, db)

    # Check database assignments for this model
    assignment = db.execute(
        text(
            """
            SELECT assigned_tokens, used_tokens, remaining_tokens
            FROM public.employee_assignments
            WHERE employee_id = :user_id AND llm_id = :model AND active = true
            """
        ),
        {"user_id": user_id, "model": req.model},
    ).mappings().first()

    if not assignment:
        raise HTTPException(status_code=403, detail="Model not assigned to you or is disabled")

    if assignment["remaining_tokens"] <= 0:
        raise HTTPException(status_code=429, detail="Token quota exceeded for this model")

    # Find actual model name from configs if exists
    config_row = db.execute(
        text("SELECT model_name FROM public.llm_model_configs WHERE llm_id = :model"),
        {"model": req.model}
    ).mappings().first()
    
    routing_model_name = config_row["model_name"] if (config_row and config_row["model_name"]) else req.model

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
        response, prompt_tokens, response_tokens = route_llm(model=routing_model_name, prompt=prompt_text)
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
        response, prompt_tokens, response_tokens = route_llm(model=routing_model_name, prompt=prompt_text)

    def event_generator():
        streamed_text = ""

        for token in response.split():
            streamed_text += token + " "
            yield f"data: {json.dumps({'token': token, 'text': streamed_text})}\n\n"
            time.sleep(0.02)

        # 1. Store assistant message
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

        # 2. Accounting - update user assignment token quotas
        total_tokens = prompt_tokens + response_tokens
        db.execute(
            text(
                """
                UPDATE public.employee_assignments
                SET used_tokens = used_tokens + :tokens,
                    remaining_tokens = GREATEST(0, remaining_tokens - :tokens)
                WHERE employee_id = :user_id AND llm_id = :model
                """
            ),
            {"tokens": total_tokens, "user_id": user_id, "model": req.model},
        )
        db.commit()

        # 3. Log usage to usage_logs
        log_usage(
            user_id=user_id,
            model=req.model,
            prompt_tokens=prompt_tokens,
            response_tokens=response_tokens,
        )

        # 4. Audit logging
        db.execute(
            text(
                """
                INSERT INTO mm_portal.audit_log (id, actor_id, action, entity_type, entity_id, new_value, created_at)
                VALUES (:audit_id, :user_id, 'playbench_chat', 'llm_model', :model, :val, NOW())
                """
            ),
            {
                "audit_id": str(uuid4()),
                "user_id": user_id,
                "model": req.model,
                "val": json.dumps({
                    "prompt_tokens": prompt_tokens,
                    "response_tokens": response_tokens,
                    "total_tokens": total_tokens,
                    "session_id": session_id
                })
            }
        )
        db.commit()

        yield f"data: {json.dumps({'done': True, 'full': response, 'session_id': session_id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/sessions")
def get_sessions(user=Depends(get_current_user_dep), db: Session = Depends(get_db)):
    result = db.execute(
        text(
            """
            SELECT ps.id, ps.created_at, ps.user_id,
                   COALESCE(u.display_name, 'Unknown') AS display_name
            FROM playbench_sessions ps
            LEFT JOIN mm_portal.users u ON u.id::text = ps.user_id::text
            ORDER BY ps.created_at DESC
            """
        ),
    )
    current_user_id = str(user.id)
    rows = []
    for r in result.mappings().all():
        row = dict(r)
        row["is_own"] = str(row["user_id"]) == current_user_id
        rows.append(row)
    return {"sessions": rows}


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
