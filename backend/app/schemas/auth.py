# ==========================================
# Authentication Schemas
# ==========================================
# Schemas for user login request and login response.
# ==========================================

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    """
    Schema for user login request.
    """
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=8, description="Account password")


class LoginResponse(BaseModel):
    """
    Schema for user login response.
    """
    message: str = Field(default="Login Successful", description="Response message")
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User details")


# Alias for compatibility with existing code
Token = LoginResponse
