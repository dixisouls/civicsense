import logging
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.dependencies import get_db
from app.exceptions import ValidationError
from app.schemas.feed import FeedItem, FeedResponse

logger = logging.getLogger("civicsense.feed")
router = APIRouter(prefix="/feed", tags=["feed"])

VALID_SORT = {"stalest", "hottest", "nearest"}


@router.get("", response_model=FeedResponse)
def get_feed(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius_meters: int = Query(800, ge=50, le=5000),
    category: str | None = Query(None),
    sort: str = Query("nearest"),
    db: Session = Depends(get_db),
):
    if sort not in VALID_SORT:
        raise ValidationError(f"sort must be one of: {', '.join(VALID_SORT)}.")

    # Build the ORDER BY clause
    if sort == "stalest":
        order_clause = "opened_date ASC NULLS LAST"
    elif sort == "hottest":
        order_clause = "opened_date DESC NULLS LAST"
    else:  # nearest
        order_clause = f"ST_Distance(location, ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326)) ASC"

    category_filter = "AND category = :category" if category else ""

    sql = text(f"""
        SELECT
            id::text,
            category,
            address,
            neighborhood,
            status,
            opened_date,
            media_url,
            source,
            severity,
            EXTRACT(DAY FROM (NOW() - opened_date))::int AS days_open
        FROM (
            SELECT
                id, category, address, neighborhood, status,
                opened_date, media_url, source,
                NULL::text AS severity,
                location
            FROM cases
            WHERE
                ST_DWithin(
                    location,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radius
                )
                AND status NOT ILIKE '%closed%'
                {category_filter}

            UNION ALL

            SELECT
                id, category, address, neighborhood, status,
                created_at AS opened_date, media_url, source,
                severity,
                location
            FROM user_reports
            WHERE
                ST_DWithin(
                    location,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radius
                )
                {category_filter}
        ) combined
        ORDER BY {order_clause}
        LIMIT 200
    """)

    params: dict = {"lat": lat, "lng": lng, "radius": radius_meters}
    if category:
        params["category"] = category

    rows = db.execute(sql, params).fetchall()

    items = [
        FeedItem(
            id=str(row.id),
            category=row.category,
            address=row.address,
            days_open=row.days_open or 0,
            source=row.source,
            severity=row.severity,
            status=row.status,
            media_url=row.media_url,
            neighborhood=row.neighborhood,
            opened_date=row.opened_date,
        )
        for row in rows
    ]

    return FeedResponse(items=items, total=len(items))
