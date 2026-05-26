from fastapi import APIRouter

from assearch.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> HealthResponse:
    return HealthResponse(status="ok")
