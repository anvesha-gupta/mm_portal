from __future__ import annotations

import os
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from services.rbac_service import get_user_by_id
from core.security import create_access_token, decode_access_token, verify_password


class AuthService:
    """Encapsulate authentication behavior for local and future Azure AD flows."""

    def __init__(self, db: Session):
        self.db = db

    def _get_app_env(self) -> str:
        return (os.getenv("APP_ENV") or "local").strip().lower()

    def _get_local_user(self, username: str) -> User | None:
        """Resolve the user for local login using email as the username identifier."""
        normalized = username.strip().lower()
        return self.db.query(User).filter(User.email.ilike(normalized)).one_or_none()

    def login(self, username: str, password: str) -> dict[str, Any]:
        """Authenticate a user for the local environment."""
        if self._get_app_env() != "local":
            # TODO: Replace this with Azure AD integration once production auth is enabled.
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Production authentication is not implemented yet. Azure AD integration will be added here.",
            )

        user = self._get_local_user(username)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

        # Local authentication expects a password hash in PostgreSQL.
        # The current schema does not expose a password column, so this path is designed to work
        # when a password_hash/password column is added later without changing the public API.
        password_hash = getattr(user, "password_hash", None) or getattr(user, "password", None)
        if not password_hash:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Local password authentication is not configured for this user because no password_hash/password column exists in the current schema.",
            )

        if not verify_password(password, password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

        token = create_access_token(subject=str(user.id))
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "display_name": user.display_name,
                "department": user.department,
                "title": user.title,
                "role_id": user.role_id,
                "role_label": getattr(user.role, "label", None),
                "is_active": user.is_active,
                "last_login_at": user.last_login_at,
            },
        }


def get_current_user(db: Session, token: str) -> User:
    """Validate a JWT token and return the corresponding user record."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")

    try:
        payload = decode_access_token(token)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    user = get_user_by_id(db, UUID(subject))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authenticated user not found")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

    return user
