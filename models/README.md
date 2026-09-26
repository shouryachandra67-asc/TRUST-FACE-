# Model Weights and Architecture Registry

This directory contains configuration, checkpoints, and documentation for machine learning models utilized in **TrustFace AI**.

## Supported Model Families
- **EfficientNet-B0 / B4** (FaceForensics++ fine-tuned binary classifier)
- **ResNet50 / ResNeXt50** (Artifact & texture frequency analysis)
- **Vision Transformer (ViT-B/16)** (Attention patches for deepfake boundary inconsistencies)

## Strict Academic & Licensing Policy
- Weights are NOT tracked in Git (enforced via `.gitignore`).
- Download authorized model weights into this directory or configure the environment variable:
  ```env
  MODEL_PATH=models/efficientnet_b0_deepfake.pth
  ```
- If no checkpoint is present, TrustFace AI boots in explicit **"MODEL NOT CONFIGURED"** mode. It will never synthesize mock inferences or random classifications.
