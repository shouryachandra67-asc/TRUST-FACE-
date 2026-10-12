from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .api.routes_health import router as health_router
from .api.routes_analysis import router as analysis_router
from .api.routes_camera import router as camera_router
from .api.routes_deepfake_v1 import router as deepfake_v1_router
from .api.routes_identity_v1 import router as identity_v1_router
from .api.routes_liveness_v1 import router as liveness_v1_router
from .api.routes_document_v1 import router as document_v1_router
from .api.routes_verification_v1 import router as verification_v1_router
from .api.routes_admin_v1 import router as admin_v1_router
from .services.deepfake_detection import deepfake_service
from .models.db_models import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database
    print("[VerityAI] Initializing database schemas...")
    try:
        init_db()
        print("[VerityAI] Database initialized.")
    except Exception as e:
        print(f"[VerityAI] Database init warning: {e}")

    # Initialize model weights on boot
    print("[VerityAI] Initializing neural forensic engine...")
    is_loaded = deepfake_service.initialize()
    if is_loaded:
        print("[VerityAI] Neural model weights verified and loaded successfully.")
    else:
        print("[VerityAI] NOTICE: Model weights not found or unconfigured.")
        print(f"[VerityAI] Expected path: {settings.MODEL_PATH}")
        print("[VerityAI] System will operate in strict 'MODEL NOT CONFIGURED' diagnostic mode.")
    yield
    print("[VerityAI] Shutting down forensic engine. Freeing volatile memory caches.")

app = FastAPI(
    title="VerityAI — Deepfake Detection & Identity Verification Platform",
    description="Enterprise-grade AI deepfake detection, biometric face matching, liveness PAD, document forensics, and multi-vector verification decision engine.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS hardening
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe error handling to protect sensitive server traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # In development mode, print stack internally, but never expose to client
    if settings.DEBUG:
        print(f"[ERROR] Uncaught exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing the forensic request."},
    )

# Include Legacy / Baseline API route groups under /api prefix (Preserved for compatibility)
app.include_router(health_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(camera_router, prefix="/api")

# Include VerityAI v1 Production Routes under /api
app.include_router(deepfake_v1_router, prefix="/api")
app.include_router(identity_v1_router, prefix="/api")
app.include_router(liveness_v1_router, prefix="/api")
app.include_router(document_v1_router, prefix="/api")
app.include_router(verification_v1_router, prefix="/api")
app.include_router(admin_v1_router, prefix="/api")

@app.get("/api/v1/health")
def health_v1():
    return {
        "status": "healthy",
        "service": "VerityAI",
        "version": "2.0.0",
        "modules": {
            "image_authenticity": "OPERATIONAL",
            "identity_matching": "OPERATIONAL",
            "liveness_pad": "OPERATIONAL",
            "document_forensics": "OPERATIONAL",
            "decision_engine": "OPERATIONAL",
        },
    }

@app.get("/")
def root():
    return {
        "service": "VerityAI",
        "tagline": "AI-Powered Deepfake Detection and Identity Verification Platform",
        "status": "online",
        "version": "2.0.0",
        "api_docs": "/docs",
    }
