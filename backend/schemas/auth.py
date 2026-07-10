from pydantic import BaseModel
from typing import Optional


# =========================================================
# LOGIN REQUEST
# =========================================================

class LoginRequest(BaseModel):
    role: str
    azure_token: str

# =========================================================
# USER RESPONSE
# =========================================================

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str

    department: Optional[str] = None
    title: Optional[str] = None

    role_id: str
    role_label: Optional[str] = None

    is_active: bool
    last_login_at: Optional[str] = None


# =========================================================
# LOGIN RESPONSE
# =========================================================

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# =========================================================
# TOKEN RESPONSE
# =========================================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"