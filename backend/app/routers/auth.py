from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate
from app.services import auth_service

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
