import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..schemas.verity_schemas import VerificationReportResponse
from ..services.decision_engine import decision_engine
from ..services.face_detection import face_detector
from ..services.preprocessing import preprocessor
from ..models.face_matcher import face_matcher
from ..models.model_loader import model_adapter
from ..services.document_analysis import document_analyzer
from ..services.liveness_detection import liveness_engine
from ..utils.file_validation import validate_image_bytes
from ..models.db_models import get_db, VerificationRecord, AuditLog
from ..config import settings

router = APIRouter(prefix="/v1/verification", tags=["Verification Decision Engine"])

@router.post("/evaluate", response_model=VerificationReportResponse)
async def evaluate_verification_session(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
):
    """
    Synthesizes independent multi-vector verification telemetry:
    1. Image Authenticity
    2. Identity Match
    3. Liveness PAD
    4. Document Integrity
    Applies configurable decision policies without computing misleading pseudo-probabilities.
    """
    policy = payload.get("policy", "BALANCED")
    v_id = payload.get("verification_id") or str(uuid.uuid4())

    decision_report = decision_engine.evaluate_verification(
        image_authenticity=payload.get("image_authenticity"),
        identity_match=payload.get("identity_match"),
        liveness=payload.get("liveness"),
        document_integrity=payload.get("document_integrity"),
        policy=policy,
        verification_id=v_id,
    )

    # Save verification record with privacy retention TTL
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.DATA_RETENTION_HOURS)
    rec = VerificationRecord(
        id=v_id,
        policy=policy,
        image_authenticity_status=decision_report["image_authenticity"]["status"],
        image_authenticity_confidence=decision_report["image_authenticity"].get("confidence"),
        identity_match_status=decision_report["identity_match"]["status"],
        identity_match_score=decision_report["identity_match"].get("similarity_score"),
        liveness_status=decision_report["liveness"]["status"],
        liveness_score=decision_report["liveness"].get("liveness_score"),
        document_integrity_status=decision_report["document_integrity"]["status"],
        document_integrity_score=decision_report["document_integrity"].get("tamper_risk_score"),
        final_decision=decision_report["final_decision"],
        retention_expires_at=expires_at,
    )
    rec.set_reasons(decision_report["reasons"])
    rec.set_module_details(decision_report)
    db.add(rec)

    # Add audit log
    audit = AuditLog(
        action="EVALUATE_VERIFICATION",
        actor="system_engine",
        resource_id=v_id,
        status=decision_report["final_decision"],
        details_json=json.dumps({"policy": policy, "decision": decision_report["final_decision"]}),
    )
    db.add(audit)
    db.commit()

    return VerificationReportResponse(**decision_report)

@router.post("/full-kyc", response_model=VerificationReportResponse)
async def run_full_kyc_verification(
    document_file: UploadFile = File(..., description="Identity document photo (ID Card, Passport)"),
    selfie_file: UploadFile = File(..., description="Live selfie photograph"),
    consent: bool = Form(..., description="Informed biometric consent declaration"),
    policy: str = Form("BALANCED", description="Policy profile: STRICT, BALANCED, or FAST"),
    db: Session = Depends(get_db),
):
    """
    End-to-End Multimodal Identity Verification Pipeline:
    1. Enforces informed biometric consent.
    2. Inspects Document Authenticity & isolates document portrait.
    3. Runs Deepfake Authenticity Model on submitted selfie.
    4. Extracts 512D face embeddings and computes cosine similarity match.
    5. Synthesizes transparent multi-vector decision report.
    """
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Informed biometric consent must be granted before running identity verification.",
        )

    doc_bytes = await document_file.read()
    selfie_bytes = await selfie_file.read()

    doc_bgr = validate_image_bytes(doc_bytes)
    selfie_bgr = validate_image_bytes(selfie_bytes)

    # 1. Document Forensics
    doc_res = document_analyzer.analyze_document_bgr(doc_bgr)

    # 2. Selfie Face Detection & Deepfake Authenticity
    selfie_faces_cnt, selfie_boxes = face_detector.detect_faces(selfie_bgr)
    if selfie_faces_cnt != 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Selfie must contain exactly 1 face (detected: {selfie_faces_cnt}).",
        )

    selfie_roi = preprocessor.extract_face_roi(selfie_bgr, selfie_boxes[0])
    input_tensor, _ = preprocessor.preprocess_for_inference(selfie_roi)
    scores, auth_verdict, auth_conf = model_adapter.predict(input_tensor, face_bgr=selfie_roi)

    auth_payload = {
        "status": auth_verdict,
        "confidence": auth_conf,
        "scores": scores,
        "model_version": settings.MODEL_VERSION,
    }

    # 3. Biometric Match: Document Portrait vs Probe Selfie
    doc_portrait_bgr = doc_res.get("extracted_portrait_bgr")
    if doc_portrait_bgr is not None and doc_portrait_bgr.size > 0:
        match_res = face_matcher.match_faces(
            ref_face_bgr=doc_portrait_bgr,
            probe_face_bgr=selfie_roi,
            match_threshold=settings.FACE_MATCH_THRESHOLD,
        )
    else:
        match_res = {
            "status": "INCONCLUSIVE",
            "similarity_score": None,
            "reasons": ["No clean portrait isolated on document for biometric cross-match."],
        }

    # 4. Synthesize final decision through Decision Engine
    v_id = str(uuid.uuid4())
    decision_report = decision_engine.evaluate_verification(
        image_authenticity=auth_payload,
        identity_match=match_res,
        liveness={"status": "NOT_TESTED"},
        document_integrity=doc_res,
        policy=policy,
        verification_id=v_id,
    )

    # Persist in DB
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.DATA_RETENTION_HOURS)
    rec = VerificationRecord(
        id=v_id,
        policy=policy,
        image_authenticity_status=decision_report["image_authenticity"]["status"],
        image_authenticity_confidence=decision_report["image_authenticity"].get("confidence"),
        identity_match_status=decision_report["identity_match"]["status"],
        identity_match_score=decision_report["identity_match"].get("similarity_score"),
        liveness_status="NOT_TESTED",
        document_integrity_status=decision_report["document_integrity"]["status"],
        document_integrity_score=decision_report["document_integrity"].get("tamper_risk_score"),
        final_decision=decision_report["final_decision"],
        retention_expires_at=expires_at,
    )
    rec.set_reasons(decision_report["reasons"])
    rec.set_module_details(decision_report)
    db.add(rec)
    db.commit()

    return VerificationReportResponse(**decision_report)

@router.get("/{verification_id}", response_model=VerificationReportResponse)
async def get_verification_record(verification_id: str, db: Session = Depends(get_db)):
    """
    Retrieves full audit report for a specific verification instance by ID.
    """
    rec = db.query(VerificationRecord).filter(VerificationRecord.id == verification_id).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification record '{verification_id}' not found.",
        )

    details = rec.get_module_details()
    if details:
        return VerificationReportResponse(**details)

    # Reconstruct from columns if raw json empty
    return VerificationReportResponse(
        verification_id=rec.id,
        timestamp=rec.created_at.isoformat() if rec.created_at else datetime.now(timezone.utc).isoformat(),
        policy=rec.policy,
        final_decision=rec.final_decision,
        reasons=rec.get_reasons(),
        image_authenticity={
            "status": rec.image_authenticity_status,
            "confidence": rec.image_authenticity_confidence,
            "model_version": settings.MODEL_VERSION,
        },
        identity_match={
            "status": rec.identity_match_status,
            "similarity_score": rec.identity_match_score,
        },
        liveness={
            "status": rec.liveness_status,
            "liveness_score": rec.liveness_score,
        },
        document_integrity={
            "status": rec.document_integrity_status,
            "tamper_risk_score": rec.document_integrity_score,
        },
    )

@router.get("/history/list")
async def get_verification_history(
    limit: int = Query(25, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Lists recent verification events with audit metadata.
    """
    q = db.query(VerificationRecord).order_by(VerificationRecord.created_at.desc())
    if status_filter:
        q = q.filter(VerificationRecord.final_decision == status_filter.upper())
    records = q.limit(limit).all()

    items = []
    for r in records:
        items.append({
            "verification_id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "policy": r.policy,
            "final_decision": r.final_decision,
            "image_authenticity_status": r.image_authenticity_status,
            "identity_match_status": r.identity_match_status,
            "liveness_status": r.liveness_status,
            "document_integrity_status": r.document_integrity_status,
            "reasons": r.get_reasons(),
        })

    return {"count": len(items), "records": items}
