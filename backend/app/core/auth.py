import logging

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings
from app.exceptions import UnauthorizedError

logger = logging.getLogger("civicsense.auth")

_firebase_app = None


def _get_firebase_app():
    global _firebase_app
    if _firebase_app is None:
        settings = get_settings()
        cred = credentials.Certificate(settings.firebase_credentials_path)
        _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app


_bearer = HTTPBearer(auto_error=False)


async def verify_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """
    FastAPI dependency. Verifies the Firebase ID token from the Authorization header.
    Returns the decoded token payload on success.
    Raises UnauthorizedError on failure.
    """
    _get_firebase_app()

    if credentials is None:
        raise UnauthorizedError("No authorization token provided.")

    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except auth.ExpiredIdTokenError:
        raise UnauthorizedError("Your session has expired. Please sign in again.")
    except auth.RevokedIdTokenError:
        raise UnauthorizedError("Your session has been revoked. Please sign in again.")
    except auth.InvalidIdTokenError:
        raise UnauthorizedError("Invalid authentication token.")
    except Exception as exc:
        logger.exception("Unexpected Firebase auth error: %s", exc)
        raise UnauthorizedError("Authentication failed. Please try again.")


async def get_current_uid(token: dict = Depends(verify_token)) -> str:
    """Returns just the Firebase UID from the verified token."""
    return token["uid"]
