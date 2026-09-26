from fastapi import APIRouter, HTTPException, status
from ..schemas.analysis import AnalysisResponse, FrameAnalysisRequest
from ..utils.file_validation import validate_image_bytes
from ..utils.security import base64_to_bytes
from ..services.deepfake_detection import deepfake_service

router = APIRouter(tags=["Camera"])

@router.post("/analyze-frame", response_model=AnalysisResponse)
async def analyze_frame(request: FrameAnalysisRequest):
    """
    Ingests a camera frame in Base64 format, validates magic bytes,
    enforces single-face detection, and runs neural authenticity analysis.
    """
    try:
        raw_bytes = base64_to_bytes(request.frame_base64)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed Base64 camera frame payload.",
        )

    # Validate image bytes and convert to OpenCV matrix
    image_bgr = validate_image_bytes(raw_bytes)

    # Execute inspection pipeline
    response = deepfake_service.analyze(image_bgr)
    return response
