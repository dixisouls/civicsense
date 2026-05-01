from datetime import datetime

from geoalchemy2 import Geography
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    case_id = Column(String(64), unique=True, nullable=False, index=True)
    category = Column(String(128), nullable=True, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(64), nullable=True, index=True)
    opened_date = Column(DateTime(timezone=True), nullable=True, index=True)
    updated_date = Column(DateTime(timezone=True), nullable=True, index=True)
    address = Column(Text, nullable=True)
    neighborhood = Column(String(128), nullable=True, index=True)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=True)
    media_url = Column(Text, nullable=True)
    source = Column(String(32), nullable=False, default="311")

    __table_args__ = (
        Index("idx_cases_location", "location", postgresql_using="gist"),
        Index("idx_cases_opened_date", "opened_date"),
        Index("idx_cases_neighborhood", "neighborhood"),
        Index("idx_cases_category", "category"),
    )


class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(String(128), nullable=False, index=True)
    category = Column(String(128), nullable=True, index=True)
    severity = Column(String(32), nullable=True)
    ai_label = Column(String(256), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    ai_explanation = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    neighborhood = Column(String(128), nullable=True, index=True)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=True)
    media_url = Column(Text, nullable=True)
    status = Column(String(64), nullable=False, default="Report Submitted")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    is_duplicate = Column(Boolean, nullable=False, default=False)
    duplicate_of_case_id = Column(String(64), nullable=True)
    source = Column(String(32), nullable=False, default="user")

    __table_args__ = (
        Index("idx_user_reports_location", "location", postgresql_using="gist"),
        Index("idx_user_reports_user_id", "user_id"),
        Index("idx_user_reports_created_at", "created_at"),
    )
