from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    """
    Schema for registering a new user. Default status is Pending.
    """
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password (minimum 6 characters)")
    role: str = Field(default="sales", description="User role ('admin', 'manager', 'sales')")

class UserStatusUpdate(BaseModel):
    """
    Schema for Administrator to approve or reject a user.
    """
    status: str = Field(..., description="Status ('Approved' or 'Rejected')")

class UserRoleUpdate(BaseModel):
    """
    Schema for Administrator to change a user's role.
    """
    role: str = Field(..., description="New role ('admin', 'manager', 'sales')")

class UserResponse(BaseModel):
    """
    Schema for returning user information.
    """
    id: int
    name: str
    email: EmailStr
    role: str
    status: str

    class Config:
        from_attributes = True
