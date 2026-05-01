import logging
import logging.config
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.v1 import router as v1_router
from app.config import get_settings
from app.core.redis import redis_ping
from app.exceptions import register_exception_handlers
from app.middleware import register_middleware

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

logging.config.dictConfig(
    {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%dT%H:%M:%S",
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
            }
        },
        "root": {"handlers": ["console"], "level": "INFO"},
        "loggers": {
            "civicsense": {"level": "DEBUG", "propagate": True},
            "uvicorn.access": {"level": "WARNING"},
        },
    }
)

logger = logging.getLogger("civicsense.main")


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()

    # Ensure uploads directory exists
    Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)
    logger.info("Uploads directory ready: %s", settings.uploads_dir)

    # Verify Redis
    if redis_ping():
        logger.info("Redis connection verified.")
    else:
        logger.warning("Redis is not reachable. Summary caching will not work.")

    yield
    logger.info("Shutting down Civic Sense API.")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Civic Sense API",
        description="SF 311 case visualisation and community reporting backend.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    register_middleware(app)
    register_exception_handlers(app)

    # Static file serving for uploaded photos
    uploads_path = Path(settings.uploads_dir)
    uploads_path.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

    # API routes
    app.include_router(v1_router)

    @app.get("/", tags=["root"])
    def root():
        return {
            "name": "Civic Sense API",
            "version": "1.0.0",
            "docs": "/docs",
        }

    @app.get("/health", tags=["health"])
    def health_check():
        return {
            "status": "ok",
            "redis": redis_ping(),
        }

    return app


app = create_app()
