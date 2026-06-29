from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from models.role import Role
from models.role_app_permission import RoleAppPermission
from models.user import User
from models.user_app_override import UserAppOverride


# RBAC service helpers for auth and authorization.
# Start small and expand with role/permission functions later.

def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
    """Return the User ORM object by UUID, or None if not found."""
    return db.query(User).filter(User.id == user_id).one_or_none()


def get_user_role(db: Session, user_id: UUID) -> Optional[Role]:
    """Return the Role object for a user, or None if no user or role exists."""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    return user.role


def get_role_permissions(db: Session, role_id: str) -> List[RoleAppPermission]:
    """Return all RoleAppPermission entries for the specified role."""
    return db.query(RoleAppPermission).filter(RoleAppPermission.role_id == role_id).all()


def get_user_overrides(db: Session, user_id: UUID) -> List[UserAppOverride]:
    """Return all UserAppOverride entries for the specified user."""
    return db.query(UserAppOverride).filter(UserAppOverride.user_id == user_id).all()


def has_role(db: Session, user_id: UUID, role_name: str) -> bool:
    """Return True when the user's assigned role matches the provided role name."""
    role = get_user_role(db, user_id)
    if not role:
        return False
    return role.id == role_name or role.label == role_name


def has_app_access(db: Session, user_id: UUID, app_key: str) -> bool:
    """Check whether a user has access to an application key."""
    role = get_user_role(db, user_id)
    if not role:
        return False

    role_allowed = any(
        permission.app_id == app_key for permission in get_role_permissions(db, role.id)
    )

    override = next(
        (
            override
            for override in get_user_overrides(db, user_id)
            if override.app_id == app_key
        ),
        None,
    )

    if not override:
        return role_allowed

    override_type = override.override_type.lower()
    if override_type == "grant":
        return True
    if override_type == "revoke":
        return False

    return role_allowed


def has_permission(db: Session, user_id: UUID, permission_name: str) -> bool:
    """Return whether a user has the named permission.

    This wrapper currently maps permission checks to application access
    and can be expanded for more granular permission logic later.
    """
    return has_app_access(db, user_id, permission_name)
