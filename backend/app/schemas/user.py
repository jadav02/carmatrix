from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    """
    Schema for creating a new user (Registration).
    """
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    role: str = Field(default="user", description="User role (e.g., user or admin)")

class UserResponse(BaseModel):
    """
    Schema for returning user information (excludes password).
    """
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
