from services.tool_registry import tool_registry
from database import SessionLocal
from sqlalchemy import text


# -----------------------------
# TOOL: GET USER POINTS
# -----------------------------
@tool_registry.register("get_user_points")
def get_user_points(user_id: str):

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT total_points
            FROM user_points
            WHERE user_id = :user_id
        """), {"user_id": user_id})

        return result.mappings().first()

    finally:
        db.close()


# -----------------------------
# TOOL: LEADERBOARD
# -----------------------------
@tool_registry.register("get_leaderboard")
def get_leaderboard(limit: int = 10):

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT user_id, total_points
            FROM user_points
            ORDER BY total_points DESC
            LIMIT :limit
        """), {"limit": limit})

        return [dict(r) for r in result.mappings().all()]

    finally:
        db.close()


# -----------------------------
# TOOL: LIST APPS
# -----------------------------
@tool_registry.register("list_apps")
def list_apps():

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT id, name, description
            FROM apps
        """))

        return [dict(r) for r in result.mappings().all()]

    finally:
        db.close()


# -----------------------------
# TOOL: DASHBOARD STATS
# -----------------------------
@tool_registry.register("get_dashboard_stats")
def get_dashboard_stats(user_id: str):

    db = SessionLocal()

    try:
        result = db.execute(text("""
            SELECT
                (SELECT COUNT(*) FROM apps) as total_apps,
                (SELECT total_points FROM user_points WHERE user_id = :user_id) as points
        """), {"user_id": user_id})

        return dict(result.mappings().first())

    finally:
        db.close()