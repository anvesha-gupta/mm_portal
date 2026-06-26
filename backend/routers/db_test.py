from fastapi import APIRouter
from database import test_connection

router = APIRouter(
    prefix="/api",
    tags=["Database"]
)

@router.get("/db-test")
def db_test():
    db_name = test_connection()

    return {
        "connected": True,
        "database": db_name
    }