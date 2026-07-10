from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from core.security import create_access_token, decode_access_token


# Maps frontend demo role → DB role_id
_DB_ROLE_MAP = {
    "employee": "employee",
    "finance":  "finance",
    "hr":       "hr",
    "admin":    "it_admin",
}


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    # =====================================================
    # DEMO LOGIN
    # =====================================================

    def login(self, role: str) -> dict[str, Any]:

        role = role.lower().strip()

        if role not in _DB_ROLE_MAP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role selected.",
            )

        db_role = _DB_ROLE_MAP[role]

        # Fetch the real DB user for this role so user_points FK is satisfied
        row = self.db.execute(
            text(
                "SELECT id, email, display_name "
                "FROM mm_portal.users "
                "WHERE role_id = :role_id AND is_active = true "
                "LIMIT 1"
            ),
            {"role_id": db_role},
        ).mappings().first()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active user found for role '{role}'. Seed the users table first.",
            )

        user_id      = str(row["id"])
        email        = row["email"]
        display_name = row["display_name"]

        token = create_access_token(
            {
                "sub":          user_id,
                "role":         role,
                "email":        email,
                "display_name": display_name,
            }
        )

        return {
            "access_token": token,
            "token_type":   "bearer",
            "user": {
                "id":           user_id,
                "email":        email,
                "display_name": display_name,
                "department":   role.upper(),
                "title":        display_name,
                "role_id":      role,
                "role_label":   display_name,
                "is_active":    True,
                "last_login_at": None,
            },
        }


# =========================================================
# CURRENT USER FROM TOKEN
# =========================================================

def get_current_user(db: Session, token: str):

    try:
        payload = decode_access_token(token)

        class DemoRole:
            def __init__(self, label: str):
                self.label = label

        class DemoUser:
            pass

        user = DemoUser()

        user.id           = payload["sub"]
        user.email        = payload["email"]
        user.display_name = payload["display_name"]

        user.department   = payload["role"].upper()
        user.title        = payload["display_name"]

        user.role_id      = payload["role"]
        user.role         = DemoRole(payload["display_name"])

        user.is_active    = True
        user.last_login_at = datetime.utcnow()

        return user

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
