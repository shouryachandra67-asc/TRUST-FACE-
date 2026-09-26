# TrustFace AI — System Architecture Specification

## 1. High-Level Architectural Flow
TrustFace AI operates on a layered, decoupled architecture comprising:
1. **Client Tier**: Single Page Application (React, Vite, Tailwind CSS) providing responsive biometric preview, client-side pre-validation, interactive Grad-CAM visualization, and audit reports.
2. **Gateway / API Tier**: FastAPI service implementing CORS restriction, streaming request throttling, file sanitization, and structured Pydantic schemas.
3. **Vision & Preprocessing Engine**: OpenCV and Cascade/MediaPipe algorithms providing bounding box isolation, single-face validation (strict rule: exactly 1 face, otherwise rejection), aspect-ratio preserving affine padding, and 224x224 RGB normalization.
4. **Machine Learning Inference Core**: PyTorch-based neural backbone with registered forward hooks for Grad-CAM activation extraction, softmax confidence computation, and uncertainty thresholding.
5. **Audit / Persistence Layer**: Ephemeral media lifecycle manager with local SQLite audit ledger storing non-biometric inference telemetry (hash, latency, prediction, confidence).

## 2. Ingestion Pipeline
```text
Raw Upload / Base64 Frame
          ↓
[MIME & Magic Byte Verification]
          ↓
[Decoded OpenCV Matrix (RGB)]
          ↓
[Face Detector Execution]
    ├── Count == 0  --> 422 Unprocessable: "NO_FACE_DETECTED"
    ├── Count > 1   --> 422 Unprocessable: "MULTIPLE_FACES_DETECTED"
    └── Count == 1  --> Normalized Face Bounding Box (x, y, w, h)
          ↓
[Sub-region Bounding Box Expansion (15% Context Margin)]
          ↓
[Resize to 224x224 & PyTorch Tensor Normalization]
          ↓
[Backbone Forward Pass + Grad-CAM Backprop]
          ↓
[JSON Analysis Payload + Heatmap Base64 Overlay]
```
