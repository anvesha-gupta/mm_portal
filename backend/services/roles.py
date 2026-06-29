from typing import Any, Dict

from sqlalchemy.orm import Session

from models.role import Role


def get_all(db: Session) -> list[Role]:
    return db.query(Role).order_by(Role.id).all()


def get_by_id(db: Session, id: Any) -> Role | None:
    return db.query(Role).filter(Role.id == id).one_or_none()


def create(db: Session, payload: Dict[str, Any]) -> Role:
    role = Role(**payload)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def update(db: Session, id: Any, payload: Dict[str, Any]) -> Role | None:
    if not payload:
        return None
    role = get_by_id(db, id)
    if not role:
        return None
    for key, value in payload.items():
        setattr(role, key, value)
    db.commit()
    db.refresh(role)
    return role


def delete(db: Session, id: Any) -> Role | None:
    role = get_by_id(db, id)
    if not role:
        return None
    db.delete(role)
    db.commit()
    return role
