# TRUSTFACE AI

> **"Verify. Detect. Trust."**  
> Multimodal AI Deepfake, Liveness & Identity Authenticity Detection Platform

---

## 1. Project Overview
**TrustFace AI** is an academic and enterprise-grade deep learning system engineered to assess digital media authenticity. Designed with rigorous computer-vision standards, it determines whether facial media is genuine, AI-synthesized, manipulated, or uncertain. 

### Core Ethical & ML Guarantees
- **No Pseudo-AI**: Strict prohibition of synthetic/random predictions or hard-coded results. All outputs derive from real computer vision pipelines and PyTorch neural network checkpoints.
- **Fail-Safe Integrity**: When model weights are unconfigured or when confidence is statistically insufficient, the system reports explicit diagnostic states (`MODEL NOT CONFIGURED` or `UNCERTAIN`) rather than guessing.
- **Privacy By Design**: Uploaded media and live camera frames undergo ephemeral processing in volatile memory, with immediate memory reclamation and zero persistent biometric tracking.

---

## 2. System Architecture
```text
                    TRUSTFACE AI
                         |
              +----------+----------+
              |                     |
          IMAGE UPLOAD          CAMERA
              |                     |
              +----------+----------+
                         |
                  FACE DETECTION
                         |
             +-----------+-----------+
             |                       |
          0 FACES               2+ FACES
             |                       |
          REJECT                  REJECT
             |
          1 FACE
             |
       PREPROCESSING (Alignment & 224x224 Crop)
             |
       AI AUTHENTICITY MODEL (EfficientNet / ResNet)
             |
       +-----+------+------+
       |            |      |
      REAL       AI-GEN   MANIPULATED
       |            |      |
       +------------+------+
                    |
          CONFIDENCE CALCULATION
                    |
          EXPLAINABLE AI (Grad-CAM Heatmap)
                    |
          FORENSIC REPORT GENERATION
```

---

## 3. Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React icons.
- **Backend API**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, python-multipart.
- **Computer Vision**: OpenCV (cv2), MediaPipe / Haar cascade face detection, Pillow, NumPy.
- **Machine Learning**: PyTorch, Torchvision, Scikit-learn, SciPy.
- **Explainable AI (XAI)**: Grad-CAM (Gradient-weighted Class Activation Mapping).
- **Metadata Database**: SQLite (expandable to PostgreSQL via SQLAlchemy / asyncpg).

---

## 4. Quick Start (Windows)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup
```powershell
# Open terminal in project root
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup
```powershell
# Open a separate terminal
cd frontend
npm.cmd install
npm.cmd run dev
```

---

## 5. Development Phases
- [x] **PHASE 1**: Project Structure & Environment Setup
- [ ] **PHASE 2**: React UI (Cybersecurity Dark Theme, Glassmorphism)
- [ ] **PHASE 3**: FastAPI Backend Service
- [ ] **PHASE 4**: Image Upload Pipeline & Strict Validation
- [ ] **PHASE 5**: Single-Face Detection (Reject 0 or 2+ faces)
- [ ] **PHASE 6**: Authentic Deepfake Model Architecture
- [ ] **PHASE 7**: Prediction API & Confidence Calibration
- [ ] **PHASE 8**: Forensic Result Dashboard
- [ ] **PHASE 9**: Explainable AI (Grad-CAM Visual Heatmaps)
- [ ] **PHASE 10**: Real-Time Camera Acquisition Mode
- [ ] **PHASE 11**: Model Evaluation & Academic Metrics
- [ ] **PHASE 12**: Liveness & Anti-Spoofing Architecture
- [ ] **PHASE 13**: Video Media Processing Engine
- [ ] **PHASE 14**: Audio Synthesis Detection Engine
- [ ] **PHASE 15**: Document Authenticity Verification
- [ ] **PHASE 16**: Multimodal Decision Fusion
- [ ] **PHASE 17**: Security Hardening & Zero-Biometric Storage
- [ ] **PHASE 18**: Unit & Integration Test Suite
- [ ] **PHASE 19**: Research Documentation & Evaluation Paper
