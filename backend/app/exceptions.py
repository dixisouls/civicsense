from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found.", status_code=404)


class UnauthorizedError(AppError):
    def __init__(self, detail: str = "Authentication required."):
        super().__init__(detail, status_code=401)


class ForbiddenError(AppError):
    def __init__(self, detail: str = "You do not have permission to do that."):
        super().__init__(detail, status_code=403)


class ValidationError(AppError):
    def __init__(self, detail: str):
        super().__init__(detail, status_code=422)


class ExternalServiceError(AppError):
    def __init__(self, service: str, detail: str = ""):
        msg = f"An error occurred while contacting {service}."
        if detail:
            msg += f" {detail}"
        super().__init__(msg, status_code=502)


class RateLimitError(AppError):
    def __init__(self):
        super().__init__(
            "Too many requests. Please try again shortly.", status_code=429
        )


def _error_body(status_code: int, message: str) -> dict:
    return {
        "error": {
            "code": status_code,
            "message": message,
        }
    }


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.status_code, exc.message),
        )

    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content=_error_body(404, "The requested resource was not found."),
        )

    @app.exception_handler(405)
    async def method_not_allowed_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        return JSONResponse(
            status_code=405,
            content=_error_body(405, "Method not allowed."),
        )

    @app.exception_handler(500)
    async def internal_error_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content=_error_body(
                500,
                "An unexpected error occurred. Please try again later.",
            ),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        import logging

        logging.getLogger("civicsense").exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content=_error_body(
                500,
                "An unexpected error occurred. Please try again later.",
            ),
        )
