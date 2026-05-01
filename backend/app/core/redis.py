import logging

import redis as redis_lib

from app.config import get_settings

logger = logging.getLogger("civicsense.redis")

_redis_client: redis_lib.Redis | None = None


def get_redis() -> redis_lib.Redis:
    global _redis_client
    if _redis_client is None:
        settings = get_settings()
        _redis_client = redis_lib.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5,
            retry_on_timeout=True,
        )
        logger.info("Redis client initialised at %s", settings.redis_url)
    return _redis_client


def redis_ping() -> bool:
    try:
        return get_redis().ping()
    except Exception:
        return False
