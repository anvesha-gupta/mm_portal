from typing import Any, Dict

from sqlalchemy.orm import Session

from models.user_app_override import UserAppOverride


def get_all(db: Session) -> list[UserAppOverride]:
    return db.query(UserAppOverride).order_by(UserAppOverride.id).all()


def get_by_id(db: Session, id: Any) -> UserAppOverride | None:
    return db.query(UserAppOverride).filter(UserAppOverride.id == id).one_or_none()


def create(db: Session, payload: Dict[str, Any]) -> UserAppOverride:
    override = UserAppOverride(**payload)
    db.add(override)
    db.commit()
    db.refresh(override)
    return override


def update(db: Session, id: Any, payload: Dict[str, Any]) -> UserAppOverride | None:
    if not payload:
        return None
    override = get_by_id(db, id)
    if not override:
        return None
    for key, value in payload.items():
        setattr(override, key, value)
    db.commit()
    db.refresh(override)
    return override


def delete(db: Session, id: Any) -> UserAppOverride | None:
    override = get_by_id(db, id)
    if not override:
        return None
    db.delete(override)
    db.commit()
    return override
