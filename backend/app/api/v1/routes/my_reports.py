import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_uid
from app.db.models import UserReport
from app.dependencies import get_db
from app.schemas.report import MyReportItem

logger = logging.getLogger("civicsense.my_reports")
router = APIRouter(prefix="/my-reports", tags=["my-reports"])


@router.get("", response_model=list[MyReportItem])
def get_my_reports(
    uid: str = Depends(get_current_uid),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(UserReport)
        .filter(UserReport.user_id == uid)
        .order_by(UserReport.created_at.desc())
        .all()
    )

    return [
        MyReportItem(
            id=str(r.id),
            category=r.category,
            severity=r.severity,
            address=r.address,
            neighborhood=r.neighborhood,
            status=r.status,
            created_at=r.created_at,
            is_duplicate=r.is_duplicate,
            media_url=r.media_url,
        )
        for r in reports
    ]
