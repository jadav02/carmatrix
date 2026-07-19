from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserStatusUpdate, UserRoleUpdate


def get_all_users(db: Session) -> list[User]:
    """
    Returns list of all registered users for Administrator overview.
    """
    return db.query(User).all()


def update_user_status(db: Session, user_id: int, status_in: UserStatusUpdate) -> User:
    """
    Approve or Reject a user account.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    new_status = status_in.status.capitalize()
    if new_status not in ["Approved", "Rejected", "Pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Allowed: 'Approved', 'Rejected', 'Pending'."
        )

    user.status = new_status
    db.commit()
    db.refresh(user)
    return user


def update_user_role(db: Session, user_id: int, role_in: UserRoleUpdate) -> User:
    """
    Change user role.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    raw_role = role_in.role.lower()
    if "admin" in raw_role:
        role = "admin"
    elif "manager" in raw_role:
        role = "manager"
    else:
        role = "sales"

    user.role = role
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> dict:
    """
    Delete a user account.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
