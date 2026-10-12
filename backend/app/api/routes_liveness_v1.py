import cv2
import numpy as np
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session
from ..schemas.verity_schemas import LivenessSessionResponse, LivenessVerifyResponse
from ..services.liveness_detection import liveness_engine
from ..models.db_models import get_db, LivenessSessionRecord
from ..utils.file_validation import validate_image_bytes

router = APIRouter(prefix="/v1/liveness", tags=["Liveness & PAD"])

@router.post("/session", response_model=LivenessSessionResponse)
async def create_liveness_session(db: Session = Depends(get_db)):
    """
    Initializes a cryptographically signed liveness session with randomized action challenges,
    freshness nonce, and 5-minute expiry (TTL) for anti-replay defense.
    """
    session_info = liveness_engine.create_session()
    
    # Persist in session store
    db_session = LivenessSessionRecord(
        id=session_info["session_id"],
        expires_at=datetime.fromisoformat(session_info["expires_at"]),
        nonce=session_info["nonce"],
    )
    db_session.set_challenges(session_info["challenges"])
    db.add(db_session)
    db.commit()

    return LivenessSessionResponse(
        session_id=session_info["session_id"],
        nonce=session_info["nonce"],
        challenges=session_info["challenges"],
        created_at=session_info["created_at"],
        expires_at=session_info["expires_at"],
        ttl_seconds=session_info["ttl_seconds"],
        instructions=session_info["instructions"],
        disclaimer=session_info["disclaimer"],
    )

@router.post("/verify", response_model=LivenessVerifyResponse)
async def verify_liveness(
    session_id: str = Form(...),
    nonce: str = Form(...),
    frames: List[UploadFile] = File(..., description="Chronological sequence of camera capture frames"),
    db: Session = Depends(get_db),
):
    """
    Validates chronological camera frames against issued challenges.
    Inspects 2D FFT moiré interference (screen replay defense),
    specular paper reflections (printed photo defense), and facial motion dynamics.
    Enforces single-use replay protection.
    """
    # 1. Look up session
    db_session = db.query(LivenessSessionRecord).filter(LivenessSessionRecord.id == session_id).first()
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liveness session not found or invalid session ID.",
        )

    # 2. Replay & nonce protection
    if db_session.nonce != nonce:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cryptographic session nonce mismatch. Replay or tampering detected.",
        )

    if db_session.is_completed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session has already been consumed. Replay attack blocked.",
        )

    now = datetime.now(timezone.utc)
    # Ensure timezone aware comparison
    exp_at = db_session.expires_at
    if exp_at.tzinfo is None:
        exp_at = exp_at.replace(tzinfo=timezone.utc)
    if now > exp_at:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Liveness challenge session has expired. Please initiate a fresh session.",
        )

    if not frames or len(frames) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 frames required for temporal liveness verification.",
        )

    # 3. Decode frame binaries
    decoded_frames: List[np.ndarray] = []
    for f in frames[:15]: # Process up to 15 frames
        f_bytes = await f.read()
        try:
            mat = validate_image_bytes(f_bytes)
            decoded_frames.append(mat)
        except Exception:
            continue

    if len(decoded_frames) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not decode sufficient valid image frames for motion verification.",
        )

    # 4. Run Liveness PAD Engine
    challenges = db_session.get_challenges()
    result = liveness_engine.verify_liveness_frames(
        frames_bgr=decoded_frames,
        expected_challenges=challenges,
        session_created_at=db_session.created_at.replace(tzinfo=timezone.utc) if db_session.created_at.tzinfo is None else db_session.created_at,
    )

    # 5. Mark session completed (consume nonce)
    db_session.is_completed = True
    db_session.is_verified = (result["status"] == "PASS")
    db.commit()

    return LivenessVerifyResponse(
        session_id=session_id,
        status=result["status"],
        liveness_score=result["liveness_score"],
        natural_motion_detected=result["natural_motion_detected"],
        motion_magnitude_px=result["motion_magnitude_px"],
        screen_moire_risk=result["screen_moire_risk"],
        paper_specular_risk=result["paper_specular_risk"],
        presentation_attack_signals=result["presentation_attack_signals"],
        frames_analyzed=result["frames_analyzed"],
        reasons=result["reasons"],
        disclaimer=result["disclaimer"],
    )
