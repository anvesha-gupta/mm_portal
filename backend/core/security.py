from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_secret_key() -> str:
    """Return the configured JWT secret key, falling back to a development default."""
    return os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET") or "development-secret-key"


def get_algorithm() -> str:
    """Return the configured JWT signing algorithm."""
    return os.getenv("JWT_ALGORITHM") or "HS256"


def get_access_token_expire_minutes() -> int:
    """Return the configured access token lifetime in minutes."""
    value = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    try:
        return int(value)
    except ValueError:
        return 60


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token for the provided subject."""
    if expires_delta is None:
        expires_delta = timedelta(minutes=get_access_token_expire_minutes())

    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": now + expires_delta,
        "type": "access",
    }

    return jwt.encode(payload, get_secret_key(), algorithm=get_algorithm())


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token."""
    return jwt.decode(
        token,
        get_secret_key(),
        algorithms=[get_algorithm()],
        audience=os.getenv("JWT_AUDIENCE") or None,
        issuer=os.getenv("JWT_ISSUER") or None,
    )
