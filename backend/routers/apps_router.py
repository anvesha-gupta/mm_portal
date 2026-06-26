from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
from services import apps as apps_service
from schemas import apps as apps_schema

router = APIRouter(prefix="/api/apps", tags=["Apps"])


@router.get("/", response_model=list[apps_schema.AppResponse])
def list_apps(db: Session = Depends(get_db)):
    return apps_service.get_all(db)


@router.get("/{id}")
def get_app(id: Any, db: Session = Depends(get_db)):
    item = apps_service.get_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="App not found")
    return item


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=apps_schema.AppResponse)
def create_app(payload: apps_schema.AppCreate, db: Session = Depends(get_db)):
    created = apps_service.create(db, payload.dict())
    return created


@router.put("/{id}")
def update_app(id: Any, payload: apps_schema.AppUpdate, db: Session = Depends(get_db)):
    updated = apps_service.update(db, id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="App not found or no changes provided")
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_app(id: Any, db: Session = Depends(get_db)):
    deleted = apps_service.delete(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="App not found")
    return
