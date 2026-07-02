from pydantic import BaseModel
from typing import Optional, Dict, Any


# =========================================================
# LOGIN REQUEST
# =========================================================
class LoginRequest(BaseModel):
    username: str
    password: str


# =========================================================
# USER OBJECT INSIDE RESPONSE
# =========================================================
class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    department: Optional[str] = None
    title: Optional[str] = None
    role_id: Optional[str] = None
    role_label: Optional[str] = None
    is_active: bool
    last_login_at: Optional[str] = None


# =========================================================
# LOGIN RESPONSE (MAIN)
# =========================================================
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# =========================================================
# TOKEN RESPONSE (OPTIONAL USE)
# =========================================================
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# =========================================================
# CURRENT USER RESPONSE (REMOVED FROM SYSTEM)
# =========================================================
# NOTE: intentionally NOT used anymore to avoid import errors