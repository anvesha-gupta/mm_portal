from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# =========================================================
# CONFIG
# =========================================================

def get_secret_key() -> str:
    return (
        os.getenv("JWT_SECRET_KEY")
        or os.getenv("JWT_SECRET")
        or "development-secret-key"
    )


def get_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM") or "HS256"


def get_access_token_expire_minutes() -> int:
    try:
        return int(
            os.getenv(
                "ACCESS_TOKEN_EXPIRE_MINUTES",
                "60",
            )
        )
    except ValueError:
        return 60


# =========================================================
# PASSWORDS
# =========================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# =========================================================
# JWT
# =========================================================

def create_access_token(
    subject: Any,
    expires_delta: timedelta | None = None,
) -> str:

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=get_access_token_expire_minutes()
        )

    now = datetime.now(timezone.utc)

    # --------------------------------------------
    # If a dictionary is supplied, use it directly.
    # Otherwise wrap it as {"sub": "..."}
    # --------------------------------------------

    if isinstance(subject, dict):
        payload = subject.copy()
    else:
        payload = {
            "sub": str(subject),
        }

    payload["iat"] = now
    payload["exp"] = now + expires_delta
    payload["type"] = "access"

    return jwt.encode(
        payload,
        get_secret_key(),
        algorithm=get_algorithm(),
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:

    return jwt.decode(
        token,
        get_secret_key(),
        algorithms=[get_algorithm()],
        options={
            "verify_aud": False,
            "verify_iss": False,
        },
    )