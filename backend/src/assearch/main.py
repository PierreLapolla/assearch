from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from assearch.api.router import api_router
from assearch.config import get_settings


def create_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_settings().allowed_origins,
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app


app = create_app()
