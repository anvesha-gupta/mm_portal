from datetime import datetime, timedelta
from sqlalchemy import text
from database import SessionLocal

TOKEN_LIMIT = 50000  # later we can make role-based


# -----------------------------
# CHECK USER QUOTA
# -----------------------------
def check_user_quota(user_id: str) -> bool:
    db = SessionLocal()

    try:
        since = datetime.utcnow() - timedelta(days=1)

        result = db.execute(text("""
            SELECT COALESCE(SUM(prompt_tokens + response_tokens), 0) AS total
            FROM usage_logs
            WHERE user_id = :user_id
            AND created_at >= :since
        """), {
            "user_id": user_id,
            "since": since
        })

        total = result.scalar() or 0
        return total < TOKEN_LIMIT

    finally:
        db.close()


# -----------------------------
# LOG USAGE
# -----------------------------
def log_usage(user_id: str, model: str, prompt_tokens: int, response_tokens: int):
    db = SessionLocal()

    try:
        total_tokens = prompt_tokens + response_tokens

        # SIMPLE COST MODEL (you can refine later)
        cost_map = {
            "gpt-4o": 0.005,
            "claude-3-5-sonnet": 0.004,
            "llama-3": 0.001
        }

        cost = (total_tokens / 1000) * cost_map.get(model, 0.005)

        db.execute(text("""
            INSERT INTO usage_logs (user_id, model, prompt_tokens, response_tokens, estimated_cost)
            VALUES (:user_id, :model, :pt, :rt, :cost)
        """), {
            "user_id": user_id,
            "model": model,
            "pt": prompt_tokens,
            "rt": response_tokens,
            "cost": cost
        })

        db.commit()

    finally:
        db.close()