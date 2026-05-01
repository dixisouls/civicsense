from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # --- Postgres ---
    database_url: str

    # --- Redis ---
    redis_url: str = "redis://localhost:6379/0"
    summary_cache_ttl_seconds: int = 21600  # 6 hours
    summary_generating_ttl_seconds: int = 600  # 10 min safety expiry

    # --- Google Cloud / Vertex AI ---
    google_cloud_project: str
    google_cloud_location: str = "us-central1"
    google_genai_use_vertexai: str = "true"
    gemini_model: str = "gemini-3.1-flash-lite-preview"
    google_api_key: str = ""

    # --- Firebase ---
    firebase_credentials_path: str

    # --- Google Maps (server-side geocode proxy only) ---
    google_maps_api_key: str

    # --- App ---
    uploads_dir: str = "./uploads"
    base_url: str = "http://localhost:8000"
    cors_origins: list[str] = ["http://localhost:3000"]

    # --- Feed / Map limits ---
    live_map_days: int = 7
    live_map_limit: int = 500
    feed_default_radius_meters: int = 800
    dedup_radius_meters: int = 50


@lru_cache
def get_settings() -> Settings:
    return Settings()
