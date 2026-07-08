from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import create_access_token, decode_access_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    # =====================================================
    # DEMO LOGIN
    # =====================================================

    def login(self, role: str) -> dict[str, Any]:

        allowed_roles = {
            "employee",
            "finance",
            "hr",
            "admin",
        }

        role = role.lower().strip()

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role selected.",
            )

        user_id = str(uuid4())

        role_names = {
            "employee": "Standard Employee",
            "finance": "Finance",
            "hr": "Human Resources",
            "admin": "IT Administrator",
        }

        token = create_access_token(
            {
                "sub": user_id,
                "role": role,
                "email": f"{role}@motiveminds.local",
                "display_name": role_names[role],
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": f"{role}@motiveminds.local",
                "display_name": role_names[role],
                "department": role.upper(),
                "title": role_names[role],
                "role_id": role,
                "role_label": role_names[role],
                "is_active": True,
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

        user.id = payload["sub"]
        user.email = payload["email"]
        user.display_name = payload["display_name"]

        user.department = payload["role"].upper()
        user.title = payload["display_name"]

        user.role_id = payload["role"]
        user.role = DemoRole(payload["display_name"])

        user.is_active = True
        user.last_login_at = datetime.utcnow()

        return user

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )