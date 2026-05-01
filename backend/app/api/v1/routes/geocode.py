import logging

import httpx
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.config import get_settings
from app.exceptions import ExternalServiceError, ValidationError

logger = logging.getLogger("civicsense.geocode")
router = APIRouter(prefix="/geocode", tags=["geocode"])

GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"


class GeocodeResponse(BaseModel):
    formatted_address: str
    lat: float
    lng: float


@router.get("", response_model=GeocodeResponse)
async def geocode_address(
    address: str | None = Query(None, min_length=1),
    lat: float | None = Query(None, ge=-90, le=90),
    lng: float | None = Query(None, ge=-180, le=180),
):
    """
    Proxies Google Maps Geocoding API.
    - Forward geocode: pass `address` param.
    - Reverse geocode: pass `lat` and `lng` params.
    API key stays server-side and is never exposed to the frontend.
    """
    settings = get_settings()

    if address:
        params = {"address": address, "key": settings.google_maps_api_key}
    elif lat is not None and lng is not None:
        params = {"latlng": f"{lat},{lng}", "key": settings.google_maps_api_key}
    else:
        raise ValidationError("Provide either 'address' or both 'lat' and 'lng'.")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(GOOGLE_GEOCODE_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError as exc:
        logger.error("Google Geocoding API request failed: %s", exc)
        raise ExternalServiceError("Google Maps", "Could not reach the geocoding service.")

    if data.get("status") not in ("OK", "ZERO_RESULTS"):
        raise ExternalServiceError("Google Maps", f"Geocoding failed: {data.get('status')}.")

    results = data.get("results", [])
    if not results:
        raise ValidationError("No results found for the provided address or coordinates.")

    best = results[0]
    loc = best["geometry"]["location"]

    return GeocodeResponse(
        formatted_address=best["formatted_address"],
        lat=loc["lat"],
        lng=loc["lng"],
    )
