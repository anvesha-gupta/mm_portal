from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Any, Dict, List

TABLE = "employee_assignments"
SCHEMA_PREFIX = "public"


def get_all(db: Session) -> List[Dict[str, Any]]:
    # We can join with users and llm_models to provide a detailed view to the admin
    sql = text(f"""
        SELECT 
            e.employee_id, 
            e.llm_id, 
            e.assigned_tokens, 
            e.used_tokens, 
            e.remaining_tokens, 
            e.active,
            u.display_name as employee_name,
            u.email as employee_email,
            m.display_name as llm_name,
            m.provider as llm_provider
        FROM {SCHEMA_PREFIX}.{TABLE} e
        JOIN mm_portal.users u ON e.employee_id = u.id
        JOIN mm_portal.llm_models m ON e.llm_id = m.id
        ORDER BY u.display_name, m.display_name
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


def get_by_ids(db: Session, employee_id: Any, llm_id: Any) -> Dict[str, Any] | None:
    sql = text(f"SELECT * FROM {SCHEMA_PREFIX}.{TABLE} WHERE employee_id = :employee_id AND llm_id = :llm_id")
    row = db.execute(sql, {"employee_id": employee_id, "llm_id": llm_id}).mappings().first()
    return dict(row) if row else None


def create(db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
    if not payload:
        raise ValueError("Empty payload")
    
    # Calculate initial remaining tokens if not set explicitly
    if "remaining_tokens" not in payload or payload["remaining_tokens"] is None or payload["remaining_tokens"] == 0:
        payload["remaining_tokens"] = payload.get("assigned_tokens", 0)
        
    cols = ", ".join(payload.keys())
    vals = ", ".join(
        ":" + k for k in payload.keys()
    )
    sql = text(f"INSERT INTO {SCHEMA_PREFIX}.{TABLE} ({cols}) VALUES ({vals}) RETURNING *")
    result = db.execute(sql, payload)
    db.commit()
    row = result.mappings().first()
    return dict(row) if row else {}


def update(db: Session, employee_id: Any, llm_id: Any, payload: Dict[str, Any]) -> Dict[str, Any] | None:
    if not payload:
        return None
    
    # If assigned_tokens is updated, we might need to adjust remaining_tokens
    if "assigned_tokens" in payload:
        # Get existing assignment to calculate difference
        existing = get_by_ids(db, employee_id, llm_id)
        if existing:
            diff = payload["assigned_tokens"] - existing["assigned_tokens"]
            payload["remaining_tokens"] = max(0, existing["remaining_tokens"] + diff)
            
    set_clause = ", ".join(f"{k} = :{k}" for k in payload.keys())
    params = payload.copy()
    params["employee_id"] = employee_id
    params["llm_id"] = llm_id
    sql = text(f"UPDATE {SCHEMA_PREFIX}.{TABLE} SET {set_clause} WHERE employee_id = :employee_id AND llm_id = :llm_id RETURNING *")
    result = db.execute(sql, params)
    db.commit()
    row = result.mappings().first()
    return dict(row) if row else None


def delete(db: Session, employee_id: Any, llm_id: Any) -> Dict[str, Any] | None:
    sql = text(f"DELETE FROM {SCHEMA_PREFIX}.{TABLE} WHERE employee_id = :employee_id AND llm_id = :llm_id RETURNING *")
    result = db.execute(sql, {"employee_id": employee_id, "llm_id": llm_id})
    db.commit()
    row = result.mappings().first()
    return dict(row) if row else None
