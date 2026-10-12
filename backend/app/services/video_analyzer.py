import os
import cv2
import tempfile
import numpy as np
from typing import Dict, Any, List
from ..config import settings
from .face_detection import face_detector
from .preprocessing import preprocessor
from ..models.model_loader import model_adapter

class VideoTemporalAnalyzer:
    """
    Temporal Media & Video Deepfake Inspector.
    Samples frames across video timeline, analyzes per-frame facial authenticity
    using the core forensic engine, and evaluates temporal consistency, flickering,
    and boundary jitter.
    """
    def analyze_video_bytes(self, video_bytes: bytes, filename: str = "upload.mp4") -> Dict[str, Any]:
        suffix = os.path.splitext(filename)[1].lower() or ".mp4"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(video_bytes)
            tmp_path = tmp.name

        try:
            return self.analyze_video_path(tmp_path)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def analyze_video_path(self, video_path: str) -> Dict[str, Any]:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {
                "status": "ERROR",
                "error": "UNREADABLE_VIDEO",
                "message": "Could not decode video stream. Unsupported codec or corrupted container.",
                "total_frames_sampled": 0,
            }

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_sec = total_frames / max(1.0, fps)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # Determine sampling stride (sample ~2 frames per second up to MAX_VIDEO_FRAMES)
        stride = max(1, int(fps / settings.VIDEO_SAMPLE_FPS))
        max_samples = settings.MAX_VIDEO_FRAMES

        sampled_results: List[Dict[str, Any]] = []
        frame_idx = 0
        sampled_count = 0
        fake_scores: List[float] = []

        while cap.isOpened() and sampled_count < max_samples:
            ret, frame_bgr = cap.read()
            if not ret:
                break

            if frame_idx % stride == 0:
                timestamp = round(frame_idx / fps, 2)
                face_count, boxes = face_detector.detect_faces(frame_bgr)
                
                frame_data: Dict[str, Any] = {
                    "frame_index": frame_idx,
                    "timestamp_sec": timestamp,
                    "face_detected": face_count > 0,
                    "face_count": face_count,
                    "verdict": "NO_FACE",
                    "fake_score": None,
                    "real_score": None,
                }

                if face_count == 1:
                    target_box = boxes[0]
                    face_roi = preprocessor.extract_face_roi(frame_bgr, target_box)
                    input_tensor, _ = preprocessor.preprocess_for_inference(face_roi)
                    scores, verdict, conf = model_adapter.predict(input_tensor, face_bgr=face_roi)

                    p_fake = scores.get("manipulation", 0.0)
                    p_real = scores.get("real", 0.0)
                    fake_scores.append(p_fake)

                    frame_data["verdict"] = verdict
                    frame_data["fake_score"] = p_fake
                    frame_data["real_score"] = p_real
                    frame_data["confidence"] = conf

                sampled_results.append(frame_data)
                sampled_count += 1

            frame_idx += 1

        cap.release()

        # Temporal aggregation
        valid_frames = [f for f in sampled_results if f["face_detected"] and f["fake_score"] is not None]
        if len(valid_frames) == 0:
            return {
                "status": "COMPLETED",
                "verdict": "UNCERTAIN",
                "overall_confidence": 0.0,
                "video_metadata": {
                    "duration_sec": round(duration_sec, 2),
                    "total_frames": total_frames,
                    "fps": round(fps, 1),
                    "resolution": f"{width}x{height}",
                },
                "total_frames_sampled": sampled_count,
                "face_frames_analyzed": 0,
                "reasons": ["No clear frontal faces isolated across sampled video timeline."],
                "timeline": sampled_results,
            }

        avg_fake_score = float(np.mean(fake_scores))
        temporal_variance = float(np.var(fake_scores))
        high_fake_count = sum(1 for s in fake_scores if s > 0.55)
        fake_ratio = high_fake_count / len(fake_scores)

        # Detect temporal instability (flickering artifacts typical of frame-by-frame deepfakes)
        adjacent_diffs = [abs(fake_scores[i] - fake_scores[i-1]) for i in range(1, len(fake_scores))]
        mean_jitter = float(np.mean(adjacent_diffs)) if adjacent_diffs else 0.0
        temporal_jitter_flag = mean_jitter > 0.22

        technical_signals = []
        if temporal_jitter_flag:
            technical_signals.append("HIGH_TEMPORAL_JITTER_FLICKER")
        if fake_ratio > 0.35:
            technical_signals.append("PERSISTENT_MANIPULATION_FRAMES")
        if temporal_variance > 0.08:
            technical_signals.append("HIGH_INTER_FRAME_VARIANCE")

        # Authoritative video classification
        if fake_ratio >= 0.35 or avg_fake_score > 0.60:
            overall_verdict = "POTENTIAL MANIPULATION"
            conf = round(max(avg_fake_score, fake_ratio), 3)
            reasons = [
                f"{round(fake_ratio * 100, 1)}% of sampled frames exhibit synthetic anomalies.",
                f"Average manipulation confidence across timeline: {round(avg_fake_score, 3)}."
            ]
        elif avg_fake_score < 0.25 and fake_ratio == 0.0:
            overall_verdict = "REAL"
            conf = round(1.0 - avg_fake_score, 3)
            reasons = [
                f"Consistent biological facial texture across {len(valid_frames)} sampled frames.",
                f"Low temporal score variance ({round(temporal_variance, 4)})."
            ]
        else:
            overall_verdict = "UNCERTAIN"
            conf = 0.50
            reasons = [
                "Inconclusive temporal evidence: mixed facial artifact signals across frames.",
                f"Temporal jitter index: {round(mean_jitter, 3)}."
            ]

        if temporal_jitter_flag:
            reasons.append("Noticeable inter-frame boundary flickering detected.")

        return {
            "status": "COMPLETED",
            "verdict": overall_verdict,
            "overall_confidence": conf,
            "average_fake_score": round(avg_fake_score, 3),
            "temporal_variance": round(temporal_variance, 4),
            "mean_temporal_jitter": round(mean_jitter, 3),
            "temporal_jitter_detected": temporal_jitter_flag,
            "manipulation_frame_ratio": round(fake_ratio, 3),
            "technical_signals": technical_signals,
            "video_metadata": {
                "duration_sec": round(duration_sec, 2),
                "total_frames": total_frames,
                "fps": round(fps, 1),
                "resolution": f"{width}x{height}",
            },
            "total_frames_sampled": sampled_count,
            "face_frames_analyzed": len(valid_frames),
            "reasons": reasons,
            "timeline": sampled_results,
        }

video_analyzer = VideoTemporalAnalyzer()
