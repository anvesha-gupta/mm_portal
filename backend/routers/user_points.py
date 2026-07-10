from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Any

from database import get_db
from dependencies.auth import require_permission, get_current_user
from models.user import User
from services import user_points as svc
from schemas import user_points as schema

router = APIRouter(prefix="/api/user_points", tags=["UserPoints"])


@router.get("/", response_model=list[schema.UserPointsResponse])
def list_items(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.get_all(db)


# /me routes must be declared BEFORE /{id} to avoid being swallowed by the wildcard

@router.get("/me")
def get_my_points(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = db.execute(
        text("SELECT balance FROM mm_portal.user_points WHERE user_id = :user_id"),
        {"user_id": current_user.id},
    ).mappings().first()

    if not result:
        db.execute(
            text("INSERT INTO mm_portal.user_points (user_id, balance) VALUES (:user_id, 750)"),
            {"user_id": current_user.id},
        )
        db.commit()
        return {"balance": 750}

    return {"balance": result["balance"]}


@router.post("/me/deduct")
def deduct_my_points(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    points = payload.get("points")
    if not isinstance(points, (int, float)) or points <= 0:
        raise HTTPException(status_code=400, detail="Invalid points amount")

    result = db.execute(
        text("SELECT balance FROM mm_portal.user_points WHERE user_id = :user_id"),
        {"user_id": current_user.id},
    ).mappings().first()

    if not result:
        raise HTTPException(status_code=404, detail="User points record not found")

    if result["balance"] < points:
        raise HTTPException(status_code=400, detail="Insufficient points")

    updated = db.execute(
        text(
            "UPDATE mm_portal.user_points SET balance = balance - :points "
            "WHERE user_id = :user_id RETURNING balance"
        ),
        {"points": points, "user_id": current_user.id},
    ).mappings().first()
    db.commit()

    return {"balance": updated["balance"]}


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


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schema.UserPointsResponse)
def create_item(
    payload: schema.UserPointsCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.create(db, payload.dict())


@router.put("/{id}")
def update_item(
    id: Any,
    payload: schema.UserPointsUpdate,
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
