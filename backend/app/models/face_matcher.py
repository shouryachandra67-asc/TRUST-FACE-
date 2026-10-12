import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from typing import Tuple, Dict, Any, Optional
from ..config import settings

class FaceEmbeddingModel:
    """
    Biometric Face Embedding & Verification Backbone.
    Generates 512-dimensional L2-normalized deep facial feature representations
    using a convolutional feature extractor with cosine distance matching.
    Strictly refrains from demographic estimation or pseudo-probabilistic metrics.
    """
    def __init__(self, device: Optional[str] = None):
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
        self.architecture_name = "DeepFaceNet-ResNet18-512D"
        self.backbone: Optional[nn.Module] = None
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        self._load_backbone()

    def _load_backbone(self):
        try:
            base = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
            # Remove final 1000-class classifier, retain 512-D pooled embedding
            modules = list(base.children())[:-1]
            self.backbone = nn.Sequential(*modules)
            self.backbone.to(self.device)
            self.backbone.eval()
        except Exception as e:
            print(f"[VerityAI] Warning loading FaceEmbeddingModel backbone: {e}")
            self.backbone = None

    def assess_face_quality(self, face_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Assesses face image quality attributes: sharpness (Laplacian variance),
        brightness/illumination distribution, and dimensional resolution.
        """
        h, w = face_bgr.shape[:2]
        gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur evaluation (variance of Laplacian)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        
        # 2. Illumination metrics
        mean_brightness = float(np.mean(gray))
        brightness_std = float(np.std(gray))
        
        # Quality flags
        is_blurry = laplacian_var < 20.0
        is_poor_lighting = (mean_brightness < 40.0) or (mean_brightness > 225.0) or (brightness_std < 18.0)
        is_undersized = (h < 64) or (w < 64)
        
        quality_score = 1.0
        issues = []
        if is_blurry:
            quality_score -= 0.4
            issues.append(f"Excessive blur detected (variance: {round(laplacian_var, 1)} < 20.0)")
        if is_poor_lighting:
            quality_score -= 0.35
            issues.append(f"Suboptimal illumination (mean: {round(mean_brightness, 1)}, std: {round(brightness_std, 1)})")
        if is_undersized:
            quality_score -= 0.3
            issues.append(f"Low resolution face ROI ({w}x{h} px)")

        return {
            "quality_score": round(max(0.05, quality_score), 2),
            "laplacian_variance": round(laplacian_var, 2),
            "mean_brightness": round(mean_brightness, 2),
            "brightness_std": round(brightness_std, 2),
            "resolution": f"{w}x{h}",
            "acceptable": len(issues) == 0,
            "issues": issues,
        }

    def extract_embedding(self, face_bgr: np.ndarray) -> Optional[np.ndarray]:
        """
        Extracts a 512-dimensional L2-normalized feature embedding vector.
        """
        if self.backbone is None or face_bgr is None or face_bgr.size == 0:
            return None

        rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
        tensor = self.transform(rgb).unsqueeze(0).to(self.device)

        with torch.no_grad():
            feat = self.backbone(tensor) # Shape: [1, 512, 1, 1]
            feat = feat.squeeze().cpu().numpy()
            norm = np.linalg.norm(feat)
            if norm > 1e-6:
                feat = feat / norm
            return feat.astype(np.float32)

    def compute_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """
        Computes cosine similarity between two normalized feature vectors.
        Returns a value in [-1.0, 1.0].
        """
        if emb1 is None or emb2 is None:
            return 0.0
        dot_product = float(np.dot(emb1, emb2))
        return round(float(np.clip(dot_product, -1.0, 1.0)), 4)

    def match_faces(
        self,
        ref_face_bgr: np.ndarray,
        probe_face_bgr: np.ndarray,
        match_threshold: Optional[float] = None,
        review_threshold: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Matches probe selfie against reference portrait with strict quality verification.
        Returns:
            status: MATCH, NO_MATCH, or INCONCLUSIVE
            similarity_score: Cosine similarity in [-1.0, 1.0]
            quality: diagnostics for both faces
            reasons: human-understandable explanation
        """
        m_thresh = match_threshold or settings.FACE_MATCH_THRESHOLD
        r_thresh = review_threshold or settings.FACE_MATCH_REVIEW_THRESHOLD

        ref_qual = self.assess_face_quality(ref_face_bgr)
        probe_qual = self.assess_face_quality(probe_face_bgr)

        # Quality gating
        if not ref_qual["acceptable"] or not probe_qual["acceptable"]:
            all_issues = ref_qual["issues"] + probe_qual["issues"]
            return {
                "status": "INCONCLUSIVE",
                "similarity_score": None,
                "threshold_applied": m_thresh,
                "reference_quality": ref_qual,
                "probe_quality": probe_qual,
                "reasons": [f"Image quality inadequate for reliable biometric comparison: {', '.join(all_issues)}"],
                "requires_manual_review": True,
            }

        ref_emb = self.extract_embedding(ref_face_bgr)
        probe_emb = self.extract_embedding(probe_face_bgr)

        if ref_emb is None or probe_emb is None:
            return {
                "status": "INCONCLUSIVE",
                "similarity_score": None,
                "threshold_applied": m_thresh,
                "reference_quality": ref_qual,
                "probe_quality": probe_qual,
                "reasons": ["Feature extractor could not compute embedding representation."],
                "requires_manual_review": True,
            }

        similarity = self.compute_similarity(ref_emb, probe_emb)

        if similarity >= m_thresh:
            status = "MATCH"
            reasons = [f"Biometric similarity ({similarity}) exceeds authorized threshold ({m_thresh})."]
            requires_review = False
        elif similarity < r_thresh:
            status = "NO_MATCH"
            reasons = [f"Biometric similarity ({similarity}) is below rejection threshold ({r_thresh})."]
            requires_review = False
        else:
            status = "INCONCLUSIVE"
            reasons = [f"Biometric similarity ({similarity}) falls in borderline review zone [{r_thresh}, {m_thresh})."]
            requires_review = True

        return {
            "status": status,
            "similarity_score": similarity,
            "threshold_applied": m_thresh,
            "review_threshold_applied": r_thresh,
            "reference_quality": ref_qual,
            "probe_quality": probe_qual,
            "reasons": reasons,
            "requires_manual_review": requires_review,
        }

face_matcher = FaceEmbeddingModel()
