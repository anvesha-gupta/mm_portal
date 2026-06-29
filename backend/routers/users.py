from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
from dependencies.auth import require_permission
from models.user import User
from services import users as svc
from schemas import users as schema

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/", response_model=list[schema.UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.get_all(db)


@router.get("/{id}", response_model=schema.UserResponse)
def get_user(
    id: Any,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    item = svc.get_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="User not found")
    return item


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schema.UserResponse)
def create_user(
    payload: schema.UserCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    created = svc.create(db, payload.dict(exclude_none=True))
    return created


@router.put("/{id}", response_model=schema.UserResponse)
def update_user(
    id: Any,
    payload: schema.UserUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    updated = svc.update(db, id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found or no changes provided")
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    id: Any,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    deleted = svc.delete(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return
