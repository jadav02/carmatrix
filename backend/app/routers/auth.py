from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, LoginResponse, Token
from app.services import auth_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    - **name**: Full name (min 2 characters)
    - **email**: Valid and unique email address
    - **password**: Secure password (min 8 characters)
    - **role**: User role (defaults to 'user')
    """
    return auth_service.register_user(db=db, user_in=user_in)


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT access token.

    - **email**: Registered email address
    - **password**: Account password

    Returns a Bearer token to be used in the Authorization header
    for protected endpoints.
    """
    return auth_service.login(db=db, credentials=credentials)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.

    Requires a valid Bearer token in the Authorization header.

    Returns the user's id, name, email, and role.
    """
    return current_user

