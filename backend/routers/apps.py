from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from sqlalchemy import text
from dependencies.auth import require_app_access
from models.user import User

router = APIRouter(prefix="/api/apps", tags=["Apps"])


@router.get("/")
def get_apps(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_app_access("apps")),
):
    try:
        result = db.execute(text("SELECT * FROM applications"))
        return result.mappings().all()

    except Exception as e:
        print("🔥 ERROR IN /apps:", str(e))
        raise HTTPException(status_code=500, detail=str(e))