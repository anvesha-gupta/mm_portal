from services.tool_registry import tool_registry
from database import SessionLocal
from sqlalchemy import text


# -----------------------------
# TOOL 1: GET USER PROFILE
# -----------------------------
@tool_registry.register("get_user_profile")
def get_user_profile(user_id: str):

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT id, email, display_name, department, title
            FROM users
            WHERE id = :user_id
        """), {"user_id": user_id})

        return dict(result.mappings().first())

    finally:
        db.close()


# -----------------------------
# TOOL 2: GET USER USAGE
# -----------------------------
@tool_registry.register("get_user_usage")
def get_user_usage(user_id: str):

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT
                COUNT(*) as requests,
                SUM(prompt_tokens + response_tokens) as tokens,
                SUM(estimated_cost) as cost
            FROM usage_logs
            WHERE user_id = :user_id
        """), {"user_id": user_id})

        return dict(result.mappings().first())

    finally:
        db.close()