from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal
from uuid import uuid4
from fastapi.responses import StreamingResponse
import json
import time

from services.usage_guard import check_user_quota, log_usage
from routers.auth_dependency import get_current_user_dep
from services.tool_executor import extract_tool_call, execute_tool

from database import SessionLocal
from sqlalchemy import text

router = APIRouter(prefix="/playbench", tags=["Playbench LLM"])

        db.close()

# -----------------------------
# REQUEST MODEL
# -----------------------------
class ChatRequest(BaseModel):
    prompt: str
    model: Literal["gpt-4o", "claude-3-5-sonnet", "llama-3"]
    session_id: str | None = None


# -----------------------------
# ROLE-BASED MODEL ACCESS
# -----------------------------
def get_allowed_models(role_label: str | None):
    role_label = (role_label or "").lower()

    if role_label in ["admin", "superadmin"]:
        return ["gpt-4o", "claude-3-5-sonnet", "llama-3"]

    if role_label in ["manager", "analyst"]:
        return ["gpt-4o", "claude-3-5-sonnet"]

    return ["gpt-4o"]


# =========================================================
# STREAMING CHAT
# =========================================================
@router.post("/chat/stream")
def chat_stream(req: ChatRequest, user=Depends(get_current_user_dep)):

    db = SessionLocal()
    user_id = str(user.id)

    try:
        # 1. QUOTA CHECK
        if not check_user_quota(user_id):
            raise HTTPException(status_code=429, detail="Daily token limit exceeded")

        # 2. ROLE CHECK
        allowed_models = get_allowed_models(user.role.label if user.role else None)
        if req.model not in allowed_models:
            raise HTTPException(status_code=403, detail="Model not allowed for your role")

        # 3. SESSION
        session_id = req.session_id or str(uuid4())

        db.execute(text("""
            INSERT INTO playbench_sessions (id, user_id, created_at)
            VALUES (:id, :user_id, NOW())
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": session_id,
            "user_id": user_id
        })

        # 4. STORE USER MESSAGE
        db.execute(text("""
            INSERT INTO playbench_messages (id, session_id, role, content, created_at)
            VALUES (:id, :session_id, 'user', :content, NOW())
        """), {
            "id": str(uuid4()),
            "session_id": session_id,
            "content": req.prompt
        })

        db.commit()

        # 5. FETCH HISTORY
        result = db.execute(text("""
            SELECT role, content
            FROM playbench_messages
            WHERE session_id = :session_id
            ORDER BY created_at ASC
            LIMIT 20
        """), {
            "session_id": session_id
        })

        history = result.mappings().all()

        # 6. BUILD CONTEXT (CLEAN - NO DUPLICATES)
        context = """
You are a corporate AI assistant inside an internal platform.

If you need to use a tool, respond ONLY in JSON:

{
  "tool_call": {
    "name": "tool_name",
    "args": {}
  }
}

Available tools:
- list_apps
- get_user_points
- list_swag
- get_dashboard_stats
""".strip() + "\n\n"

        for msg in history:
            context += f"{msg['role'].upper()}: {msg['content']}\n"

        context += f"USER: {req.prompt}\nASSISTANT:"

        # 7. CALL LLM
        response, prompt_tokens, response_tokens = route_llm(
            model=req.model,
            prompt=context
        )

        # 8. TOOL EXECUTION (SINGLE CLEAN FLOW)
        tool_call = extract_tool_call(response)

        if tool_call:
            tool_call["args"]["user_id"] = user_id

            tool_result = execute_tool(tool_call)

            response, prompt_tokens, response_tokens = route_llm(
                model=req.model,
                prompt=f"{context}\nTOOL_RESULT: {tool_result}\nASSISTANT:"
            )

        # 9. STREAM RESPONSE
        def event_generator():
            streamed_text = ""

            for word in response.split():
                streamed_text += word + " "

                yield f"data: {json.dumps({'token': word, 'text': streamed_text})}\n\n"
                time.sleep(0.03)

            # 10. STORE ASSISTANT MESSAGE
            db2 = SessionLocal()
            try:
                db2.execute(text("""
                    INSERT INTO playbench_messages (id, session_id, role, content, created_at)
                    VALUES (:id, :session_id, 'assistant', :content, NOW())
                """), {
                    "id": str(uuid4()),
                    "session_id": session_id,
                    "content": response
                })

                db2.commit()

                # 11. LOG USAGE
                log_usage(
                    user_id=user_id,
                    model=req.model,
                    prompt_tokens=prompt_tokens,
                    response_tokens=response_tokens
                )

            finally:
                db2.close()

            yield f"data: {json.dumps({'done': True, 'full': response, 'session_id': session_id})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    finally:
        db.close()


# =========================================================
# SESSIONS
# =========================================================
@router.get("/sessions")
def get_sessions(user=Depends(get_current_user_dep)):

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT id, created_at
            FROM playbench_sessions
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        """), {
            "user_id": str(user.id)
        })

        return {"sessions": [dict(r) for r in result.mappings().all()]}

    finally:
        db.close()


# =========================================================
# MESSAGES
# =========================================================
@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, user=Depends(get_current_user_dep)):

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT role, content, created_at
            FROM playbench_messages
            WHERE session_id = :session_id
            ORDER BY created_at ASC
        """), {
            "session_id": session_id
        })

        return {"messages": [dict(r) for r in result.mappings().all()]}

    finally:
        db.close()