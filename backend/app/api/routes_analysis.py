import cv2
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..schemas.analysis import AnalysisResponse
from ..utils.file_validation import validate_image_bytes
from ..services.deepfake_detection import deepfake_service

router = APIRouter(tags=["Analysis"])

@router.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    Ingests an image, enforces strict single-face detection, extracts ROI,
    executes neural authenticity classification, and generates Grad-CAM heatmaps.
    """
    # 1. Read binary into memory (ephemeral buffer)
    file_bytes = await file.read()

    # 2. Validate format, magic bytes, and rasterize to OpenCV matrix
    image_bgr = validate_image_bytes(file_bytes)

    # 3. Execute authoritative end-to-end inspection pipeline
    response = deepfake_service.analyze(image_bgr)
    return response

# Future Multimodal Endpoints (Explicitly Not Implemented per requirements)
@router.post("/analyze-video")
async def analyze_video():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Video analysis pipeline is under active research and scheduled for Phase 13.",
    )

@router.post("/analyze-audio")
async def analyze_audio():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Synthetic audio anti-spoofing pipeline is scheduled for Phase 14.",
    )

@router.post("/analyze-document")
async def analyze_document():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Document tampering forensic analysis is scheduled for Phase 15.",
    )

@router.post("/liveness")
async def analyze_liveness():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Interactive biometric challenge-response liveness is scheduled for Phase 12.",
    )
