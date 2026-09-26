# TrustFace AI — API Reference

## Base URL
```
http://127.0.0.1:8000/api
```

## Endpoints

### 1. Health & Model Diagnostics
- **Method**: `GET /api/health`
- **Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "model_loaded": true,
  "model_name": "EfficientNet-B0-Deepfake",
  "device": "cuda:0"
}
```

### 2. Image Authenticity Analysis
- **Method**: `POST /api/analyze-image`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (Image binary: .jpg, .jpeg, .png, .webp; max 10MB)
- **Success Response (200 OK)**:
```json
{
  "analysis_id": "TF-2026-894123",
  "status": "completed",
  "face_detected": true,
  "face_count": 1,
  "result": "REAL",
  "confidence": 0.924,
  "model": {
    "name": "EfficientNet-B0-Deepfake",
    "version": "1.0.0"
  },
  "scores": {
    "real": 0.924,
    "manipulation": 0.076,
    "uncertain": 0.000
  },
  "processing_time_ms": 142.5,
  "explanation_available": true,
  "face_crop_base64": "data:image/jpeg;base64,...",
  "heatmap_base64": "data:image/jpeg;base64,..."
}
```
- **Error Responses**:
  - `422 Unprocessable Entity`: No face or multiple faces found.
  - `400 Bad Request`: Invalid image file or exceeded size limit.
  - `503 Service Unavailable`: Model checkpoint not configured.

### 3. Camera Frame Analysis
- **Method**: `POST /api/analyze-frame`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "frame_base64": "data:image/jpeg;base64,..."
}
```
