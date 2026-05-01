from datetime import datetime

from pydantic import BaseModel, Field


class Stub311Draft(BaseModel):
    service_name: str
    description: str
    address: str | None
    lat: float
    lng: float
    agency_responsible: str = "SF Public Works / DPW"
    status: str = "Report Submitted"


class ReportResponse(BaseModel):
    id: str
    category: str | None
    severity: str | None
    ai_label: str | None
    ai_confidence: float | None
    explanation: str | None
    address: str | None
    is_duplicate: bool
    duplicate_of_case_id: str | None
    draft_311: Stub311Draft
    media_url: str | None = None


class MyReportItem(BaseModel):
    id: str
    category: str | None
    severity: str | None
    address: str | None
    neighborhood: str | None
    status: str
    created_at: datetime
    is_duplicate: bool
    media_url: str | None = None
