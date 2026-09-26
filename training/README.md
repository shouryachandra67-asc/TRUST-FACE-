# Training & Evaluation Pipeline

This module hosts the reproducible machine learning training, validation, and evaluation pipelines for **TrustFace AI**.

## Pipeline Architecture
```text
Raw Dataset 
   ↓
Face Detector (MediaPipe / Haar / RetinaFace)
   ↓
Tightly Cropped Face ROI + Margin
   ↓
Resize (224x224) & Augmentation (ColorJitter, HorizontalFlip, GaussianBlur, Compression Simulation)
   ↓
Backbone Architecture (EfficientNet-B0 / ResNet)
   ↓
BCEWithLogitsLoss / CrossEntropyLoss with Temperature Calibration
   ↓
Model Checkpointing & Evaluation Metrics (AUC-ROC, F1, EER, Confusion Matrix)
```

## Running Training
```bash
python training/train.py --dataset_dir datasets/sample --epochs 10 --batch_size 32 --lr 1e-4
```

## Running Evaluation
```bash
python training/evaluate.py --model_path models/efficientnet_b0_deepfake.pth --test_manifest datasets/test.csv
```
