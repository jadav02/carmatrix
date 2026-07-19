from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest


def register_user(db: Session, user_in: UserCreate) -> dict:
    """
    Registers a new user account.
    General Users ('customer') are automatically Approved without needing Admin approval.
    Staff roles ('admin', 'manager', 'sales') require Admin approval ('Pending').
    """
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_pwd = hash_password(user_in.password)

    raw_role = (user_in.role or "customer").lower()
    if "admin" in raw_role:
        role = "admin"
        init_status = "Pending"
    elif "manager" in raw_role:
        role = "manager"
        init_status = "Pending"
    elif "sales" in raw_role and "customer" not in raw_role:
        role = "sales"
        init_status = "Pending"
    else:
        role = "customer"
        init_status = "Approved"  # Customer accounts get instant approved access!

    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=role,
        status=init_status,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if init_status == "Approved":
        msg = "Registration successful! You can now sign in and start shopping."
    else:
        msg = "Registration successful. Your account is waiting for administrator approval."

    return {"message": msg, "user": {"id": new_user.id, "email": new_user.email, "role": new_user.role, "status": new_user.status}}


def verify_user_password(plain_password: str, hashed_password: str) -> bool:
    return verify_password(plain_password, hashed_password)


def login(db: Session, credentials: LoginRequest) -> dict:
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_user_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status == "Pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is waiting for administrator approval.",
        )
    elif user.status == "Rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account Rejected",
        )
    elif user.status != "Approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is waiting for administrator approval.",
        )

    token_data = {
        "sub": user.email,
        "role": user.role,
        "status": user.status,
    }

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
            "status": user.status,
        },
    }


login_user = login
