from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from database import SessionLocal
from routers.auth_dependency import get_current_user_dep

router = APIRouter(prefix="/admin/llm", tags=["LLM Admin Dashboard"])


# -----------------------------
# ADMIN GUARD
# -----------------------------
def require_admin(user):
    role = (user.role.label if user.role else "").lower()
    if role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Admin access required")


# -----------------------------
# GLOBAL USAGE SUMMARY
# -----------------------------
@router.get("/usage-summary")
def usage_summary(user=Depends(get_current_user_dep)):
    require_admin(user)

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT
                model,
                COUNT(*) as requests,
                SUM(prompt_tokens + response_tokens) as tokens,
                SUM(estimated_cost) as cost
            FROM usage_logs
            GROUP BY model
            ORDER BY cost DESC
        """))

        return {"summary": [dict(row) for row in result.mappings().all()]}

    finally:
        db.close()


# -----------------------------
# USER-WISE USAGE
# -----------------------------
@router.get("/user-usage")
def user_usage(user=Depends(get_current_user_dep)):
    require_admin(user)

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT
                user_id,
                COUNT(*) as requests,
                SUM(prompt_tokens + response_tokens) as tokens,
                SUM(estimated_cost) as cost
            FROM usage_logs
            GROUP BY user_id
            ORDER BY cost DESC
        """))

        return {"users": [dict(row) for row in result.mappings().all()]}

    finally:
        db.close()