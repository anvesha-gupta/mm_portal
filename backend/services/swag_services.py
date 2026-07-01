from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from services.email_service import EmailService


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

        # Get item's details
        swag_item = db.execute(
            text("""
                SELECT
                    name,
                    points_cost
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

    @staticmethod
    def redeem_item(
        db: Session,
        user_id: str,
        swag_item_id: str,
    ):
        """
        Redeem a swag item:
        1. Validate reward points
        2. Deduct points
        3. Create redemption record
        4. Log transaction
        5. Send email notification
        """

        # Validate reward points
        validation = SwagService.validate_redemption(
            db=db,
            user_id=user_id,
            swag_item_id=swag_item_id,
        )

        required_points = validation["required_points"]

        # Get swag item details
        swag_item = db.execute(
            text("""
                SELECT
                    name,
                    points_cost
                FROM mm_portal.swag_items
                WHERE id = :item_id
            """),
            {"item_id": swag_item_id},
        ).mappings().first()

        # Get user details
        user = db.execute(
            text("""
                SELECT
                    display_name,
                    email
                FROM mm_portal.users
                WHERE id = :user_id
            """),
            {"user_id": user_id},
        ).mappings().first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # Deduct points from user's balance
        db.execute(
            text("""
                UPDATE mm_portal.user_points
                SET balance = balance - :points
                WHERE user_id = :user_id
            """),
            {
                "points": required_points,
                "user_id": user_id,
            },
        )

        # Create redemption record
        redemption = db.execute(
            text("""
                INSERT INTO mm_portal.swag_redemptions
                (
                    user_id,
                    swag_item_id,
                    points_spent,
                    status
                )
                VALUES
                (
                    :user_id,
                    :swag_item_id,
                    :points_spent,
                    'pending'
                )
                RETURNING id
            """),
            {
                "user_id": user_id,
                "swag_item_id": swag_item_id,
                "points_spent": required_points,
            },
        ).mappings().first()

        redemption_id = redemption["id"]

        # Log points transaction
        db.execute(
            text("""
                INSERT INTO mm_portal.points_transactions
                (
                    user_id,
                    amount,
                    transaction_type,
                    reference_id,
                    notes
                )
                VALUES
                (
                    :user_id,
                    :amount,
                    'redemption',
                    :reference_id,
                    'Swag redemption'
                )
            """),
            {
                "user_id": user_id,
                "amount": -required_points,
                "reference_id": redemption_id,
            },
        )

        # Commit database changes
        db.commit()

        # Send email notification
        EmailService.send_redemption_notification(
            db=db,
            user_name=user["display_name"],
            user_email=user["email"],
            swag_item_name=swag_item["name"],
            points_spent=required_points,
        )

        return {
            "success": True,
            "message": "Swag redeemed successfully.",
            "redemption_id": redemption_id,
            "points_spent": required_points,
        }