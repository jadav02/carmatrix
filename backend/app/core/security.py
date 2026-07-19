# ==========================================
# Cryptography and Hashing Utilities
# ==========================================
# This module provides functions for hashing passwords,
# verifying passwords, and generating/verifying JWT access tokens.
# It uses the standard python 'bcrypt' library and python-jose.
# ==========================================

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import jwt

from app.config import settings


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.

    Args:
        password: The plain text password to hash.

    Returns:
        str: The hashed password string.
    """
    # Convert password string to bytes
    password_bytes = password.encode("utf-8")
    
    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    
    # Return the hash as a UTF-8 string to be stored in the DB
    return hashed_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a bcrypt hash.

    Args:
        plain_password: The plain text password.
        hashed_password: The hashed password to verify against.

    Returns:
        bool: True if the passwords match, False otherwise.
    """
    # Convert inputs to bytes
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    
    # Perform bcrypt comparison (safe against timing attacks)
    try:
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """
    Generate a JSON Web Token (JWT) access token.

    Args:
        data: The dictionary payload to encode in the token.
        expires_delta: Optional custom expiry duration.

    Returns:
        str: Encoded JWT token string.
    """
    to_encode = data.copy()
    
    # Calculate expiry time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add expiry timestamp to claims payload
    to_encode.update({"exp": expire})
    
    # Encode JWT using the configured secret key and algorithm
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

