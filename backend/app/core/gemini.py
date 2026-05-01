import json
import logging
import os
from pathlib import Path

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.config import get_settings
from app.exceptions import ExternalServiceError

logger = logging.getLogger("civicsense.gemini")

# ---------------------------------------------------------------------------
# Category mapping from raw Gemini labels
# ---------------------------------------------------------------------------

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Illegal Dumping": ["waste", "garbage", "trash", "dumping", "litter", "rubbish", "debris"],
    "Graffiti": ["graffiti", "vandalism", "spray paint", "tagging"],
    "Pothole": ["pothole", "road damage", "asphalt crack", "pavement", "road surface"],
    "Blocked Sidewalk": ["sidewalk", "obstruction", "blocked path", "pedestrian"],
    "Overflowing Bin": ["bin", "overflowing", "bin full", "garbage can", "dumpster"],
    "Streetlight Issue": ["streetlight", "street light", "lamp post", "broken light", "signal"],
    "Other": [],
}


def _map_labels_to_category(labels: list[str]) -> str:
    labels_lower = [l.lower() for l in labels]
    for category, keywords in CATEGORY_KEYWORDS.items():
        if category == "Other":
            continue
        if any(kw in label for kw in keywords for label in labels_lower):
            return category
    return "Other"


# ---------------------------------------------------------------------------
# Pydantic schemas for structured Gemini responses
# ---------------------------------------------------------------------------

class PhotoAnalysisResult(BaseModel):
    category: str
    severity: str          # low | medium | high
    ai_label: str          # primary detected label
    ai_confidence: float   # 0.0 to 1.0
    explanation: str       # one sentence


class NeighborhoodSummaryResult(BaseModel):
    summary: str


# ---------------------------------------------------------------------------
# Client factory
# ---------------------------------------------------------------------------

def _get_client() -> genai.Client:
    settings = get_settings()
    
    return genai.Client(vertexai=settings.google_genai_use_vertexai, api_key=settings.google_api_key)

# ---------------------------------------------------------------------------
# Photo analysis
# ---------------------------------------------------------------------------

PHOTO_ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "category": {
            "type": "STRING",
            "enum": list(CATEGORY_KEYWORDS.keys()),
            "description": "Street issue category.",
        },
        "severity": {
            "type": "STRING",
            "enum": ["low", "medium", "high"],
            "description": "Visual severity of the issue.",
        },
        "ai_label": {
            "type": "STRING",
            "description": "Primary detected object or condition in plain English.",
        },
        "ai_confidence": {
            "type": "NUMBER",
            "description": "Confidence score between 0.0 and 1.0.",
        },
        "explanation": {
            "type": "STRING",
            "description": "One sentence describing the issue and its severity.",
        },
    },
    "required": ["category", "severity", "ai_label", "ai_confidence", "explanation"],
}

PHOTO_PROMPT = (
    "You are analyzing a photo submitted by a San Francisco resident reporting a street issue.\n"
    "Identify the primary street problem visible in the image.\n"
    "Classify it into one of the provided categories.\n"
    "Rate the severity based on visual condition: low (minor, not urgent), "
    "medium (noticeable, should be addressed), high (severe, safety risk or urgent).\n"
    "Provide a confidence score between 0.0 and 1.0 for your classification.\n"
    "Write one plain-English sentence describing what you see and why the severity is what it is."
)


def analyze_photo(photo_path: str) -> PhotoAnalysisResult:
    """
    Sends a locally saved photo to Gemini for classification and severity rating.
    Returns a structured PhotoAnalysisResult.
    Raises ExternalServiceError on failure.
    """
    settings = get_settings()
    client = _get_client()

    try:
        image_bytes = Path(photo_path).read_bytes()
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[PHOTO_PROMPT, image_part],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PHOTO_ANALYSIS_SCHEMA,
                temperature=0.1,
            ),
        )

        raw = json.loads(response.text)
        return PhotoAnalysisResult(**raw)

    except json.JSONDecodeError as exc:
        logger.error("Gemini returned invalid JSON for photo analysis: %s", exc)
        raise ExternalServiceError("Gemini", "Invalid response format.")
    except Exception as exc:
        logger.exception("Gemini photo analysis failed: %s", exc)
        raise ExternalServiceError("Gemini", str(exc))


# ---------------------------------------------------------------------------
# Neighborhood summary
# ---------------------------------------------------------------------------

SUMMARY_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {
            "type": "STRING",
            "description": "3 to 4 sentence plain-English neighborhood summary.",
        }
    },
    "required": ["summary"],
}


def generate_neighborhood_summary(
    neighborhood: str,
    total_cases: int,
    category_breakdown: dict[str, int],
    top_streets: list[dict],
    oldest_case_days: int,
) -> str:
    """
    Generates a plain-English neighborhood summary using Gemini.
    Returns the summary string.
    Raises ExternalServiceError on failure.
    """
    settings = get_settings()
    client = _get_client()

    breakdown_str = ", ".join(
        f"{pct:.0f}% {cat}"
        for cat, pct in sorted(
            {
                cat: (count / total_cases * 100)
                for cat, count in category_breakdown.items()
            }.items(),
            key=lambda x: x[1],
            reverse=True,
        )
    )

    streets_str = ", ".join(
        f"{s['address']} ({s['count']} cases)" for s in top_streets[:3]
    )

    prompt = (
        f"Here is current 311 case data for the {neighborhood} neighborhood in San Francisco:\n"
        f"- {total_cases} open cases\n"
        f"- Breakdown: {breakdown_str}\n"
        f"- Top affected streets: {streets_str}\n"
        f"- Oldest open case: {oldest_case_days} days old\n\n"
        "Write a 3 to 4 sentence plain-English summary of the quality-of-life situation "
        "in this neighborhood for residents and local merchants. "
        "Be factual, specific, and avoid bureaucratic language."
    )

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SUMMARY_SCHEMA,
                temperature=0.4,
            ),
        )
        raw = json.loads(response.text)
        return raw["summary"]

    except json.JSONDecodeError as exc:
        logger.error("Gemini returned invalid JSON for summary: %s", exc)
        raise ExternalServiceError("Gemini", "Invalid response format.")
    except Exception as exc:
        logger.exception("Gemini summary generation failed: %s", exc)
        raise ExternalServiceError("Gemini", str(exc))