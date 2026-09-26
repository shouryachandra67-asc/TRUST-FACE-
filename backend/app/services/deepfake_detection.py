from .prediction import pipeline_orchestrator
from ..models.model_loader import model_adapter

class DeepfakeDetectionService:
    """Service wrapper for deepfake and image authenticity operations."""
    def __init__(self):
        self.orchestrator = pipeline_orchestrator
        self.model = model_adapter

    def initialize(self):
        """Loads weights and verifies model state during application startup."""
        return self.model.load()

    def analyze(self, image_bgr):
        """Analyzes single image matrix."""
        return self.orchestrator.run_pipeline(image_bgr)

deepfake_service = DeepfakeDetectionService()
