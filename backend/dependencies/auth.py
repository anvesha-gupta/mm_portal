from typing import Callable
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from services.rbac_service import (
    get_user_by_id,
    has_app_access,
    has_permission,
    has_role,
)


def get_authenticated_user_id() -> UUID:
    """Stub dependency for authenticated user identity.

    TODO: Replace this with Azure AD authentication / token validation.
    """
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication not implemented. Inject Azure AD user here.",
    )


def get_current_user(
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_authenticated_user_id),
) -> User:
    """Return the current authenticated User from the database."""
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user not found.",
        )
    return user


def _authorization_exception(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def require_role(role_name: str) -> Callable[[User, Session], User]:
    """Return a dependency that requires the authenticated user to have a role."""

    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not has_role(db, current_user.id, role_name):
            raise _authorization_exception(
                f"Access denied: role '{role_name}' required."
            )
        return current_user

    return dependency


def require_permission(permission_name: str) -> Callable[[User, Session], User]:
    """Return a dependency that requires the authenticated user to have a permission."""

    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not has_permission(db, current_user.id, permission_name):
            raise _authorization_exception(
                f"Access denied: permission '{permission_name}' required."
            )
        return current_user

    return dependency


def require_app_access(app_key: str) -> Callable[[User, Session], User]:
    """Return a dependency that requires the authenticated user to have app access."""

    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not has_app_access(db, current_user.id, app_key):
            raise _authorization_exception(
                f"Access denied: app access '{app_key}' required."
            )
        return current_user

    return dependency
