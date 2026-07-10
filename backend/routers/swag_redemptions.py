from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from services.swag_services import SwagService

from database import get_db
from dependencies.auth import require_permission, get_current_user
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
# FR-4.4 : Redeem swag item after validating reward points
# -------------------------------------------------------------------

@router.post("/redeem")
def redeem_swag(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Validate reward points, deduct balance,
    create redemption record and log transaction.
    Accepts swag_item_name + points_cost to look up the DB item.
    """
    from sqlalchemy import text

    swag_item_name = payload.get("swag_item_name")
    points_cost = payload.get("points_cost")

    if not swag_item_name or not points_cost:
        raise HTTPException(
            status_code=400,
            detail="swag_item_name and points_cost are required.",
        )

    # Look up the swag item in the DB by name and cost
    row = db.execute(
        text(
            "SELECT id FROM mm_portal.swag_items "
            "WHERE name = :name AND points_cost = :cost LIMIT 1"
        ),
        {"name": swag_item_name, "cost": points_cost},
    ).mappings().first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"Swag item '{swag_item_name}' not found in catalogue.",
        )

    return SwagService.redeem_item(
        db=db,
        user_id=str(current_user.id),
        swag_item_id=str(row["id"]),
    )