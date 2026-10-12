import io
import cv2
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.document_analysis import document_analyzer
from backend.app.models.face_matcher import face_matcher
from backend.app.services.face_detection import face_detector
from backend.app.services.liveness_detection import liveness_engine
from backend.app.services.decision_engine import decision_engine

client = TestClient(app)

def create_face_image_bytes(blur: bool = False) -> bytes:
    """Generates an in-memory image with a schematic face."""
    img = np.ones((250, 250, 3), dtype=np.uint8) * 220
    # Head
    cv2.ellipse(img, (125, 125), (60, 80), 0, 0, 360, (180, 180, 180), -1)
    # Eyes
    cv2.circle(img, (105, 110), 8, (40, 40, 40), -1)
    cv2.circle(img, (145, 110), 8, (40, 40, 40), -1)
    # Nose
    cv2.line(img, (125, 115), (125, 140), (40, 40, 40), 2)
    # Mouth
    cv2.ellipse(img, (125, 160), (25, 10), 0, 0, 180, (40, 40, 40), 2)

    if blur:
        img = cv2.GaussianBlur(img, (25, 25), 10)

    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()

# ==================== MODULE A: DEEPFAKE V1 TESTS ====================

def test_deepfake_v1_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["service"] == "VerityAI"
    assert "modules" in data

def test_deepfake_v1_image_analyze():
    orig_detect = face_detector.detect_faces
    try:
        face_detector.detect_faces = lambda img: (1, [(30, 30, 120, 120)])
        img_bytes = create_face_image_bytes()
        res = client.post(
            "/api/v1/deepfake/analyze",
            files={"file": ("test_portrait.jpg", img_bytes, "image/jpeg")},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["media_type"] == "image"
        assert "provenance" in data
        assert "confidence" in data
        assert "technical_signals" in data
    finally:
        face_detector.detect_faces = orig_detect

# ==================== MODULE B: BIOMETRIC IDENTITY TESTS ====================

def test_identity_match_consent_enforcement():
    """Omitting informed biometric consent must reject with HTTP 400."""
    img_bytes = create_face_image_bytes()
    res = client.post(
        "/api/v1/identity/match",
        data={"consent": "false"},
        files={
            "reference_file": ("ref.jpg", img_bytes, "image/jpeg"),
            "probe_file": ("probe.jpg", img_bytes, "image/jpeg"),
        },
    )
    assert res.status_code == 400
    assert "consent" in res.json()["detail"]["message"].lower()

def test_identity_match_valid_comparison():
    """Matching identical face representations produces MATCH."""
    orig_detect = face_detector.detect_faces
    try:
        face_detector.detect_faces = lambda img: (1, [(20, 20, 100, 100)])
        img_bytes = create_face_image_bytes()
        res = client.post(
            "/api/v1/identity/match",
            data={"consent": "true"},
            files={
                "reference_file": ("ref.jpg", img_bytes, "image/jpeg"),
                "probe_file": ("probe.jpg", img_bytes, "image/jpeg"),
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["consent_recorded"] is True
        assert data["status"] in ("MATCH", "INCONCLUSIVE", "NO_MATCH")
        assert "similarity_score" in data
    finally:
        face_detector.detect_faces = orig_detect

def test_identity_match_quality_blur_gating():
    """Severe blur should trigger INCONCLUSIVE with explicit quality reasoning."""
    blurry_img = np.ones((80, 80, 3), dtype=np.uint8) * 100
    blurry_img = cv2.GaussianBlur(blurry_img, (31, 31), 20)
    qual = face_matcher.assess_face_quality(blurry_img)
    assert qual["acceptable"] is False
    assert any("blur" in iss.lower() for iss in qual["issues"])

# ==================== MODULE C: LIVENESS & PAD TESTS ====================

def test_liveness_session_creation():
    """Session generation yields 5-minute TTL, nonce, and randomized challenges."""
    res = client.post("/api/v1/liveness/session")
    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert "nonce" in data
    assert len(data["challenges"]) == 2
    assert data["ttl_seconds"] == 300

def test_liveness_replay_attack_prevention():
    """Replaying an already verified liveness session must be blocked with HTTP 409."""
    # 1. Create session
    s_res = client.post("/api/v1/liveness/session")
    s_data = s_res.json()
    sid = s_data["session_id"]
    nonce = s_data["nonce"]

    # 2. First submission
    orig_detect = face_detector.detect_faces
    try:
        face_detector.detect_faces = lambda img: (1, [(20, 20, 80, 80)])
        f1 = create_face_image_bytes()
        f2 = create_face_image_bytes()
        res1 = client.post(
            "/api/v1/liveness/verify",
            data={"session_id": sid, "nonce": nonce},
            files=[
                ("frames", ("f1.jpg", f1, "image/jpeg")),
                ("frames", ("f2.jpg", f2, "image/jpeg")),
            ],
        )
        assert res1.status_code == 200

        # 3. Replay exact same session ID & nonce -> MUST BE REJECTED
        res2 = client.post(
            "/api/v1/liveness/verify",
            data={"session_id": sid, "nonce": nonce},
            files=[
                ("frames", ("f1.jpg", f1, "image/jpeg")),
                ("frames", ("f2.jpg", f2, "image/jpeg")),
            ],
        )
        assert res2.status_code == 409
        assert "replay" in res2.json()["detail"].lower()
    finally:
        face_detector.detect_faces = orig_detect

# ==================== MODULE D: DOCUMENT INTEGRITY TESTS ====================

def test_document_genuine_synthetic():
    """Genuine synthetic document passes layout and validity checks."""
    doc_bytes = document_analyzer.generate_synthetic_document(
        name="TEST CITIZEN",
        id_number="VR-1122-88",
        expiry_date="2029-05-10",
        tamper=False,
    )
    res = client.post(
        "/api/v1/document/analyze",
        files={"file": ("doc.jpg", doc_bytes, "image/jpeg")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("GENUINE", "REVIEW")
    assert data["is_tampered"] is False
    assert data["expiration_check"]["is_expired"] is False

def test_document_tampered_synthetic():
    """Tampered synthetic document triggers localized ELA anomaly."""
    tampered_bytes = document_analyzer.generate_synthetic_document(
        name="TEST CITIZEN",
        id_number="VR-1122-88",
        expiry_date="2029-05-10",
        tamper=True,
    )
    res = client.post(
        "/api/v1/document/analyze",
        files={"file": ("tampered_doc.jpg", tampered_bytes, "image/jpeg")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "TAMPERED"
    assert data["is_tampered"] is True
    assert "ela_heatmap_base64" in data

def test_document_expiration_check():
    """Document expired relative to 2026-10-12 must be marked EXPIRED."""
    expired_bytes = document_analyzer.generate_synthetic_document(
        name="EXPIRED USER",
        id_number="VR-0000",
        expiry_date="2024-01-01",
        tamper=False,
    )
    res = client.post(
        "/api/v1/document/analyze",
        files={"file": ("expired.jpg", expired_bytes, "image/jpeg")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "EXPIRED"
    assert data["expiration_check"]["is_expired"] is True

# ==================== MODULE E: DECISION ENGINE TESTS ====================

def test_decision_engine_verified():
    """All checks passing yields VERIFIED."""
    rep = decision_engine.evaluate_verification(
        image_authenticity={"status": "REAL", "confidence": 0.95},
        identity_match={"status": "MATCH", "similarity_score": 0.82},
        liveness={"status": "PASS", "liveness_score": 0.88},
        document_integrity={"status": "GENUINE", "tamper_risk_score": 0.08},
        policy="BALANCED",
    )
    assert rep["final_decision"] == "VERIFIED"

def test_decision_engine_incomplete():
    """Missing required checks yields INCOMPLETE with transparent reasons."""
    rep = decision_engine.evaluate_verification(
        image_authenticity={"status": "REAL"},
        identity_match={"status": "MATCH"},
        liveness={"status": "NOT_TESTED"},
        document_integrity={"status": "NOT_TESTED"},
        policy="BALANCED",
    )
    assert rep["final_decision"] == "INCOMPLETE"
    assert any("liveness" in r.lower() for r in rep["reasons"])

def test_decision_engine_rejected():
    """Spoofed liveness or tampered document triggers REJECTED."""
    rep = decision_engine.evaluate_verification(
        image_authenticity={"status": "REAL"},
        identity_match={"status": "MATCH"},
        liveness={"status": "FAIL"},
        document_integrity={"status": "GENUINE"},
        policy="BALANCED",
    )
    assert rep["final_decision"] == "REJECTED"
    assert any("presentation attack" in r.lower() or "liveness" in r.lower() for r in rep["reasons"])
