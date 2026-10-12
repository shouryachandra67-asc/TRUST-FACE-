import uuid
from fastapi import APIRouter, UploadFile, File, Query, HTTPException, status
from fastapi.responses import Response
from ..schemas.verity_schemas import DocumentAnalyzeResponse
from ..utils.file_validation import validate_image_bytes
from ..services.document_analysis import document_analyzer

router = APIRouter(prefix="/v1/document", tags=["Document Integrity"])

@router.post("/analyze", response_model=DocumentAnalyzeResponse)
async def analyze_document(file: UploadFile = File(...)):
    """
    Forensic Identity Document Inspection:
    1. Validates card layout, geometry, and optical resolution.
    2. Isolates official biometric portrait for cross-matching.
    3. Runs localized Error Level Analysis (ELA) for digital tampering.
    4. Extracts permitted alphanumeric fields (MRZ, ID number, Expiry).
    5. Validates validity against reference date (2026-10-12).
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded document file is empty.",
        )

    doc_bgr = validate_image_bytes(file_bytes)
    result = document_analyzer.analyze_document_bgr(doc_bgr)
    analysis_id = str(uuid.uuid4())

    return DocumentAnalyzeResponse(
        analysis_id=analysis_id,
        status=result["status"],
        document_type=result["document_type"],
        aspect_ratio=result["aspect_ratio"],
        sharpness_score=result["sharpness_score"],
        tamper_risk_score=result["tamper_risk_score"],
        is_tampered=result["is_tampered"],
        portrait_detected=result["portrait_detected"],
        extracted_portrait_base64=result["extracted_portrait_base64"],
        ela_heatmap_base64=result["ela_heatmap_base64"],
        extracted_fields=result["extracted_fields"],
        expiration_check=result["expiration_check"],
        technical_signals=result["technical_signals"],
        warnings=result["warnings"],
        reasons=result["reasons"],
    )

@router.get("/synthetic-sample")
async def get_synthetic_sample(
    sample_type: str = Query("genuine", enum=["genuine", "tampered", "expired"]),
    name: str = Query("ALEXANDER CHEN"),
):
    """
    Development & Testing Utility:
    Generates synthetic high-resolution spec documents for automated verification tests.
    Does not store or utilize genuine identity documents.
    """
    if sample_type == "tampered":
        img_bytes = document_analyzer.generate_synthetic_document(
            name=name,
            id_number="ID-9821-X",
            expiry_date="2028-09-30",
            tamper=True,
        )
    elif sample_type == "expired":
        img_bytes = document_analyzer.generate_synthetic_document(
            name=name,
            id_number="ID-1049-EXP",
            expiry_date="2025-05-15", # Expired relative to 2026-10-12
            tamper=False,
        )
    else:
        img_bytes = document_analyzer.generate_synthetic_document(
            name=name,
            id_number="ID-8421-9902",
            expiry_date="2028-11-20",
            tamper=False,
        )

    return Response(content=img_bytes, media_type="image/jpeg")
