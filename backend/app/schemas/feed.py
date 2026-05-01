from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class FeedItem(BaseModel):
    id: str
    category: str | None
    address: str | None
    days_open: int
    source: Literal["311", "user"]
    severity: str | None = None
    status: str | None = None
    media_url: str | None = None
    neighborhood: str | None = None
    opened_date: datetime | None = None


class FeedResponse(BaseModel):
    items: list[FeedItem]
    total: int
