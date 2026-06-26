from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
from services import users as svc
from schemas import users as schema

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/", response_model=list[schema.UserResponse])
def list_users(db: Session = Depends(get_db)):
    return svc.get_all(db)


@router.get("/{id}")
def get_user(id: Any, db: Session = Depends(get_db)):
    item = svc.get_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="User not found")
    return item


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schema.UserResponse)
def create_user(payload: schema.UserResponse, db: Session = Depends(get_db)):
    created = svc.create(db, payload.dict())
    return created


@router.put("/{id}")
def update_user(id: Any, payload: schema.UserResponse, db: Session = Depends(get_db)):
    updated = svc.update(db, id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found or no changes provided")
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(id: Any, db: Session = Depends(get_db)):
    deleted = svc.delete(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return
