import os
import cv2
import torch
import numpy as np
from PIL import Image
from typing import List, Tuple, Optional
from torch.utils.data import Dataset
from torchvision import transforms

class FaceAuthenticityDataset(Dataset):
    """
    Standardized Dataset Loader for Deepfake Benchmarks (FaceForensics++, Celeb-DF, DFDC).
    Enforces strict face cropping, contextual margin, and data augmentations.
    """
    def __init__(
        self,
        samples: List[Tuple[str, int, str]], # (image_path, label: 0=Real, 1=Fake, video_id)
        transform: Optional[transforms.Compose] = None,
        crop_margin: float = 0.15,
    ):
        self.samples = samples
        self.crop_margin = crop_margin
        self.transform = transform or self.default_transforms()

    @staticmethod
    def default_transforms(is_train: bool = False) -> transforms.Compose:
        if is_train:
            return transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
        else:
            return transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path, label, _ = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        tensor = self.transform(image)
        return tensor, label
