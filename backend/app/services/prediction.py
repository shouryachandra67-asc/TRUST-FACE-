import time
import numpy as np
from fastapi import HTTPException, status
from typing import Dict, Any

from .face_detection import face_detector
from .preprocessing import preprocessor
from .explainability import gradcam_service
from ..models.model_loader import model_adapter
from ..schemas.analysis import AnalysisResponse, ModelMeta, ScoreBreakdown
from ..utils.security import generate_analysis_id, cv2_to_base64_data_url
from ..config import settings

class PipelineOrchestrator:
    """
    Coordinates end-to-end computer vision and neural model inference.
    Authoritative server-side orchestration with strict validation.
    """
    def run_pipeline(self, image_bgr: np.ndarray) -> AnalysisResponse:
        start_time = time.perf_counter()
        analysis_id = generate_analysis_id()

        # Step 1: Detect Faces
        face_count, boxes = face_detector.detect_faces(image_bgr)

        # Rule: Strictly exactly 1 face
        if face_count == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "error": "NO_FACE_DETECTED",
                    "face_count": 0,
                    "message": "No face detected. Please upload an image containing a clear human face.",
                },
            )

        if face_count > 1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "error": "MULTIPLE_FACES_DETECTED",
                    "face_count": face_count,
                    "message": f"Multiple faces detected ({face_count}). Please upload an image containing only one face.",
                },
            )

        target_box = boxes[0]

        # Step 2: Extract ROI with contextual margin
        face_roi = preprocessor.extract_face_roi(image_bgr, target_box)
        blur_variance = preprocessor.compute_blur_variance(face_roi)

        # Step 3: Resize and PyTorch Normalization
        input_tensor, rgb_face_crop = preprocessor.preprocess_for_inference(face_roi)

        # Step 4: Run AI Authenticity & Forensic Model
        # Passes both the normalized tensor and high-res face crop for multimodal analysis
        scores, verdict, confidence = model_adapter.predict(input_tensor, face_bgr=face_roi)
        print(f"[TRUSTFACE INFERENCE] Bounding Box: {target_box} | Blur Variance: {round(blur_variance, 2)} | Scores: {scores} | Final Verdict: {verdict} ({confidence})", flush=True)

        # Only trigger UNCERTAIN if the image is severely blurred (variance < 10.0)
        uncertain_reason = None
        if blur_variance < 10.0 and verdict != "MODEL NOT CONFIGURED":
            verdict = "UNCERTAIN"
            uncertain_reason = "Image sharpness is critically degraded for micro-texture analysis."
            scores["uncertain"] = 0.65
            confidence = 0.35

        # Step 5: Explainable AI (Grad-CAM)
        heatmap_base64 = None
        explanation_available = False
        if model_adapter.is_configured and model_adapter.model is not None and model_adapter.target_layer is not None:
            heatmap_base64 = gradcam_service.generate_heatmap(
                model=model_adapter.model,
                target_layer=model_adapter.target_layer,
                input_tensor=input_tensor,
                rgb_face_image=rgb_face_crop,
            )
            explanation_available = heatmap_base64 is not None

        # Convert face crop to Base64 for client display
        face_crop_base64 = cv2_to_base64_data_url(face_roi, format="jpeg", quality=90)

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return AnalysisResponse(
            analysis_id=analysis_id,
            status="completed",
            face_detected=True,
            face_count=1,
            result=verdict,
            confidence=confidence,
            model=ModelMeta(
                name=model_adapter.architecture_name,
                version=settings.MODEL_VERSION,
            ),
            scores=ScoreBreakdown(
                real=scores["real"],
                manipulation=scores["manipulation"],
                uncertain=scores.get("uncertain", 0.0),
            ),
            processing_time_ms=round(elapsed_ms, 2),
            explanation_available=explanation_available,
            face_crop_base64=face_crop_base64,
            heatmap_base64=heatmap_base64,
            uncertain_reason=uncertain_reason,
        )

pipeline_orchestrator = PipelineOrchestrator()
