from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import SessionLocal
from services.auth_service import get_current_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_dep(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    return get_current_user(db, token)