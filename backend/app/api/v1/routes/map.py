import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.dependencies import get_db
from app.exceptions import ValidationError
from app.schemas.map import HeatmapPoint, HeatmapResponse, LiveMapResponse, MapMarker

logger = logging.getLogger("civicsense.map")
router = APIRouter(prefix="/map", tags=["map"])


@router.get("/live", response_model=LiveMapResponse)
def get_live_map(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_meters: int = Query(5000, ge=100, le=50000),
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Returns markers for the last 7 days within a radius.
    Includes 311 cases (by updated_date) and all user reports.
    Capped at 500 markers.
    """
    settings = get_settings()
    category_filter = "AND category = :category" if category else ""
    cutoff = datetime.now(timezone.utc) - timedelta(days=settings.live_map_days)

    sql = text(f"""
        SELECT
            id::text,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng,
            category,
            source,
            media_url
        FROM (
            SELECT id, location, category, source, media_url, updated_date AS ref_date
            FROM cases
            WHERE
                location IS NOT NULL
                AND ST_DWithin(
                    location,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radius
                )
                AND updated_date >= :cutoff
                AND status NOT ILIKE '%closed%'
                {category_filter}

            UNION ALL

            SELECT id, location, category, source, media_url, created_at AS ref_date
            FROM user_reports
            WHERE
                location IS NOT NULL
                AND ST_DWithin(
                    location,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radius
                )
                {category_filter}
        ) combined
        ORDER BY ref_date DESC
        LIMIT :lim
    """)

    params: dict = {
        "lat": lat,
        "lng": lng,
        "radius": radius_meters,
        "cutoff": cutoff,
        "lim": settings.live_map_limit,
    }
    if category:
        params["category"] = category

    rows = db.execute(sql, params).fetchall()

    markers = [
        MapMarker(
            id=str(row.id),
            lat=float(row.lat),
            lng=float(row.lng),
            category=row.category,
            source=row.source,
            media_url=row.media_url,
        )
        for row in rows
    ]

    return LiveMapResponse(markers=markers)


@router.get("/heatmap", response_model=HeatmapResponse)
def get_heatmap(
    date_from: str = Query(..., description="ISO date string, e.g. 2023-01-01"),
    date_to: str = Query(..., description="ISO date string, e.g. 2024-01-01"),
    db: Session = Depends(get_db),
):
    """
    Returns lat/lng points for all 311 cases with opened_date in the given range.
    No cap - Google Maps HeatmapLayer handles large point sets.
    """
    try:
        dt_from = datetime.fromisoformat(date_from).replace(tzinfo=timezone.utc)
        dt_to = datetime.fromisoformat(date_to).replace(tzinfo=timezone.utc)
    except ValueError:
        raise ValidationError("date_from and date_to must be valid ISO date strings (e.g. 2023-01-01).")

    if dt_from >= dt_to:
        raise ValidationError("date_from must be before date_to.")

    sql = text("""
        SELECT
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng
        FROM cases
        WHERE
            location IS NOT NULL
            AND opened_date >= :date_from
            AND opened_date < :date_to
    """)

    rows = db.execute(sql, {"date_from": dt_from, "date_to": dt_to}).fetchall()

    points = [HeatmapPoint(lat=float(row.lat), lng=float(row.lng)) for row in rows]

    return HeatmapResponse(points=points)
