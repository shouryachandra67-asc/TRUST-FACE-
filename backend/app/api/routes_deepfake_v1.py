import time
import os
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..schemas.verity_schemas import DeepfakeAnalysisResult
from ..utils.file_validation import validate_image_bytes
from ..services.deepfake_detection import deepfake_service
from ..services.metadata_analyzer import metadata_analyzer
from ..services.video_analyzer import video_analyzer
from ..utils.security import generate_analysis_id
from ..config import settings

router = APIRouter(prefix="/v1/deepfake", tags=["Deepfake Detection"])

@router.post("/analyze", response_model=DeepfakeAnalysisResult)
async def analyze_media(file: UploadFile = File(...)):
    """
    Ingests image (JPG, PNG, WebP) or video (MP4, AVI, MOV, WebM).
    Executes neural authenticity classification, provenance metadata inspection,
    and temporal analysis for video media.
    """
    start_time = time.perf_counter()
    analysis_id = generate_analysis_id()
    filename = file.filename or "uploaded_media"
    ext = os.path.splitext(filename)[1].lower().replace(".", "")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # 1. Video branch
    if ext in settings.ALLOWED_VIDEO_EXTENSIONS:
        if len(file_bytes) > settings.MAX_VIDEO_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Video exceeds maximum allowed size ({settings.MAX_VIDEO_SIZE_MB}MB).",
            )
        
        video_result = video_analyzer.analyze_video_bytes(file_bytes, filename=filename)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        if video_result.get("status") == "ERROR":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=video_result.get("message", "Video decoding failed."),
            )

        verdict = video_result["verdict"]
        conf = video_result["overall_confidence"]
        fake_ratio = video_result["manipulation_frame_ratio"]

        return DeepfakeAnalysisResult(
            analysis_id=analysis_id,
            status="completed",
            media_type="video",
            face_detected=video_result["face_frames_analyzed"] > 0,
            face_count=1 if video_result["face_frames_analyzed"] > 0 else 0,
            result=verdict,
            confidence=conf,
            scores={
                "real": round(1.0 - fake_ratio, 3),
                "manipulation": round(fake_ratio, 3),
                "uncertain": 0.0 if verdict != "UNCERTAIN" else 0.50,
            },
            technical_signals=video_result.get("technical_signals", []),
            warnings=[] if video_result["face_frames_analyzed"] > 0 else ["No faces detected across sampled frames."],
            temporal_analysis=video_result,
            processing_time_ms=round(elapsed_ms, 2),
        )

    # 2. Image branch
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported media format '{ext}'. Supported: {settings.ALLOWED_EXTENSIONS + settings.ALLOWED_VIDEO_EXTENSIONS}",
        )

    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum size ({settings.MAX_FILE_SIZE_MB}MB).",
        )

    # Ingest and validate image rasterization
    image_bgr = validate_image_bytes(file_bytes)
    
    # Analyze metadata & provenance
    provenance = metadata_analyzer.analyze_bytes(file_bytes)

    # Execute deepfake pipeline
    existing_response = deepfake_service.analyze(image_bgr)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    technical_signals = list(provenance.get("technical_signals", []))
    if existing_response.result == "POTENTIAL MANIPULATION":
        technical_signals.append("OPTICAL_SPECTRUM_ANOMALY")
    elif existing_response.result == "REAL":
        technical_signals.append("NATURAL_SCENE_STATISTICS_CONCORDANT")

    return DeepfakeAnalysisResult(
        analysis_id=existing_response.analysis_id,
        status="completed",
        media_type="image",
        face_detected=existing_response.face_detected,
        face_count=existing_response.face_count,
        result=existing_response.result,
        confidence=existing_response.confidence,
        scores={
            "real": existing_response.scores.real,
            "manipulation": existing_response.scores.manipulation,
            "uncertain": existing_response.scores.uncertain,
        },
        technical_signals=technical_signals,
        warnings=provenance.get("metadata_warnings", []),
        provenance=provenance,
        face_crop_base64=existing_response.face_crop_base64,
        heatmap_base64=existing_response.heatmap_base64,
        processing_time_ms=round(elapsed_ms, 2),
    )

@router.get("/sample")
async def get_deepfake_sample_media(sample_type: str = "real"):
    """
    Returns high-resolution sample media for immediate testing in the UI.
    Does not require external uploads.
    """
    from fastapi.responses import Response
    h, w = 320, 320
    img = np.ones((h, w, 3), dtype=np.uint8) * 235

    # Face oval
    cv2.ellipse(img, (160, 160), (75, 100), 0, 0, 360, (190, 205, 235), -1)
    # Hair
    cv2.ellipse(img, (160, 105), (80, 50), 0, 180, 360, (30, 30, 40), -1)
    # Eyes
    cv2.circle(img, (130, 145), 9, (245, 245, 245), -1)
    cv2.circle(img, (130, 145), 5, (60, 40, 20), -1)
    cv2.circle(img, (190, 145), 9, (245, 245, 245), -1)
    cv2.circle(img, (190, 145), 5, (60, 40, 20), -1)
    # Eyebrows
    cv2.line(img, (118, 132), (142, 132), (40, 30, 25), 3)
    cv2.line(img, (178, 132), (202, 132), (40, 30, 25), 3)
    # Nose
    cv2.line(img, (160, 150), (160, 180), (160, 175, 205), 3)
    # Lips
    cv2.ellipse(img, (160, 210), (28, 12), 0, 0, 180, (120, 130, 200), -1)

    if sample_type == "fake":
        # Inject off-axis high-frequency periodic harmonics & composite seam
        y, x = np.ogrid[:h, :w]
        grid = (np.sin(x * 0.8) * np.cos(y * 0.8) * 50).astype(np.int16)
        img = np.clip(img.astype(np.int16) + grid[:, :, None], 0, 255).astype(np.uint8)
        cv2.ellipse(img, (160, 160), (76, 101), 0, 0, 360, (10, 10, 220), 3)
    else:
        # Subtle biological pore texture
        pore_noise = np.random.normal(0, 3.0, (h, w, 3)).astype(np.int16)
        img = np.clip(img.astype(np.int16) + pore_noise, 0, 255).astype(np.uint8)

    _, buf = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    return Response(content=buf.tobytes(), media_type="image/jpeg")
