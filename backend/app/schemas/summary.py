from pydantic import BaseModel


class SummaryResponse(BaseModel):
    neighborhood: str
    summary: str
    total_cases: int
    cached: bool


class SummaryGeneratingResponse(BaseModel):
    neighborhood: str
    status: str = "generating"
    message: str = "The neighborhood summary is being generated. Please try again in a few seconds."
