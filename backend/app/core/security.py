# ==========================================
# Cryptography and Hashing Utilities
# ==========================================
# This module provides functions for hashing passwords
# and verifying passwords against hashed values.
# It uses the standard python 'bcrypt' library directly,
# bypassing the deprecated 'passlib' wrapper to ensure compatibility
# with modern Python 3.13 and bcrypt 5.0.
# ==========================================

import bcrypt


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
