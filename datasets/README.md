# Datasets Directory

This directory hosts manifest definitions, preprocessing metadata, and training/validation split indices for deepfake benchmark datasets.

## Benchmark Datasets Supported
1. **FaceForensics++ (FF++)**: High-quality Deepfakes, Face2Face, FaceSwap, NeuralTextures, and pristine videos.
2. **Celeb-DF (v2)**: High-resolution real and deepfake video clips with improved visual quality and reduced artifacts.
3. **Deepfake Detection Challenge (DFDC)**: Broad dataset with diverse demographics, lighting variations, and compression levels.

## Privacy & Ethical Compliance
- Under GDPR and biometric governance principles, raw human facial data is never committed to public repositories.
- Use the preprocessing scripts in `training/preprocessing/` to extract normalized face crops at 224x224 before training.
