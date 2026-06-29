from typing import Any, Dict

from sqlalchemy.orm import Session

from models.app import App


def get_all(db: Session) -> list[App]:
    return db.query(App).order_by(App.id).all()


def get_by_id(db: Session, id: Any) -> App | None:
    return db.query(App).filter(App.id == id).one_or_none()


def create(db: Session, payload: Dict[str, Any]) -> App:
    app = App(**payload)
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def update(db: Session, id: Any, payload: Dict[str, Any]) -> App | None:
    if not payload:
        return None
    app = get_by_id(db, id)
    if not app:
        return None
    for key, value in payload.items():
        setattr(app, key, value)
    db.commit()
    db.refresh(app)
    return app


def delete(db: Session, id: Any) -> App | None:
    app = get_by_id(db, id)
    if not app:
        return None
    db.delete(app)
    db.commit()
    return app
