from typing import Any, Dict

from sqlalchemy.orm import Session

from models.user import User


def get_all(db: Session) -> list[User]:
    return db.query(User).order_by(User.id).all()


def get_by_id(db: Session, id: Any) -> User | None:
    return db.query(User).filter(User.id == id).one_or_none()


def create(db: Session, payload: Dict[str, Any]) -> User:
    user = User(**payload)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update(db: Session, id: Any, payload: Dict[str, Any]) -> User | None:
    if not payload:
        return None
    user = get_by_id(db, id)
    if not user:
        return None
    for key, value in payload.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete(db: Session, id: Any) -> User | None:
    user = get_by_id(db, id)
    if not user:
        return None
    db.delete(user)
    db.commit()
    return user
