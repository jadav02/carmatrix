# ==========================================
# Application Settings
# ==========================================
# This file centralizes ALL configuration for the application.
# Settings are loaded from environment variables or a .env file.
# This ensures secrets (like JWT keys) are never hardcoded.
# ==========================================

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Attributes:
        APP_NAME: Display name of the application.
        APP_VERSION: Current version of the API.
        API_PREFIX: URL prefix for all API routes (e.g., /api).
        DEBUG: Enable debug mode (never True in production).

        DATABASE_URL: SQLite connection string.

        SECRET_KEY: Secret key used to sign JWT tokens.
        ALGORITHM: JWT signing algorithm.
        ACCESS_TOKEN_EXPIRE_MINUTES: Token expiry duration in minutes.
    """

    # ---- Application ----
    APP_NAME: str = "CarMatrix API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = True

    # ---- Database ----
    DATABASE_URL: str = "sqlite:///./dealership.db"

    # ---- JWT Authentication ----
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        """
        Pydantic settings configuration.

        env_file: Path to the .env file to load variables from.
        env_file_encoding: Encoding of the .env file.
        case_sensitive: Environment variable names are case-sensitive.
        """
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# ==========================================
# Create a single shared settings instance.
# Import this object wherever you need config values.
# Example: from app.config import settings
# ==========================================
settings = Settings()
