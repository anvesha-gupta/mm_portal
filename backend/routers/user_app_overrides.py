from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
from dependencies.auth import require_permission
from models.user import User
from services import user_app_overrides as svc
from schemas import user_app_overrides as schema

router = APIRouter(prefix="/api/user_app_overrides", tags=["UserAppOverrides"])


@router.get("/", response_model=list[schema.UserAppOverrideResponse])
def list_items(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.get_all(db)


@router.get("/{id}", response_model=schema.UserAppOverrideResponse)
def get_item(
    id: Any,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    item = svc.get_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schema.UserAppOverrideResponse)
def create_item(
    payload: schema.UserAppOverrideCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.create(db, payload.dict(exclude_none=True))


@router.put("/{id}", response_model=schema.UserAppOverrideResponse)
def update_item(
    id: Any,
    payload: schema.UserAppOverrideUpdate,
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
