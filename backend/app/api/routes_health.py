import cv2
from fastapi import APIRouter
from ..config import settings
from ..schemas.analysis import HealthResponse
from ..models.model_loader import model_adapter

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_system_health():
    """Returns operational diagnostics and model configuration state."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        model_loaded=model_adapter.is_configured,
        model_name=model_adapter.architecture_name,
        model_path=settings.MODEL_PATH,
        device=str(model_adapter.device),
        opencv_version=cv2.__version__,
    )
