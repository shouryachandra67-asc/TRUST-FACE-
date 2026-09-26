# TrustFace AI — Machine Learning Methodology

## 1. Problem Formulation
Digital facial manipulation encompasses four primary categories:
1. **Deepfake / Face Swapping**: Generative autoencoders replacing identity (e.g., DeepFaceLab, FaceSwap).
2. **Face Reenactment / Puppetry**: Driving facial expression from a source actor (e.g., Face2Face).
3. **Face Synthesis**: Whole synthetic faces generated from pure noise priors (e.g., StyleGAN 2/3, Diffusion).
4. **Attribute Manipulation**: Localized alterations of hair, age, gender, or skin tone.

TrustFace AI targets forensic classification of high-resolution facial crops by detecting micro-texture inconsistencies, frequency artifact anomalies, and boundary blending artifacts.

## 2. Convolutional Backbone Selection
- **EfficientNet-B0**: Chosen for optimal trade-off between floating-point operations (FLOPs), parameter count (5.3M), and feature extraction capabilities across multi-scale receptive fields via compound scaling.
- **Input Specifications**: Single RGB image resized to \(224 \times 224 \times 3\), standardized using ImageNet mean \([0.485, 0.456, 0.406]\) and standard deviation \([0.229, 0.224, 0.225]\).

## 3. Explainability via Grad-CAM
Gradient-weighted Class Activation Mapping (Grad-CAM) calculates the gradient of the predicted logit \(y^c\) with respect to feature activation maps \(A^k\) of the final convolutional layer:
$$\alpha_k^c = \frac{1}{Z} \sum_i \sum_j \frac{\partial y^c}{\partial A_{ij}^k}$$
$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
The resulting coarse 2D activation map is upsampled via bilinear interpolation and mapped with a Jet/Inferno colormap overlay.

## 4. Confidence Calibration & Uncertainty
Confidence is mapped via temperature-scaled Softmax:
$$P(y = c | x) = \frac{\exp(z_c / T)}{\sum_j \exp(z_j / T)}$$
If \(\max_c P(y = c | x) < 0.60\) or image Laplacian variance \(\sigma^2 < 100\) (excessive blur), the classification triggers an explicit state: `UNCERTAIN`.
