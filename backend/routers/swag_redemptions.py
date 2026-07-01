from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from services.swag_services import SwagService

from database import get_db
from dependencies.auth import require_permission
from models.user import User
from services import swag_redemptions as svc
from schemas import swag_redemptions as schema

router = APIRouter(prefix="/api/swag_redemptions", tags=["SwagRedemptions"])


@router.get("/", response_model=list[schema.SwagRedemptionResponse])
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


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schema.SwagRedemptionResponse)
def create_item(
    payload: schema.SwagRedemptionCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_permission("admin")),
):
    return svc.create(db, payload.dict())


@router.put("/{id}")
def update_item(
    id: Any,
    payload: schema.SwagRedemptionUpdate,
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


# -------------------------------------------------------------------
# FR-4.3 : Validate reward points before swag redemption
# -------------------------------------------------------------------

@router.post("/redeem")
def validate_redemption(
    payload: dict,
    db: Session = Depends(get_db),
):
    """
    Validate whether a user has sufficient reward points
    before allowing swag redemption.
    """

    user_id = payload.get("user_id")
    swag_item_id = payload.get("swag_item_id")

    if not user_id or not swag_item_id:
        raise HTTPException(
            status_code=400,
            detail="user_id and swag_item_id are required.",
        )

    return SwagService.validate_redemption(
        db=db,
        user_id=user_id,
        swag_item_id=swag_item_id,
    )