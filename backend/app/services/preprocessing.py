import cv2
import numpy as np
import torch
from typing import Tuple

class PreprocessingService:
    def __init__(self, target_size: Tuple[int, int] = (224, 224), margin_ratio: float = 0.15):
        self.target_size = target_size
        self.margin_ratio = margin_ratio
        
        # Standard ImageNet normalization coefficients
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(1, 1, 3)
        self.std = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 1, 3)

    def extract_face_roi(self, image_bgr: np.ndarray, box: Tuple[int, int, int, int]) -> np.ndarray:
        """
        Extracts face bounding box with contextual margin to capture
        hairline, chin, and cheek blending seams.
        """
        x, y, w, h = box
        img_h, img_w = image_bgr.shape[:2]

        margin_x = int(w * self.margin_ratio)
        margin_y = int(h * self.margin_ratio)

        x1 = max(0, x - margin_x)
        y1 = max(0, y - margin_y)
        x2 = min(img_w, x + w + margin_x)
        y2 = min(img_h, y + h + margin_y)

        crop = image_bgr[y1:y2, x1:x2]
        return crop

    def compute_blur_variance(self, image_bgr: np.ndarray) -> float:
        """
        Calculates the Laplacian variance to quantify high-frequency sharpness.
        Variance < 80 indicates excessive motion blur or defocusing.
        """
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        variance = float(laplacian.var())
        return variance

    def preprocess_for_inference(self, face_bgr: np.ndarray) -> Tuple[torch.Tensor, np.ndarray]:
        """
        Converts BGR face crop into:
        1. PyTorch normalized tensor of shape (1, 3, 224, 224)
        2. Clean 224x224 RGB image for visual rendering and Grad-CAM blending
        """
        # Convert BGR to RGB
        face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
        
        # Resize to 224x224
        resized_rgb = cv2.resize(face_rgb, self.target_size, interpolation=cv2.INTER_LINEAR)

        # Normalize to [0, 1] then subtract mean / divide std
        normalized = (resized_rgb.astype(np.float32) / 255.0 - self.mean) / self.std

        # Transpose from (H, W, C) to (C, H, W)
        tensor_chw = np.transpose(normalized, (2, 0, 1))

        # Add batch dimension -> (1, C, H, W)
        tensor_batch = torch.from_numpy(tensor_chw).unsqueeze(0).float()

        return tensor_batch, resized_rgb

preprocessor = PreprocessingService()
