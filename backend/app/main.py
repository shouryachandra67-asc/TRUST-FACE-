from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .api.routes_health import router as health_router
from .api.routes_analysis import router as analysis_router
from .api.routes_camera import router as camera_router
from .services.deepfake_detection import deepfake_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize model weights on boot
    print("[TrustFace AI] Initializing neural forensic engine...")
    is_loaded = deepfake_service.initialize()
    if is_loaded:
        print("[TrustFace AI] Neural model weights verified and loaded successfully.")
    else:
        print("[TrustFace AI] NOTICE: Model weights not found or unconfigured.")
        print(f"[TrustFace AI] Expected path: {settings.MODEL_PATH}")
        print("[TrustFace AI] System will operate in strict 'MODEL NOT CONFIGURED' diagnostic mode.")
    yield
    print("[TrustFace AI] Shutting down forensic engine. Freeing volatile memory caches.")

app = FastAPI(
    title="TrustFace AI — Multimodal Authenticity Engine",
    description="Production-grade AI deepfake, face authenticity, and biometric integrity detection platform.",
    version="1.0.0",
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

# Include API route groups under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(camera_router, prefix="/api")

@app.get("/")
def root():
    return {
        "service": "TrustFace AI",
        "tagline": "Verify. Detect. Trust.",
        "status": "online",
        "api_docs": "/docs",
    }
