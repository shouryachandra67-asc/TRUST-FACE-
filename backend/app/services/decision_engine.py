import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from ..config import settings

class VerificationDecisionEngine:
    """
    Transparent Decision-Support & Policy Fusion Engine.
    Independently evaluates:
    1. Image Authenticity (real, manipulated, uncertain, not tested)
    2. Identity Match (match, no match, inconclusive, not tested)
    3. Liveness (pass, fail, inconclusive, not tested)
    4. Document Integrity (genuine, tampered, expired, review, not tested)
    Strictly avoids computing misleading pseudo-probabilities across disparate modalities.
    """
    POLICIES = ["STRICT", "BALANCED", "FAST"]

    def evaluate_verification(
        self,
        image_authenticity: Optional[Dict[str, Any]] = None,
        identity_match: Optional[Dict[str, Any]] = None,
        liveness: Optional[Dict[str, Any]] = None,
        document_integrity: Optional[Dict[str, Any]] = None,
        policy: str = "BALANCED",
        verification_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        v_id = verification_id or str(uuid.uuid4())
        policy = policy.upper() if policy.upper() in self.POLICIES else "BALANCED"

        # Normalize module payloads
        auth_data = self._normalize_auth(image_authenticity)
        match_data = self._normalize_match(identity_match)
        live_data = self._normalize_liveness(liveness)
        doc_data = self._normalize_doc(document_integrity)

        reasons: List[str] = []
        is_rejected = False
        is_review = False
        is_incomplete = False

        # --- Rule 1: Document Integrity Evaluation ---
        doc_status = doc_data["status"]
        if doc_status == "TAMPERED":
            is_rejected = True
            reasons.append("Document authenticity check failed: digital tampering detected.")
        elif doc_status == "EXPIRED":
            is_rejected = True
            reasons.append("Document authenticity check failed: document is expired.")
        elif doc_status in ("REVIEW", "UNCERTAIN"):
            is_review = True
            reasons.append("Document requires manual inspection due to image blur or layout uncertainty.")
        elif doc_status == "NOT_TESTED" and policy in ("STRICT", "BALANCED"):
            is_incomplete = True
            reasons.append("Document integrity has not been tested.")

        # --- Rule 2: Image Authenticity Evaluation ---
        auth_status = auth_data["status"]
        if auth_status in ("POTENTIAL MANIPULATION", "MANIPULATED"):
            is_rejected = True
            reasons.append("Facial image authenticity check failed: synthetic or manipulated media detected.")
        elif auth_status in ("UNCERTAIN", "REVIEW"):
            is_review = True
            reasons.append("Facial image authenticity is inconclusive or degraded by severe blur.")
        elif auth_status == "NOT_TESTED" and policy == "STRICT":
            is_incomplete = True
            reasons.append("Deepfake image authenticity check has not been run.")

        # --- Rule 3: Biometric Identity Match Evaluation ---
        match_status = match_data["status"]
        if match_status == "NO_MATCH":
            is_rejected = True
            reasons.append("Biometric identity comparison failed: facial embeddings do not match reference.")
        elif match_status in ("INCONCLUSIVE", "REVIEW"):
            is_review = True
            reasons.append("Biometric similarity falls in the ambiguous review band or image quality was low.")
        elif match_status == "NOT_TESTED" and policy in ("STRICT", "BALANCED"):
            is_incomplete = True
            reasons.append("Identity matching has not been tested.")

        # --- Rule 4: Liveness & PAD Evaluation ---
        live_status = live_data["status"]
        if live_status == "FAIL":
            is_rejected = True
            reasons.append("Liveness verification failed: potential presentation attack (photo/screen replay).")
        elif live_status in ("INCONCLUSIVE", "REVIEW"):
            is_review = True
            reasons.append("Liveness telemetry was ambiguous during active verification.")
        elif live_status == "NOT_TESTED" and policy in ("STRICT", "BALANCED"):
            is_incomplete = True
            reasons.append("Liveness has not been verified.")

        # --- Synthesize Authoritative Final Decision ---
        # Priority order: REJECTED > INCOMPLETE > MANUAL_REVIEW > VERIFIED
        if is_rejected:
            final_decision = "REJECTED"
        elif is_incomplete:
            final_decision = "INCOMPLETE"
        elif is_review:
            final_decision = "MANUAL_REVIEW"
        else:
            final_decision = "VERIFIED"
            reasons = ["All required verification checks passed in compliance with the approved policy."]

        return {
            "verification_id": v_id,
            "policy": policy,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "final_decision": final_decision,
            "reasons": reasons,
            "image_authenticity": auth_data,
            "identity_match": match_data,
            "liveness": live_data,
            "document_integrity": doc_data,
        }

    def _normalize_auth(self, payload: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not payload:
            return {"status": "NOT_TESTED", "confidence": None, "model_version": settings.MODEL_VERSION}
        status = payload.get("result") or payload.get("status") or "NOT_TESTED"
        return {
            "status": status,
            "confidence": payload.get("confidence"),
            "model_version": settings.MODEL_VERSION,
            "signals": payload.get("technical_signals", []),
        }

    def _normalize_match(self, payload: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not payload:
            return {"status": "NOT_TESTED", "similarity_score": None}
        return {
            "status": payload.get("status", "NOT_TESTED"),
            "similarity_score": payload.get("similarity_score"),
            "threshold_applied": payload.get("threshold_applied"),
        }

    def _normalize_liveness(self, payload: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not payload:
            return {"status": "NOT_TESTED", "liveness_score": None}
        return {
            "status": payload.get("status", "NOT_TESTED"),
            "liveness_score": payload.get("liveness_score"),
            "presentation_attack_signals": payload.get("presentation_attack_signals", []),
        }

    def _normalize_doc(self, payload: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not payload:
            return {"status": "NOT_TESTED", "tamper_risk_score": None}
        return {
            "status": payload.get("status", "NOT_TESTED"),
            "tamper_risk_score": payload.get("tamper_risk_score"),
            "document_type": payload.get("document_type"),
            "is_tampered": payload.get("is_tampered"),
            "expiration_status": payload.get("expiration_check", {}).get("status"),
        }

decision_engine = VerificationDecisionEngine()
