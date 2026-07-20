"""
Auth Pydantic Models — Request/Response schemas for authentication.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ──────────────────────────────────────────────
#  Request Models
# ──────────────────────────────────────────────
class UserRegister(BaseModel):
    """Registration request body."""
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password")


class UserLogin(BaseModel):
    """Login request body."""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")


# ──────────────────────────────────────────────
#  Response Models
# ──────────────────────────────────────────────
class UserResponse(BaseModel):
    """User data returned to the client (no password)."""
    id: str = Field(..., description="User ID")
    name: str
    email: str
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    """Login/Register success response."""
    token: str = Field(..., description="JWT access token")
    user: UserResponse


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
