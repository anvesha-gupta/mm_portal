from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Any, Dict, List

TABLE = "llm_models"
SCHEMA_PREFIX = "mm_portal"


def get_all(db: Session) -> List[Dict[str, Any]]:
    sql = text(f"""
        SELECT m.*, c.endpoint_url, c.model_name, c.monthly_limit
        FROM {SCHEMA_PREFIX}.{TABLE} m
        LEFT JOIN public.llm_model_configs c ON m.id = c.llm_id
        ORDER BY m.id
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


def get_by_id(db: Session, id: Any) -> Dict[str, Any] | None:
    sql = text(f"""
        SELECT m.*, c.endpoint_url, c.model_name, c.monthly_limit
        FROM {SCHEMA_PREFIX}.{TABLE} m
        LEFT JOIN public.llm_model_configs c ON m.id = c.llm_id
        WHERE m.id = :id
    """)
    row = db.execute(sql, {"id": id}).mappings().first()
    return dict(row) if row else None


def create(db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
    if not payload:
        raise ValueError("Empty payload")
    
    # Extract config fields
    config_fields = ["endpoint_url", "model_name", "monthly_limit"]
    config_payload = {k: payload.pop(k) for k in config_fields if k in payload}
    
    # Write to llm_models
    cols = ", ".join(payload.keys())
    vals = ", ".join(
        ":" + k for k in payload.keys()
    )
    sql = text(f"INSERT INTO {SCHEMA_PREFIX}.{TABLE} ({cols}) VALUES ({vals}) RETURNING *")
    db.execute(sql, payload)
    
    # Write to llm_model_configs
    config_payload["llm_id"] = payload["id"]
    ccols = ", ".join(config_payload.keys())
    cvals = ", ".join(":" + k for k in config_payload.keys())
    sql_c = text(f"INSERT INTO public.llm_model_configs ({ccols}) VALUES ({cvals})")
    db.execute(sql_c, config_payload)
    
    db.commit()
    return get_by_id(db, payload["id"]) or {}


def update(db: Session, id: Any, payload: Dict[str, Any]) -> Dict[str, Any] | None:
    if not payload:
        return get_by_id(db, id)
    
    # Extract config fields
    config_fields = ["endpoint_url", "model_name", "monthly_limit"]
    config_payload = {k: payload.pop(k) for k in config_fields if k in payload}
    
    # Update llm_models if there are fields left
    if payload:
        set_clause = ", ".join(f"{k} = :{k}" for k in payload.keys())
        params = payload.copy()
        params["id"] = id
        sql = text(f"UPDATE {SCHEMA_PREFIX}.{TABLE} SET {set_clause} WHERE id = :id")
        db.execute(sql, params)
        
    # Update/insert llm_model_configs if there are configs
    if config_payload:
        config_payload["llm_id"] = id
        set_clause_c = ", ".join(f"{k} = :{k}" for k in config_payload.keys() if k != "llm_id")
        sql_c = text(f"""
            INSERT INTO public.llm_model_configs (llm_id, {', '.join(config_payload.keys())})
            VALUES (:llm_id, {', '.join(':' + k for k in config_payload.keys())})
            ON CONFLICT (llm_id) DO UPDATE SET {set_clause_c}
        """)
        db.execute(sql_c, config_payload)
        
    db.commit()
    return get_by_id(db, id)


def delete(db: Session, id: Any) -> Dict[str, Any] | None:
    deleted_model = get_by_id(db, id)
    if not deleted_model:
        return None
        
    # Delete configs first (configs has FK with cascade manually set up, but let's be explicit just in case)
    db.execute(text("DELETE FROM public.llm_model_configs WHERE llm_id = :id"), {"id": id})
    
    sql = text(f"DELETE FROM {SCHEMA_PREFIX}.{TABLE} WHERE id = :id")
    db.execute(sql, {"id": id})
    db.commit()
    return deleted_model
