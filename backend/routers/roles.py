from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
from dependencies.auth import require_permission
from models.user import User
from services import roles as roles_service
from schemas import roles as roles_schema

router = APIRouter(prefix="/api/roles", tags=["Roles"])


@router.get("/", response_model=list[roles_schema.RoleResponse])
def list_roles(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return roles_service.get_all(db)


@router.get("/{id}", response_model=roles_schema.RoleResponse)
def get_role(
    id: Any,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    item = roles_service.get_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Role not found")
    return item


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=roles_schema.RoleResponse)
def create_role(
    payload: roles_schema.RoleCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    created = roles_service.create(db, payload.dict(exclude_none=True))
    return created


@router.put("/{id}", response_model=roles_schema.RoleResponse)
def update_role(
    id: Any,
    payload: roles_schema.RoleUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    updated = roles_service.update(db, id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Role not found or no changes provided")
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    id: Any,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    deleted = roles_service.delete(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    return
