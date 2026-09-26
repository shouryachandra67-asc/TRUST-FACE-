import io
import cv2
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.face_detection import face_detector
from backend.app.services.preprocessing import preprocessor
from backend.app.models.model_loader import model_adapter
from backend.app.utils.security import cv2_to_base64_data_url

client = TestClient(app)

def create_synthetic_image_bytes(draw_face: bool = False, draw_multiple: bool = False) -> bytes:
    """
    Creates an in-memory PNG/JPEG with synthetic geometric markers.
    If draw_face is True, draws a synthetic schematic head with eyes, nose, mouth.
    """
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[:] = (230, 230, 230) # Light gray background

    if draw_face:
        # Draw head oval
        cv2.ellipse(img, (150, 150), (70, 95), 0, 0, 360, (180, 180, 180), -1)
        # Eyes
        cv2.circle(img, (125, 130), 10, (50, 50, 50), -1)
        cv2.circle(img, (175, 130), 10, (50, 50, 50), -1)
        # Nose
        cv2.line(img, (150, 140), (150, 165), (50, 50, 50), 3)
        # Mouth
        cv2.ellipse(img, (150, 190), (30, 12), 0, 0, 180, (50, 50, 50), 3)

    if draw_multiple:
        # Second face
        cv2.ellipse(img, (50, 80), (35, 45), 0, 0, 360, (180, 180, 180), -1)
        cv2.circle(img, (40, 70), 5, (50, 50, 50), -1)
        cv2.circle(img, (60, 70), 5, (50, 50, 50), -1)
        cv2.line(img, (50, 75), (50, 85), (50, 50, 50), 2)
        cv2.ellipse(img, (50, 95), (15, 6), 0, 0, 180, (50, 50, 50), 2)

    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG")
    return buf.getvalue()

def test_health_endpoint():
    """Validates /api/health diagnostics."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "model_loaded" in data
    assert "opencv_version" in data

def test_invalid_image_upload():
    """Upload of corrupted or non-image content must be rejected."""
    fake_bytes = b"This is not a valid JPEG/PNG magic byte stream."
    response = client.post(
        "/api/analyze-image",
        files={"file": ("corrupt.txt", fake_bytes, "text/plain")},
    )
    assert response.status_code in (400, 415)

def test_zero_face_rejection():
    """An image with zero detectable faces must be strictly rejected with HTTP 422."""
    empty_image_bytes = create_synthetic_image_bytes(draw_face=False)
    response = client.post(
        "/api/analyze-image",
        files={"file": ("noface.jpg", empty_image_bytes, "image/jpeg")},
    )
    assert response.status_code == 422
    data = response.json()
    assert data["detail"]["error"] == "NO_FACE_DETECTED"
    assert data["detail"]["face_count"] == 0

def test_multiple_faces_rejection():
    """An image with 2 or more faces must be strictly rejected with HTTP 422."""
    orig_detect = face_detector.detect_faces
    try:
        face_detector.detect_faces = lambda img: (2, [(20, 20, 50, 50), (120, 120, 50, 50)])
        empty_image_bytes = create_synthetic_image_bytes(draw_face=False)
        response = client.post(
            "/api/analyze-image",
            files={"file": ("multiface.jpg", empty_image_bytes, "image/jpeg")},
        )
        assert response.status_code == 422
        data = response.json()
        assert data["detail"]["error"] == "MULTIPLE_FACES_DETECTED"
        assert data["detail"]["face_count"] == 2
    finally:
        face_detector.detect_faces = orig_detect

def test_future_endpoints_not_implemented():
    """Strictly verifies future endpoints return HTTP 501 Not Implemented."""
    res_video = client.post("/api/analyze-video")
    assert res_video.status_code == 501

    res_audio = client.post("/api/analyze-audio")
    assert res_audio.status_code == 501

    res_doc = client.post("/api/analyze-document")
    assert res_doc.status_code == 501

    res_liveness = client.post("/api/liveness")
    assert res_liveness.status_code == 501

def test_single_face_pipeline_mock_detection():
    """
    Tests full pipeline when exactly 1 face is isolated by injecting
    a mock bounding box into the face detector.
    """
    # Create test image
    test_img = np.ones((250, 250, 3), dtype=np.uint8) * 128
    
    # Temporarily monkeypatch detect_faces to return exactly 1 face box
    orig_detect = face_detector.detect_faces
    try:
        face_detector.detect_faces = lambda img: (1, [(50, 50, 100, 100)])
        
        # Test image endpoint
        pil_img = Image.fromarray(test_img)
        buf = io.BytesIO()
        pil_img.save(buf, format="JPEG")
        
        response = client.post(
            "/api/analyze-image",
            files={"file": ("face.jpg", buf.getvalue(), "image/jpeg")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["face_detected"] is True
        assert data["face_count"] == 1
        assert "analysis_id" in data
        assert "confidence" in data
        assert "scores" in data
        assert "processing_time_ms" in data
        assert data["face_crop_base64"].startswith("data:image/jpeg;base64,")
    finally:
        face_detector.detect_faces = orig_detect

def test_camera_frame_api():
    """Tests /api/analyze-frame endpoint with Base64 payload."""
    test_img = np.ones((200, 200, 3), dtype=np.uint8) * 120
    b64_url = cv2_to_base64_data_url(test_img, format="jpeg")
    
    orig_detect = face_detector.detect_faces
    try:
        face_detector.detect_faces = lambda img: (1, [(30, 30, 80, 80)])
        response = client.post("/api/analyze-frame", json={"frame_base64": b64_url})
        assert response.status_code == 200
        data = response.json()
        assert data["face_count"] == 1
        assert data["status"] == "completed"
    finally:
        face_detector.detect_faces = orig_detect
