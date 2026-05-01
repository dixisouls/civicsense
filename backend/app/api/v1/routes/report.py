import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import text
from sqlalchemy.orm import Session

from geoalchemy2.elements import WKTElement

from app.config import get_settings
from app.core.auth import get_current_uid
from app.core.gemini import analyze_photo
from app.db.models import UserReport
from app.dependencies import get_db
from app.exceptions import ValidationError, ExternalServiceError
from app.schemas.report import ReportResponse, Stub311Draft

logger = logging.getLogger("civicsense.report")
router = APIRouter(prefix="/report", tags=["report"])

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post("", response_model=ReportResponse, status_code=201)
async def submit_report(
    lat: float = Form(..., ge=-90, le=90),
    lng: float = Form(..., ge=-180, le=180),
    address: str | None = Form(None),
    neighborhood: str | None = Form(None),
    photo: UploadFile = File(...),
    uid: str = Depends(get_current_uid),
    db: Session = Depends(get_db),
):
    settings = get_settings()

    # --- Validate photo ---
    if photo.content_type not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            f"Unsupported file type: {photo.content_type}. "
            "Please upload a JPEG, PNG, WebP, or HEIC image."
        )

    photo_bytes = await photo.read()
    if len(photo_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValidationError("Photo must be smaller than 20 MB.")

    # --- Save photo ---
    uploads_dir = Path(settings.uploads_dir)
    uploads_dir.mkdir(parents=True, exist_ok=True)

    ext = photo.filename.rsplit(".", 1)[-1].lower() if photo.filename and "." in photo.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    photo_path = uploads_dir / filename

    photo_path.write_bytes(photo_bytes)
    media_url = f"{settings.base_url}/uploads/{filename}"

    # --- Gemini analysis ---
    try:
        analysis = analyze_photo(str(photo_path))
    except ExternalServiceError:
        # Non-blocking: if Gemini fails we still save the report with unknowns
        logger.warning("Gemini analysis failed for report by uid=%s, continuing.", uid)
        analysis = None

    category = analysis.category if analysis else "Other"
    severity = analysis.severity if analysis else "unknown"
    ai_label = analysis.ai_label if analysis else None
    ai_confidence = analysis.ai_confidence if analysis else None
    explanation = analysis.explanation if analysis else None

    # --- Deduplication check ---
    dedup_sql = text("""
        SELECT case_id FROM cases
        WHERE
            ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radius
            )
            AND category ILIKE :category
            AND status NOT ILIKE '%closed%'
        LIMIT 1
    """)

    dedup_row = db.execute(
        dedup_sql,
        {
            "lat": lat,
            "lng": lng,
            "radius": settings.dedup_radius_meters,
            "category": category,
        },
    ).fetchone()

    is_duplicate = dedup_row is not None
    duplicate_of_case_id = str(dedup_row.case_id) if dedup_row else None

    # --- Insert user report ---
    report = UserReport(
        user_id=uid,
        category=category,
        severity=severity,
        ai_label=ai_label,
        ai_confidence=ai_confidence,
        ai_explanation=explanation,
        address=address,
        neighborhood=neighborhood,
        location=WKTElement(f"POINT({lng} {lat})", srid=4326),
        media_url=media_url,
        is_duplicate=is_duplicate,
        duplicate_of_case_id=duplicate_of_case_id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    draft = Stub311Draft(
        service_name=category,
        description=explanation or f"Street issue reported: {category}.",
        address=address,
        lat=lat,
        lng=lng,
    )

    return ReportResponse(
        id=str(report.id),
        category=category,
        severity=severity,
        ai_label=ai_label,
        ai_confidence=ai_confidence,
        explanation=explanation,
        address=address,
        is_duplicate=is_duplicate,
        duplicate_of_case_id=duplicate_of_case_id,
        draft_311=draft,
        media_url=media_url,
    )
