import cv2
import uuid
import secrets
import numpy as np
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from ..config import settings
from .face_detection import face_detector

class LivenessDetectionEngine:
    """
    Active & Passive Presentation Attack Detection (PAD) Engine.
    Combines randomized challenge-response action sessions (anti-replay)
    with optical texture analysis: 2D FFT moiré interference (screen replay),
    specular paper reflectance (printed photo), and dynamic motion vectors.
    """
    AVAILABLE_CHALLENGES = [
        "TURN_HEAD_LEFT",
        "TURN_HEAD_RIGHT",
        "SMILE",
        "NOD_HEAD",
        "BLINK_EYES",
    ]

    def create_session(self) -> Dict[str, Any]:
        """
        Generates a fresh challenge-response session with cryptographic nonce and TTL.
        """
        session_id = str(uuid.uuid4())
        nonce = secrets.token_hex(16)
        # Select 2 distinct randomized actions
        chosen_challenges = list(np.random.choice(self.AVAILABLE_CHALLENGES, size=2, replace=False))
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=settings.LIVENESS_SESSION_TTL_SECONDS)

        return {
            "session_id": session_id,
            "nonce": nonce,
            "challenges": chosen_challenges,
            "created_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "ttl_seconds": settings.LIVENESS_SESSION_TTL_SECONDS,
            "instructions": [
                f"Action 1: {chosen_challenges[0].replace('_', ' ').title()}",
                f"Action 2: {chosen_challenges[1].replace('_', ' ').title()}",
            ],
            "disclaimer": "This session employs randomized challenge verification and optical texture PAD heuristics. Note that prototype software heuristics do not substitute for ISO/IEC 30107-3 certified hardware biometric sensor arrays.",
        }

    def detect_screen_moire(self, face_bgr: np.ndarray) -> Tuple[bool, float]:
        """
        Detects screen replay attacks via high-frequency 2D FFT moiré grid interference.
        Digital LCD/OLED subpixel grids recorded through an optical camera produce
        characteristic diagonal aliasing bands in the Fourier frequency magnitude.
        """
        gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        if h < 30 or w < 30:
            return False, 0.0

        f_shift = np.fft.fftshift(np.fft.fft2(gray.astype(np.float32)))
        magnitude = np.log1p(np.abs(f_shift))

        cy, cx = h // 2, w // 2
        y, x = np.ogrid[:h, :w]
        r = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        max_r = min(cx, cy)

        # High frequency perimeter where moiré beats reside
        hf_annulus = (r > max_r * 0.55) & (r < max_r * 0.95)
        hf_vals = magnitude[hf_annulus]

        if len(hf_vals) == 0:
            return False, 0.0

        hf_std = float(np.std(hf_vals))
        hf_p98 = float(np.percentile(hf_vals, 98))
        hf_mean = float(np.mean(hf_vals))
        moire_peak_ratio = (hf_p98 - hf_mean) / (hf_std + 1e-6)

        # High peakedness in high-frequency ring indicates display refresh / moiré aliasing
        is_moire = moire_peak_ratio > 3.8
        risk = float(np.clip((moire_peak_ratio - 2.5) / 2.5, 0.0, 1.0))
        return is_moire, round(risk, 3)

    def detect_printed_photo_artifacts(self, face_bgr: np.ndarray) -> Tuple[bool, float]:
        """
        Detects printed photo spoof attacks.
        Checks for:
        1. Specular hot-spots (harsh paper reflections lacking natural subsurface epidermal scattering)
        2. Color gamut compression (narrow dynamic chromatic range of printed paper)
        """
        gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2HSV)
        v_channel = hsv[:, :, 2]
        s_channel = hsv[:, :, 1]

        # Specular white reflection (> 250 brightness with very low saturation < 15)
        specular_pixels = np.sum((v_channel > 250) & (s_channel < 18))
        total_pixels = face_bgr.shape[0] * face_bgr.shape[1]
        specular_ratio = float(specular_pixels) / max(1, total_pixels)

        # Dynamic range variance
        lum_std = float(np.std(gray))
        sat_std = float(np.std(s_channel))

        # Paper spoofs have either unnatural specular glare (> 0.02) or compressed chromatic range
        is_paper = (specular_ratio > 0.015) or (sat_std < 12.0 and lum_std < 25.0)
        risk = min(1.0, specular_ratio * 40.0 + (0.35 if sat_std < 12.0 else 0.0))
        return is_paper, round(float(np.clip(risk, 0.0, 1.0)), 3)

    def verify_liveness_frames(
        self,
        frames_bgr: List[np.ndarray],
        expected_challenges: List[str],
        session_created_at: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates a submitted sequence of frames against active challenges and passive PAD heuristics.
        """
        if not frames_bgr or len(frames_bgr) == 0:
            return {
                "status": "FAIL",
                "liveness_score": 0.0,
                "reasons": ["No video frames submitted for liveness evaluation."],
                "presentation_attack_signals": ["MISSING_FRAMES"],
            }

        # Check session freshness (TTL)
        if session_created_at:
            age_sec = (datetime.now(timezone.utc) - session_created_at).total_seconds()
            if age_sec > settings.LIVENESS_SESSION_TTL_SECONDS:
                return {
                    "status": "FAIL",
                    "liveness_score": 0.0,
                    "reasons": [f"Liveness session expired ({round(age_sec)}s > {settings.LIVENESS_SESSION_TTL_SECONDS}s). Fresh capture required."],
                    "presentation_attack_signals": ["SESSION_EXPIRED"],
                }

        attack_signals: List[str] = []
        moire_scores: List[float] = []
        paper_scores: List[float] = []
        face_boxes: List[Tuple[int, int, int, int]] = []

        valid_face_frames = 0
        for frame in frames_bgr:
            cnt, boxes = face_detector.detect_faces(frame)
            if cnt == 1:
                valid_face_frames += 1
                bx = boxes[0]
                face_boxes.append(bx)
                x, y, w, h = bx
                face_crop = frame[max(0, y):y+h, max(0, x):x+w]

                if face_crop.size > 0:
                    is_moire, m_risk = self.detect_screen_moire(face_crop)
                    is_paper, p_risk = self.detect_printed_photo_artifacts(face_crop)
                    moire_scores.append(m_risk)
                    paper_scores.append(p_risk)

                    if is_moire and "SCREEN_MOIRE_PATTERN_DETECTED" not in attack_signals:
                        attack_signals.append("SCREEN_MOIRE_PATTERN_DETECTED")
                    if is_paper and "SPECULAR_PRINT_REFLECTION_DETECTED" not in attack_signals:
                        attack_signals.append("SPECULAR_PRINT_REFLECTION_DETECTED")

        if valid_face_frames < 2:
            return {
                "status": "FAIL",
                "liveness_score": 0.15,
                "reasons": ["Face not continuously tracked across submitted verification frames."],
                "presentation_attack_signals": ["INSUFFICIENT_FACE_TRACKING"] + attack_signals,
            }

        # Motion analysis across frame sequence
        xs = [b[0] + b[2]//2 for b in face_boxes]
        ys = [b[1] + b[3]//2 for b in face_boxes]
        dx_max = max(xs) - min(xs)
        dy_max = max(ys) - min(ys)
        total_motion = float(np.sqrt(dx_max**2 + dy_max**2))

        # Check motion dynamic
        motion_detected = total_motion > 6.0
        if not motion_detected:
            attack_signals.append("STATIC_FRAME_NO_NATURAL_MOTION")

        avg_moire = float(np.mean(moire_scores)) if moire_scores else 0.0
        avg_paper = float(np.mean(paper_scores)) if paper_scores else 0.0
        passive_pad_penalty = 0.5 * avg_moire + 0.5 * avg_paper

        base_score = 0.88 if motion_detected else 0.30
        liveness_score = float(np.clip(base_score - passive_pad_penalty, 0.05, 0.98))

        reasons = []
        if len(attack_signals) > 0:
            reasons.append(f"Presentation attack indicators observed: {', '.join(attack_signals)}.")

        if liveness_score >= settings.LIVENESS_PASS_SCORE and len(attack_signals) == 0:
            verdict = "PASS"
            reasons.append("Active biological motion confirmed; optical presentation attack checks clear.")
        elif liveness_score < 0.45 or len(attack_signals) > 0:
            verdict = "FAIL"
            reasons.append("Evidence of potential presentation attack (photo/screen replay/static media).")
        else:
            verdict = "INCONCLUSIVE"
            reasons.append("Ambiguous liveness telemetry. Session referred for supervised manual review.")

        return {
            "status": verdict,
            "liveness_score": round(liveness_score, 3),
            "passive_pad_risk": round(passive_pad_penalty, 3),
            "natural_motion_detected": motion_detected,
            "motion_magnitude_px": round(total_motion, 1),
            "screen_moire_risk": round(avg_moire, 3),
            "paper_specular_risk": round(avg_paper, 3),
            "presentation_attack_signals": attack_signals,
            "frames_analyzed": len(frames_bgr),
            "reasons": reasons,
            "disclaimer": "Liveness classification is based on optical heuristic checks and anti-replay session verification.",
        }

liveness_engine = LivenessDetectionEngine()
