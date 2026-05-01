import logging
import threading
from typing import Union

import redis as redis_lib
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.gemini import generate_neighborhood_summary
from app.core.redis import get_redis
from app.dependencies import get_db
from app.exceptions import ValidationError
from app.schemas.summary import SummaryGeneratingResponse, SummaryResponse

logger = logging.getLogger("civicsense.summary")
router = APIRouter(prefix="/summary", tags=["summary"])

_GENERATING_SENTINEL = "generating"


def _redis_key(neighborhood: str) -> str:
    return f"summary:{neighborhood.lower().strip()}"


def _fetch_stats(db: Session, neighborhood: str) -> dict | None:
    sql = text("""
        SELECT
            COUNT(*) AS total,
            category,
            MAX(
                EXTRACT(DAY FROM (NOW() - opened_date))
            )::int AS max_days
        FROM cases
        WHERE
            neighborhood ILIKE :neighborhood
            AND status NOT ILIKE '%closed%'
        GROUP BY category
        ORDER BY COUNT(*) DESC
    """)

    rows = db.execute(sql, {"neighborhood": f"%{neighborhood}%"}).fetchall()
    if not rows:
        return None

    total = sum(r.total for r in rows)
    category_breakdown = {r.category: r.total for r in rows if r.category}
    oldest_days = max((r.max_days or 0) for r in rows)

    # Top 3 streets
    street_sql = text("""
        SELECT address, COUNT(*) AS cnt
        FROM cases
        WHERE
            neighborhood ILIKE :neighborhood
            AND status NOT ILIKE '%closed%'
            AND address IS NOT NULL
        GROUP BY address
        ORDER BY cnt DESC
        LIMIT 3
    """)
    street_rows = db.execute(street_sql, {"neighborhood": f"%{neighborhood}%"}).fetchall()
    top_streets = [{"address": r.address, "count": r.cnt} for r in street_rows]

    return {
        "total": total,
        "category_breakdown": category_breakdown,
        "top_streets": top_streets,
        "oldest_days": oldest_days,
    }


def _generate_and_cache(neighborhood: str, stats: dict) -> None:
    """Runs in a background thread. Calls Gemini, writes result to Redis."""
    settings = get_settings()
    redis = redis_lib.from_url(settings.redis_url, decode_responses=True)
    key = _redis_key(neighborhood)
    try:
        summary = generate_neighborhood_summary(
            neighborhood=neighborhood,
            total_cases=stats["total"],
            category_breakdown=stats["category_breakdown"],
            top_streets=stats["top_streets"],
            oldest_case_days=stats["oldest_days"],
        )
        redis.set(key, summary, ex=settings.summary_cache_ttl_seconds)
        logger.info("Summary cached for neighborhood: %s", neighborhood)
    except Exception as exc:
        logger.exception("Failed to generate summary for %s: %s", neighborhood, exc)
        # Delete the generating sentinel so the next request retries
        redis.delete(key)


@router.get("", response_model=None)
def get_summary(
    neighborhood: str = Query(..., min_length=1, max_length=128),
    db: Session = Depends(get_db),
    redis: redis_lib.Redis = Depends(get_redis),
):
    """
    Returns a Gemini-generated neighborhood summary.
    - 200 with summary if cached.
    - 202 with status=generating if currently being generated.
    - Triggers background generation on first request.
    """
    settings = get_settings()
    key = _redis_key(neighborhood)

    cached = redis.get(key)

    if cached and cached != _GENERATING_SENTINEL:
        # Fetch total for response metadata
        count_sql = text("""
            SELECT COUNT(*) AS total FROM cases
            WHERE neighborhood ILIKE :n AND status NOT ILIKE '%closed%'
        """)
        total = db.execute(count_sql, {"n": f"%{neighborhood}%"}).scalar() or 0
        return SummaryResponse(
            neighborhood=neighborhood,
            summary=cached,
            total_cases=total,
            cached=True,
        )

    if cached == _GENERATING_SENTINEL:
        return JSONResponse(
            status_code=202,
            content=SummaryGeneratingResponse(neighborhood=neighborhood).model_dump(),
        )

    # Nothing cached - fetch stats and kick off generation
    stats = _fetch_stats(db, neighborhood)
    if not stats:
        raise ValidationError(f"No open cases found for neighborhood: {neighborhood}")

    redis.set(key, _GENERATING_SENTINEL, ex=settings.summary_generating_ttl_seconds)

    thread = threading.Thread(
        target=_generate_and_cache,
        args=(neighborhood, stats),
        daemon=True,
    )
    thread.start()

    return JSONResponse(
        status_code=202,
        content=SummaryGeneratingResponse(neighborhood=neighborhood).model_dump(),
    )
