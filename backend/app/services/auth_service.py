from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate

def register_user(db: Session, user_in: UserCreate) -> dict:
    """
    Registers a new user in the database.
    
    Validations:
    - Checks if the email is already registered.
    
    Actions:
    - Hashes the password.
    - Saves the new user to the database.
    """
    # Check for duplicate email
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    hashed_pwd = hash_password(user_in.password)

    # Create new user instance
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User Created Successfully"}
