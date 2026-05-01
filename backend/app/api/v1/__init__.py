from fastapi import APIRouter

from app.api.v1.routes import feed, geocode, map, my_reports, report, summary

router = APIRouter(prefix="/api/v1")

router.include_router(feed.router)
router.include_router(map.router)
router.include_router(summary.router)
router.include_router(report.router)
router.include_router(my_reports.router)
router.include_router(geocode.router)
