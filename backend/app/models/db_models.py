import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from ..config import settings

Base = declarative_base()

class UserAccount(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst") # admin, analyst, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    subject_id = Column(String(100), nullable=True, index=True)
    policy = Column(String(50), default="BALANCED") # STRICT, BALANCED, FAST
    
    # Independent module results
    image_authenticity_status = Column(String(50), default="NOT_TESTED")
    image_authenticity_confidence = Column(Float, nullable=True)
    image_authenticity_model = Column(String(100), nullable=True)
    
    identity_match_status = Column(String(50), default="NOT_TESTED")
    identity_match_score = Column(Float, nullable=True)
    
    liveness_status = Column(String(50), default="NOT_TESTED")
    liveness_score = Column(Float, nullable=True)
    
    document_integrity_status = Column(String(50), default="NOT_TESTED")
    document_integrity_score = Column(Float, nullable=True)
    document_type = Column(String(50), nullable=True)
    
    # Synthesized decision
    final_decision = Column(String(50), nullable=False) # VERIFIED, REJECTED, MANUAL_REVIEW, INCOMPLETE
    reasons_json = Column(Text, default="[]")
    module_details_json = Column(Text, default="{}")
    
    # Retention & privacy
    retention_expires_at = Column(DateTime, nullable=True)
    is_scrubbed = Column(Boolean, default=False)

    def get_reasons(self) -> List[str]:
        try:
            return json.loads(self.reasons_json or "[]")
        except Exception:
            return []

    def set_reasons(self, reasons: List[str]):
        self.reasons_json = json.dumps(reasons)

    def get_module_details(self) -> Dict[str, Any]:
        try:
            return json.loads(self.module_details_json or "{}")
        except Exception:
            return {}

    def set_module_details(self, details: Dict[str, Any]):
        self.module_details_json = json.dumps(details)

class LivenessSessionRecord(Base):
    __tablename__ = "liveness_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    nonce = Column(String(64), nullable=False)
    challenges_json = Column(Text, nullable=False)
    current_step = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    replay_token = Column(String(64), unique=True, index=True)

    def get_challenges(self) -> List[str]:
        try:
            return json.loads(self.challenges_json or "[]")
        except Exception:
            return []

    def set_challenges(self, challenges: List[str]):
        self.challenges_json = json.dumps(challenges)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    action = Column(String(100), nullable=False)
    actor = Column(String(100), default="anonymous")
    ip_address = Column(String(50), default="127.0.0.1")
    resource_id = Column(String(100), nullable=True)
    status = Column(String(50), default="SUCCESS")
    details_json = Column(Text, default="{}")

# Database initialization
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

# Auto-initialize SQLite tables on load
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
