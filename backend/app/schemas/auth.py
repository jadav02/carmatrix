# ==========================================
# Authentication Schemas
# ==========================================
# These schemas handle the login request and
# the JWT token response. Kept separate from
# user schemas because they serve a different
# concern (authentication vs. user CRUD).
# ==========================================

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    """
    Schema for user login.

    Accepts email and password, validates them
    against the database to issue a JWT token.
    """
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=8, description="Account password")


class Token(BaseModel):
    """
    Schema for the JWT token response returned after login.

    Attributes:
        message: Success message.
        access_token: The JWT string.
        token_type: Always 'bearer' (OAuth2 convention).
        user: The authenticated user's details.
    """
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

