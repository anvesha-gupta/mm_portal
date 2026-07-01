from __future__ import annotations

from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from services.auth_service import get_current_user as get_current_user_from_token
from services.rbac_service import has_app_access, has_permission, has_role

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> User:
    """Return the authenticated user from a bearer token."""
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")

    return get_current_user_from_token(db, credentials.credentials)


def _authorization_exception(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def require_role(role_name: str) -> Callable[[User, Session], User]:
    """Return a dependency that requires the authenticated user to have a role."""

    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not has_role(db, current_user.id, role_name):
            raise _authorization_exception(f"Access denied: role '{role_name}' required.")
        return current_user

    return dependency


def require_permission(permission_name: str) -> Callable[[User, Session], User]:
    """Return a dependency that requires the authenticated user to have a permission."""

    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not has_permission(db, current_user.id, permission_name):
            raise _authorization_exception(f"Access denied: permission '{permission_name}' required.")
        return current_user

    return dependency


def require_app_access(app_key: str) -> Callable[[User, Session], User]:
    """Return a dependency that requires the authenticated user to have app access."""

    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not has_app_access(db, current_user.id, app_key):
            raise _authorization_exception(f"Access denied: app access '{app_key}' required.")
        return current_user

    return dependency
