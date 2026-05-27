from fastapi import FastAPI

from assearch.api.router import api_router


def create_app() -> FastAPI:
    app = FastAPI()
    app.include_router(api_router)
    return app


app = create_app()
