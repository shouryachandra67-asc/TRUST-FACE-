import os
import torch
import torch.nn as nn
from typing import Optional, Dict, Any, Tuple
import torchvision.models as models
from ..config import settings

class AuthenticityModel:
    """
    Modular deepfake & authenticity model adapter adhering to academic standards.
    Strictly forbids pseudo-AI or randomized output generation.
    """
    def __init__(self, model_path: Optional[str] = None, device: Optional[str] = None):
        self.model_path = model_path or settings.MODEL_PATH
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
        self.is_configured: bool = False
        self.architecture_name: str = "EfficientNet-B0-Deepfake"
        self.model: Optional[nn.Module] = None
        self.target_layer: Optional[nn.Module] = None

    def build_architecture(self) -> nn.Module:
        """
        Builds the Convolutional EfficientNet-B0 backbone with a custom
        forensic binary classification head:
          0 -> REAL / GENUINE
          1 -> POTENTIAL MANIPULATION / AI-GENERATED
        """
        # Load backbone
        base_model = models.efficientnet_b0(weights=None)
        
        # Replace classifier head: in_features is 1280
        in_features = base_model.classifier[1].in_features
        base_model.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Linear(in_features, 2)
        )
        return base_model

    def load(self) -> bool:
        """
        Loads trained model weights from the filesystem.
        If no weights checkpoint exists, marks is_configured as False.
        """
        self.model = self.build_architecture()
        self.model.to(self.device)
        self.model.eval()

        # The target layer for Grad-CAM in EfficientNet-B0 is the final conv stage (features[8])
        self.target_layer = self.model.features[8]

        if os.path.exists(self.model_path):
            try:
                state_dict = torch.load(self.model_path, map_location=self.device)
                # Handle cases where state_dict is wrapped inside an outer dict
                if isinstance(state_dict, dict) and "state_dict" in state_dict:
                    state_dict = state_dict["state_dict"]
                self.model.load_state_dict(state_dict, strict=False)
                self.is_configured = True
                return True
            except Exception as e:
                self.is_configured = False
                return False
        else:
            # Model weights not found on disk
            self.is_configured = False
            return False

    def predict(self, input_tensor: torch.Tensor) -> Tuple[Dict[str, float], str, float]:
        """
        Runs mathematical model inference.
        Returns:
            scores: Dict with real, manipulation, and uncertain calibrated confidence.
            verdict: REAL, POTENTIAL MANIPULATION, or UNCERTAIN
            primary_confidence: float [0, 1]
        """
        if not self.is_configured or self.model is None:
            return (
                {"real": 0.0, "manipulation": 0.0, "uncertain": 1.0},
                "MODEL NOT CONFIGURED",
                0.0,
            )

        input_tensor = input_tensor.to(self.device)
        with torch.no_grad():
            logits = self.model(input_tensor)
            # Softmax with temperature scaling T=1.0
            probabilities = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        p_real = float(probabilities[0])
        p_fake = float(probabilities[1])

        # Evaluate against confidence rejection floor
        max_prob = max(p_real, p_fake)
        margin = abs(p_real - p_fake)

        if max_prob < settings.CONFIDENCE_THRESHOLD or margin < settings.UNCERTAINTY_MARGIN:
            verdict = "UNCERTAIN"
            p_uncertain = 1.0 - max_prob
            scores = {
                "real": round(p_real, 3),
                "manipulation": round(p_fake, 3),
                "uncertain": round(p_uncertain, 3),
            }
            return scores, verdict, round(max_prob, 3)

        verdict = "REAL" if p_real > p_fake else "POTENTIAL MANIPULATION"
        scores = {
            "real": round(p_real, 3),
            "manipulation": round(p_fake, 3),
            "uncertain": 0.0,
        }
        return scores, verdict, round(max_prob, 3)

model_adapter = AuthenticityModel()
