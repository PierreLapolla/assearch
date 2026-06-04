import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from assearch.api.router import api_router

_DEFAULT_ORIGINS = "http://localhost:3000,http://localhost:3001"

limiter = Limiter(key_func=get_remote_address)


def _parse_origins(raw: str) -> list[str]:
    raw = raw.strip().lstrip("[").rstrip("]")
    return [o.strip().strip('"').strip("'") for o in raw.split(",") if o.strip()]


def create_app() -> FastAPI:
    app = FastAPI()
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    raw_origins = os.environ.get("ALLOWED_ORIGINS", _DEFAULT_ORIGINS)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_parse_origins(raw_origins),
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app


app = create_app()
