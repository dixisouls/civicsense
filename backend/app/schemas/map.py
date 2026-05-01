from typing import Literal

from pydantic import BaseModel


class MapMarker(BaseModel):
    id: str
    lat: float
    lng: float
    category: str | None
    source: Literal["311", "user"]
    media_url: str | None = None


class HeatmapPoint(BaseModel):
    lat: float
    lng: float


class LiveMapResponse(BaseModel):
    markers: list[MapMarker]


class HeatmapResponse(BaseModel):
    points: list[HeatmapPoint]
