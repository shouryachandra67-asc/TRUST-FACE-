import cv2
import numpy as np
import torch
import torch.nn.functional as F
from typing import Optional, Tuple
from ..utils.security import cv2_to_base64_data_url

class GradCAMService:
    """
    Gradient-weighted Class Activation Mapping (Grad-CAM) implementation
    for convolutional neural network visual interpretability.
    """
    def __init__(self):
        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None

    def _save_gradient(self, grad: torch.Tensor):
        self.gradients = grad

    def generate_heatmap(
        self,
        model: torch.nn.Module,
        target_layer: torch.nn.Module,
        input_tensor: torch.Tensor,
        rgb_face_image: np.ndarray,
        target_class: Optional[int] = None,
    ) -> Optional[str]:
        """
        Executes Grad-CAM and returns a Base64-encoded composite overlay.
        """
        model.eval()

        # Register forward hook to capture activations
        def forward_hook(module, input, output):
            self.activations = output

        # Register backward hook to capture gradients
        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0]

        handle_forward = target_layer.register_forward_hook(forward_hook)
        handle_backward = target_layer.register_full_backward_hook(backward_hook)

        try:
            # Enable gradient calculation temporarily
            input_tensor.requires_grad_(True)
            output = model(input_tensor)

            if target_class is None:
                target_class = int(torch.argmax(output, dim=1).item())

            # Backward pass on the specific class logit
            model.zero_grad()
            class_score = output[0, target_class]
            class_score.backward(retain_graph=True)

            if self.gradients is None or self.activations is None:
                return None

            # Calculate channel weights via global average pooling of gradients
            weights = torch.mean(self.gradients, dim=[2, 3], keepdim=True)
            cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
            cam = F.relu(cam)

            # Squeeze and convert to numpy
            cam_np = cam.squeeze().detach().cpu().numpy()
            
            # Normalize to 0-1
            cam_min, cam_max = cam_np.min(), cam_np.max()
            if cam_max - cam_min > 1e-8:
                cam_normalized = (cam_np - cam_min) / (cam_max - cam_min)
            else:
                cam_normalized = np.zeros_like(cam_np)

            # Resize CAM to match face image (224x224)
            h, w = rgb_face_image.shape[:2]
            heatmap_resized = cv2.resize(cam_normalized, (w, h))

            # Convert to 8-bit and apply colormap (COLORMAP_JET)
            heatmap_uint8 = np.uint8(255 * heatmap_resized)
            heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

            # Convert RGB face image to BGR for OpenCV blending
            face_bgr = cv2.cvtColor(rgb_face_image, cv2.COLOR_RGB2BGR)

            # Blend original face crop with heatmap (60% face + 40% heatmap)
            blended = cv2.addWeighted(face_bgr, 0.60, heatmap_color, 0.40, 0)

            # Return as Base64 JPEG data URL
            return cv2_to_base64_data_url(blended, format="jpeg", quality=92)
        except Exception as e:
            return None
        finally:
            handle_forward.remove()
            handle_backward.remove()
            self.gradients = None
            self.activations = None

gradcam_service = GradCAMService()
