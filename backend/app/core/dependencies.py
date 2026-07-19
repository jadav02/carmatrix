# ==========================================
# FastAPI Dependencies
# ==========================================
# Reusable dependency functions injected into
# route handlers via FastAPI's Depends() system.
#
# get_current_user:
#   Extracts the JWT from the Authorization header,
#   decodes it, looks up the user in the database,
#   and returns the User ORM object. If anything
#   fails, a 401 Unauthorized is raised.
# ==========================================

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User


# ==========================================
# OAuth2 Scheme
# ==========================================
# This tells FastAPI to look for a Bearer token
# in the Authorization header.  The tokenUrl is
# only used by the Swagger "Authorize" button —
# it points to our login endpoint.
# ==========================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the JWT token and return the authenticated User.

    This dependency is injected into any route that requires
    authentication.  It:
      1. Decodes the JWT using the app's SECRET_KEY.
      2. Extracts the 'sub' claim (user email).
      3. Queries the database for that user.
      4. Returns the User ORM object.

    Raises:
        HTTPException 401: If the token is invalid, expired,
            missing the 'sub' claim, or the user no longer exists.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        # Extract the subject claim (email)
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Look up the user in the database
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user
