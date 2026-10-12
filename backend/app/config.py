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

    # Video Analysis
    ALLOWED_VIDEO_EXTENSIONS: list[str] = ["mp4", "avi", "mov", "webm"]
    MAX_VIDEO_SIZE_MB: int = int(os.getenv("MAX_VIDEO_SIZE_MB", "50"))
    VIDEO_SAMPLE_FPS: int = int(os.getenv("VIDEO_SAMPLE_FPS", "2"))
    MAX_VIDEO_FRAMES: int = int(os.getenv("MAX_VIDEO_FRAMES", "30"))

    # Security, JWT & Sessions
    SECRET_KEY: str = os.getenv("SECRET_KEY", "verityai-production-super-secret-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    LIVENESS_SESSION_TTL_SECONDS: int = 300 # 5 minutes

    # Biometric & Fraud Thresholds
    FACE_MATCH_THRESHOLD: float = float(os.getenv("FACE_MATCH_THRESHOLD", "0.65"))
    FACE_MATCH_REVIEW_THRESHOLD: float = float(os.getenv("FACE_MATCH_REVIEW_THRESHOLD", "0.52"))
    LIVENESS_PASS_SCORE: float = float(os.getenv("LIVENESS_PASS_SCORE", "0.70"))
    DOCUMENT_TAMPER_THRESHOLD: float = float(os.getenv("DOCUMENT_TAMPER_THRESHOLD", "0.35"))

    # Privacy & Retention
    DATA_RETENTION_HOURS: int = int(os.getenv("DATA_RETENTION_HOURS", "24"))
    ZERO_PERSISTENCE_MODE: bool = os.getenv("ZERO_PERSISTENCE_MODE", "false").lower() in ("true", "1", "yes")

    # Audit Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/backend/trustface_audit.db")

settings = Settings()
