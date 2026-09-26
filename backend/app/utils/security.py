import base64
import uuid
import cv2
import numpy as np

def generate_analysis_id() -> str:
    """Generates an authoritative, collision-resistant tracking identifier."""
    return f"TF-2026-{uuid.uuid4().hex[:8].upper()}"

def cv2_to_base64_data_url(image_bgr: np.ndarray, format: str = "jpeg", quality: int = 90) -> str:
    """
    Converts an in-memory OpenCV BGR matrix to a Base64 data URL string.
    Zero persistent disk footprint.
    """
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality] if format.lower() in ("jpg", "jpeg") else []
    success, buffer = cv2.imencode(f".{format}", image_bgr, encode_params)
    if not success:
        return ""
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/{format};base64,{b64_str}"

def base64_to_bytes(base64_str: str) -> bytes:
    """Extracts raw binary bytes from a Base64 data URL or raw string."""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    return base64.b64decode(base64_str)
