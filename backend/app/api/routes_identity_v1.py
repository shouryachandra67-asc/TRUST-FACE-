import cv2
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from ..schemas.verity_schemas import IdentityMatchResponse
from ..utils.file_validation import validate_image_bytes
from ..services.face_detection import face_detector
from ..services.preprocessing import preprocessor
from ..models.face_matcher import face_matcher
from ..utils.security import cv2_to_base64_data_url
from ..config import settings

router = APIRouter(prefix="/v1/identity", tags=["Identity Matching"])

@router.post("/match", response_model=IdentityMatchResponse)
async def match_identity(
    reference_file: UploadFile = File(..., description="Authorized reference portrait or identity document"),
    probe_file: UploadFile = File(..., description="Freshly captured live selfie"),
    consent: bool = Form(..., description="Informed biometric consent confirmation"),
    match_threshold: Optional[float] = Form(None, description="Custom similarity threshold"),
):
    """
    Biometric Identity Matching Pipeline:
    1. Validates informed consent.
    2. Isolates and aligns reference face and probe selfie face.
    3. Evaluates image quality, blur, illumination, and visibility.
    4. Computes 512D deep embeddings and cosine similarity metric.
    5. Returns MATCH, NO_MATCH, or INCONCLUSIVE with manual review routing.
    """
    # 1. Enforce informed consent prerequisite
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "CONSENT_REQUIRED",
                "message": "Informed biometric consent must be explicitly granted prior to face embedding extraction.",
            },
        )

    ref_bytes = await reference_file.read()
    probe_bytes = await probe_file.read()

    ref_bgr = validate_image_bytes(ref_bytes)
    probe_bgr = validate_image_bytes(probe_bytes)

    # 2. Extract faces
    ref_count, ref_boxes = face_detector.detect_faces(ref_bgr)
    probe_count, probe_boxes = face_detector.detect_faces(probe_bgr)

    if ref_count == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "NO_REFERENCE_FACE",
                "message": "No detectable face isolated in reference image or document.",
            },
        )

    if probe_count == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "NO_PROBE_FACE",
                "message": "No detectable face isolated in submitted selfie.",
            },
        )

    if probe_count > 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "MULTIPLE_PROBE_FACES",
                "message": f"Multiple faces ({probe_count}) detected in probe selfie. Verification requires single-subject frame.",
            },
        )

    # Extract face ROIs
    ref_face = preprocessor.extract_face_roi(ref_bgr, ref_boxes[0])
    probe_face = preprocessor.extract_face_roi(probe_bgr, probe_boxes[0])

    # 3. Execute biometric embedding comparison
    match_result = face_matcher.match_faces(
        ref_face_bgr=ref_face,
        probe_face_bgr=probe_face,
        match_threshold=match_threshold or settings.FACE_MATCH_THRESHOLD,
    )

    match_id = str(uuid.uuid4())
    ref_b64 = cv2_to_base64_data_url(ref_face, format="jpeg")
    probe_b64 = cv2_to_base64_data_url(probe_face, format="jpeg")

    return IdentityMatchResponse(
        match_id=match_id,
        status=match_result["status"],
        similarity_score=match_result["similarity_score"],
        threshold_applied=match_result["threshold_applied"],
        review_threshold_applied=match_result["review_threshold_applied"],
        reference_quality=match_result["reference_quality"],
        probe_quality=match_result["probe_quality"],
        reasons=match_result["reasons"],
        requires_manual_review=match_result["requires_manual_review"],
        consent_recorded=True,
        reference_face_base64=ref_b64,
        probe_face_base64=probe_b64,
    )

@router.get("/sample-selfie")
async def get_sample_selfie(
    match_target: str = "match",
):
    """
    Returns high-resolution sample selfie for testing 1:1 biometric comparison.
    match_target: 'match' (matches Alexander Chen ID) or 'mismatch' (different subject).
    """
    from fastapi.responses import Response
    import numpy as np

    h, w = 320, 320
    img = np.ones((h, w, 3), dtype=np.uint8) * 230
    cx, cy = 160, 160

    if match_target == "match":
        rx, ry = 60, 80
        # Hair
        cv2.ellipse(img, (cx, cy - int(ry * 0.3)), (int(rx * 1.15), int(ry * 0.95)), 0, 160, 380, (40, 30, 20), -1)
        # Face skin
        cv2.ellipse(img, (cx, cy), (rx, ry), 0, 0, 360, (190, 210, 240), -1)
        # Eyebrows
        cv2.line(img, (cx - int(rx * 0.6), cy - int(ry * 0.35)), (cx - int(rx * 0.2), cy - int(ry * 0.4)), (30, 20, 10), 3)
        cv2.line(img, (cx + int(rx * 0.2), cy - int(ry * 0.4)), (cx + int(rx * 0.6), cy - int(ry * 0.35)), (30, 20, 10), 3)
        # Eye sockets
        cv2.ellipse(img, (cx - int(rx * 0.4), cy - int(ry * 0.2)), (int(rx * 0.22), int(ry * 0.14)), 0, 0, 360, (140, 160, 190), -1)
        cv2.ellipse(img, (cx + int(rx * 0.4), cy - int(ry * 0.2)), (int(rx * 0.22), int(ry * 0.14)), 0, 0, 360, (140, 160, 190), -1)
        # Eyes
        cv2.circle(img, (cx - int(rx * 0.4), cy - int(ry * 0.2)), int(rx * 0.12), (240, 240, 240), -1)
        cv2.circle(img, (cx + int(rx * 0.4), cy - int(ry * 0.2)), int(rx * 0.12), (240, 240, 240), -1)
        cv2.circle(img, (cx - int(rx * 0.4), cy - int(ry * 0.2)), int(rx * 0.06), (30, 20, 10), -1)
        cv2.circle(img, (cx + int(rx * 0.4), cy - int(ry * 0.2)), int(rx * 0.06), (30, 20, 10), -1)
        # Nose bridge
        cv2.line(img, (cx, cy - int(ry * 0.15)), (cx, cy + int(ry * 0.15)), (160, 180, 210), 3)
        cv2.ellipse(img, (cx, cy + int(ry * 0.15)), (int(rx * 0.15), int(ry * 0.08)), 0, 0, 360, (150, 170, 200), -1)
        # Mouth
        cv2.ellipse(img, (cx, cy + int(ry * 0.45)), (int(rx * 0.35), int(ry * 0.12)), 0, 0, 360, (120, 120, 190), -1)
        cv2.line(img, (cx - int(rx * 0.3), cy + int(ry * 0.45)), (cx + int(rx * 0.3), cy + int(ry * 0.45)), (60, 60, 120), 2)
    else:
        rx, ry = 60, 80
        # Dark curly hair
        cv2.ellipse(img, (cx, cy - int(ry * 0.3)), (int(rx * 1.25), int(ry * 1.05)), 0, 160, 380, (20, 20, 30), -1)
        # Face skin with different tone
        cv2.ellipse(img, (cx, cy), (rx, ry), 0, 0, 360, (150, 175, 215), -1)
        # Arched high eyebrows
        cv2.line(img, (cx - int(rx * 0.65), cy - int(ry * 0.45)), (cx - int(rx * 0.2), cy - int(ry * 0.48)), (20, 15, 10), 3)
        cv2.line(img, (cx + int(rx * 0.2), cy - int(ry * 0.48)), (cx + int(rx * 0.65), cy - int(ry * 0.45)), (20, 15, 10), 3)
        # Eye sockets
        cv2.ellipse(img, (cx - int(rx * 0.4), cy - int(ry * 0.25)), (int(rx * 0.22), int(ry * 0.14)), 0, 0, 360, (120, 140, 175), -1)
        cv2.ellipse(img, (cx + int(rx * 0.4), cy - int(ry * 0.25)), (int(rx * 0.22), int(ry * 0.14)), 0, 0, 360, (120, 140, 175), -1)
        # Eyes
        cv2.circle(img, (cx - int(rx * 0.4), cy - int(ry * 0.25)), int(rx * 0.12), (240, 240, 240), -1)
        cv2.circle(img, (cx + int(rx * 0.4), cy - int(ry * 0.25)), int(rx * 0.12), (240, 240, 240), -1)
        cv2.circle(img, (cx - int(rx * 0.4), cy - int(ry * 0.25)), int(rx * 0.06), (20, 15, 10), -1)
        cv2.circle(img, (cx + int(rx * 0.4), cy - int(ry * 0.25)), int(rx * 0.06), (20, 15, 10), -1)
        # Narrow nose
        cv2.line(img, (cx, cy - int(ry * 0.15)), (cx, cy + int(ry * 0.1)), (130, 150, 185), 3)
        # Smile
        cv2.ellipse(img, (cx, cy + int(ry * 0.4)), (int(rx * 0.38), int(ry * 0.14)), 0, 0, 180, (90, 90, 170), -1)

    _, encoded = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return Response(content=encoded.tobytes(), media_type="image/jpeg")
