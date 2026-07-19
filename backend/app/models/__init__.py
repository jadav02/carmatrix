# ==========================================
# Models Package Exports
# ==========================================
# All ORM models should be imported here.
# This ensures that when Base.metadata.create_all() is run,
# SQLAlchemy is aware of all models and creates their tables.
# ==========================================

from app.models.user import User

__all__ = ["User"]
