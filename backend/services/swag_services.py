from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session


class SwagService:

    @staticmethod
    def validate_redemption(
        db: Session,
        user_id: str,
        swag_item_id: str,
    ):

        # Get user's available points
        user_points = db.execute(
            text("""
                SELECT balance
                FROM mm_portal.user_points
                WHERE user_id = :user_id
            """),
            {"user_id": user_id},
        ).mappings().first()

        if not user_points:
            raise HTTPException(
                status_code=404,
                detail="User points record not found."
            )

        # Get item's required points
        swag_item = db.execute(
            text("""
                SELECT points_cost
                FROM mm_portal.swag_items
                WHERE id = :item_id
            """),
            {"item_id": swag_item_id},
        ).mappings().first()

        if not swag_item:
            raise HTTPException(
                status_code=404,
                detail="Swag item not found."
            )

        # FR-4.3 Validation
        if user_points["balance"] < swag_item["points_cost"]:
            raise HTTPException(
                status_code=400,
                detail="Insufficient reward points."
            )

        return {
            "success": True,
            "message": "User has enough reward points.",
            "available_points": user_points["balance"],
            "required_points": swag_item["points_cost"],
        }