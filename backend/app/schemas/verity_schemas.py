from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DeepfakeAnalysisResult(BaseModel):
    analysis_id: str
    status: str = "completed"
    media_type: str = "image" # image or video
    face_detected: bool
    face_count: int
    result: str # REAL, POTENTIAL MANIPULATION, UNCERTAIN
    confidence: float
    scores: Dict[str, float]
    technical_signals: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    provenance: Optional[Dict[str, Any]] = None
    temporal_analysis: Optional[Dict[str, Any]] = None
    face_crop_base64: Optional[str] = None
    heatmap_base64: Optional[str] = None
    processing_time_ms: float

class IdentityMatchResponse(BaseModel):
    match_id: str
    status: str # MATCH, NO_MATCH, INCONCLUSIVE
    similarity_score: Optional[float] = None
    threshold_applied: float
    review_threshold_applied: float
    reference_quality: Dict[str, Any]
    probe_quality: Dict[str, Any]
    reasons: List[str] = Field(default_factory=list)
    requires_manual_review: bool
    consent_recorded: bool
    reference_face_base64: Optional[str] = None
    probe_face_base64: Optional[str] = None

class LivenessSessionResponse(BaseModel):
    session_id: str
    nonce: str
    challenges: List[str]
    created_at: str
    expires_at: str
    ttl_seconds: int
    instructions: List[str]
    disclaimer: str

class LivenessVerifyResponse(BaseModel):
    session_id: str
    status: str # PASS, FAIL, INCONCLUSIVE
    liveness_score: float
    natural_motion_detected: bool
    motion_magnitude_px: float
    screen_moire_risk: float
    paper_specular_risk: float
    presentation_attack_signals: List[str]
    frames_analyzed: int
    reasons: List[str]
    disclaimer: str

class DocumentAnalyzeResponse(BaseModel):
    analysis_id: str
    status: str # GENUINE, TAMPERED, EXPIRED, REVIEW
    document_type: str
    aspect_ratio: float
    sharpness_score: float
    tamper_risk_score: float
    is_tampered: bool
    portrait_detected: bool
    extracted_portrait_base64: Optional[str] = None
    ela_heatmap_base64: Optional[str] = None
    extracted_fields: Dict[str, Any]
    expiration_check: Dict[str, Any]
    technical_signals: List[str]
    warnings: List[str]
    reasons: List[str]

class ModuleSummary(BaseModel):
    status: str
    confidence: Optional[float] = None
    similarity_score: Optional[float] = None
    liveness_score: Optional[float] = None
    tamper_risk_score: Optional[float] = None
    model_version: Optional[str] = None
    signals: Optional[List[str]] = None

class VerificationReportResponse(BaseModel):
    verification_id: str
    timestamp: str
    policy: str
    final_decision: str # VERIFIED, REJECTED, MANUAL_REVIEW, INCOMPLETE
    reasons: List[str]
    image_authenticity: Dict[str, Any]
    identity_match: Dict[str, Any]
    liveness: Dict[str, Any]
    document_integrity: Dict[str, Any]

class EvaluationBenchmarkMetrics(BaseModel):
    model_family: str
    total_test_samples: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    false_acceptance_rate: float
    false_rejection_rate: float
    demographic_parity_gap: float
    evaluation_split: str
