from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from sqlalchemy import text

router = APIRouter(prefix="/api/apps", tags=["Apps"])

@router.get("/")
def get_apps(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM applications"))
        return result.mappings().all()

    except Exception as e:
        print("🔥 ERROR IN /apps:", str(e))
        raise HTTPException(status_code=500, detail=str(e))