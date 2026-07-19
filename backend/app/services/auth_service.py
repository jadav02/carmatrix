from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest


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


def login(db: Session, credentials: LoginRequest) -> dict:
    """
    Authenticates a user and returns a JWT access token along with user details.

    Validations:
    - Checks if the email exists in the database.
    - Verifies the password against the stored bcrypt hash.

    Returns:
        dict: Contains 'message', 'access_token', 'token_type', and 'user'.

    Raises:
        HTTPException 401: If email is not found or password is incorrect.
    """
    # Look up the user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    # If user doesn't exist OR password doesn't match, return 401
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Build the JWT payload (claims)
    token_data = {
        "sub": user.email,   # subject — standard JWT claim
        "role": user.role,   # custom claim for RBAC
    }

    # Generate the token
    access_token = create_access_token(data=token_data)

    return {
        "message": "Login Successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


# Alias for backward compatibility
login_user = login



