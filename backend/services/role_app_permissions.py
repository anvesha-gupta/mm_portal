from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Any, Dict, List

TABLE = "role_app_permissions"
SCHEMA_PREFIX = "mm_portal"


def get_all(db: Session) -> List[Dict[str, Any]]:
    sql = text(f"SELECT * FROM {SCHEMA_PREFIX}.{TABLE} ORDER BY id")
    result = db.execute(sql)
    return result.mappings().all()


def get_by_id(db: Session, id: Any) -> Dict[str, Any] | None:
    sql = text(f"SELECT * FROM {SCHEMA_PREFIX}.{TABLE} WHERE id = :id")
    return db.execute(sql, {"id": id}).mappings().first()


def create(db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
    if not payload:
        raise ValueError("Empty payload")
    cols = ", ".join(payload.keys())
    vals = ", ".join(
        ":" + k for k in payload.keys()
    )
    sql = text(f"INSERT INTO {SCHEMA_PREFIX}.{TABLE} ({cols}) VALUES ({vals}) RETURNING *")
    result = db.execute(sql, payload)
    db.commit()
    return result.mappings().first()


def update(db: Session, id: Any, payload: Dict[str, Any]) -> Dict[str, Any] | None:
    if not payload:
        return None
    set_clause = ", ".join(f"{k} = :{k}" for k in payload.keys())
    params = payload.copy()
    params["id"] = id
    sql = text(f"UPDATE {SCHEMA_PREFIX}.{TABLE} SET {set_clause} WHERE id = :id RETURNING *")
    result = db.execute(sql, params)
    db.commit()
    return result.mappings().first()


def delete(db: Session, id: Any) -> Dict[str, Any] | None:
    sql = text(f"DELETE FROM {SCHEMA_PREFIX}.{TABLE} WHERE id = :id RETURNING *")
    result = db.execute(sql, {"id": id})
    db.commit()
    return result.mappings().first()
