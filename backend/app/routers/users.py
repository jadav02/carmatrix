from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import require_admin
from app.schemas.user import UserResponse, UserStatusUpdate, UserRoleUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Administrator: View all registered users.
    """
    return user_service.get_all_users(db)


@router.put("/{user_id}/status", response_model=UserResponse)
def update_status(
    user_id: int,
    status_in: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Administrator: Approve or Reject user account.
    """
    return user_service.update_user_status(db, user_id, status_in)


@router.put("/{user_id}/role", response_model=UserResponse)
def update_role(
    user_id: int,
    role_in: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Administrator: Change user role.
    """
    return user_service.update_user_role(db, user_id, role_in)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Administrator: Delete user.
    """
    return user_service.delete_user(db, user_id)
