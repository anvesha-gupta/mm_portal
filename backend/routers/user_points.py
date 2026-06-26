from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
from services import user_points as svc
from schemas import user_points as schema

router = APIRouter(prefix="/api/user_points", tags=["UserPoints"])


@router.get("/", response_model=list[schema.UserPointsResponse])
def list_items(db: Session = Depends(get_db)):
    return svc.get_all(db)


@router.get("/{id}")
def get_item(id: Any, db: Session = Depends(get_db)):
    item = svc.get_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schema.UserPointsResponse)
def create_item(payload: schema.UserPointsCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload.dict())


@router.put("/{id}")
def update_item(id: Any, payload: schema.UserPointsUpdate, db: Session = Depends(get_db)):
    updated = svc.update(db, id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Not found or no changes")
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(id: Any, db: Session = Depends(get_db)):
    deleted = svc.delete(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Not found")
    return
