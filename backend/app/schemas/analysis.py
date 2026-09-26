from typing import Optional, Dict
from pydantic import BaseModel, Field

class ModelMeta(BaseModel):
    name: str = Field(..., description="Architecture name")
    version: str = Field(..., description="Model version")

class ScoreBreakdown(BaseModel):
    real: float = Field(..., ge=0.0, le=1.0, description="Confidence score for pristine/real facial media")
    manipulation: float = Field(..., ge=0.0, le=1.0, description="Confidence score for synthetic or manipulated media")
    uncertain: float = Field(..., ge=0.0, le=1.0, description="Score attributed to statistical ambiguity or blur")

class AnalysisResponse(BaseModel):
    analysis_id: str = Field(..., description="Unique immutable forensic tracking ID")
    status: str = Field(default="completed", description="Lifecycle execution state")
    face_detected: bool = Field(..., description="Whether a valid face was detected")
    face_count: int = Field(..., description="Total faces detected in the media")
    result: str = Field(..., description="Authoritative verdict: REAL, POTENTIAL MANIPULATION, UNCERTAIN, or MODEL NOT CONFIGURED")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Primary calibrated model confidence")
    model: ModelMeta = Field(..., description="Model metadata")
    scores: ScoreBreakdown = Field(..., description="Class probability distribution")
    processing_time_ms: float = Field(..., description="End-to-end inference latency in milliseconds")
    explanation_available: bool = Field(default=False, description="Whether Grad-CAM feature attention map was synthesized")
    face_crop_base64: Optional[str] = Field(default=None, description="Base64-encoded 224x224 RGB face crop")
    heatmap_base64: Optional[str] = Field(default=None, description="Base64-encoded Grad-CAM attention overlay")
    uncertain_reason: Optional[str] = Field(default=None, description="Diagnostic explanation if verdict is UNCERTAIN")

class FrameAnalysisRequest(BaseModel):
    frame_base64: str = Field(..., description="Data URL or Base64 string of camera frame")

class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    model_name: str
    model_path: str
    device: str
    opencv_version: str
