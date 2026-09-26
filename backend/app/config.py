import os
from pathlib import Path

# Application root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    # Server network settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    # Ingestion & Security limits
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024
    ALLOWED_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "webp"]
    ALLOWED_MIME_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]

    # CORS Whitelist
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Machine Learning Settings
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "efficientnet_b0_deepfake.pth"))
    MODEL_NAME: str = "EfficientNet-B0-Deepfake"
    MODEL_VERSION: str = "1.0.0"
    MODEL_DEVICE: str = os.getenv("MODEL_DEVICE", "cpu")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))
    UNCERTAINTY_MARGIN: float = float(os.getenv("UNCERTAINTY_MARGIN", "0.15"))
    MIN_FACE_SIZE: int = 40 # Minimum bounding box width/height in pixels

    # Audit Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/backend/trustface_audit.db")

settings = Settings()
