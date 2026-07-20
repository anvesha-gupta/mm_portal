from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Any

from database import get_db
from dependencies.auth import get_current_user, require_permission
from models.user import User
from services import points_transactions as svc
from schemas import points_transactions as schema

router = APIRouter(prefix="/api/points_transactions", tags=["PointsTransactions"])


@router.get("/me")
def get_my_transactions(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.execute(
        text("""
            SELECT id, amount, transaction_type, notes, created_at
            FROM mm_portal.points_transactions
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT :limit
        """),
        {"user_id": current_user.id, "limit": limit},
    ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/", response_model=list[schema.PointsTransactionResponse])
def list_items(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.get_all(db)


@router.get("/{id}")
def get_item(
    id: Any,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    item = svc.get_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schema.PointsTransactionResponse)
def create_item(
    payload: schema.PointsTransactionCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.create(db, payload.dict())


@router.put("/{id}")
def update_item(
    id: Any,
    payload: schema.PointsTransactionUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    updated = svc.update(db, id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Not found or no changes")
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    id: Any,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    deleted = svc.delete(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Not found")
    return
