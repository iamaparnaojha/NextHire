"""
NextHire Configuration
Loads all environment variables using pydantic-like pattern with python-dotenv.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (one level up from backend/)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    """Application settings loaded from environment variables."""

    # --- API Keys ---
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # --- JWT ---
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60 * 24  # 24 hours

    # --- MongoDB ---
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "nexthire")

    # --- Server ---
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # --- File Upload ---
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx"}
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent / "uploads")

    # --- CORS ---
    CORS_ORIGINS: list = ["*"]


settings = Settings()
