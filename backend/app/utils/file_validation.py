import io
import cv2
import numpy as np
from PIL import Image
from fastapi import HTTPException, status
from ..config import settings

# Enforce safety ceiling against pixel flood / decompression bombs
Image.MAX_IMAGE_PIXELS = 25000000 # 25 megapixels

def validate_image_bytes(file_bytes: bytes) -> np.ndarray:
    """
    Validates binary payload for size, magic byte signature, and decodes
    it into an OpenCV BGR numpy array without touching persistent disk.
    """
    # 1. Size verification
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty. Please provide a valid facial image.",
        )

    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum permissible size of {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # 2. Magic byte signature verification
    is_jpeg = file_bytes.startswith(b"\xff\xd8\xff")
    is_png = file_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = len(file_bytes) >= 12 and file_bytes[:4] == b"RIFF" and file_bytes[8:12] == b"WEBP"

    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported format or corrupt image header. Only JPEG, PNG, and WebP are allowed.",
        )

    # 3. Decode image securely via Pillow to detect decompression attacks
    try:
        pil_img = Image.open(io.BytesIO(file_bytes))
        pil_img.verify() # Verify structure integrity
        # Re-open for actual rasterization after verify() closes the stream
        pil_img = Image.open(io.BytesIO(file_bytes))
        
        # Convert to RGB mode if CMYK, Palette, or RGBA
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")
            
        rgb_array = np.array(pil_img)
        # Convert RGB to BGR for OpenCV standard processing
        bgr_image = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
        return bgr_image
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image data is corrupted or cannot be safely rasterized.",
        )
