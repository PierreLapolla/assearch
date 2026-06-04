from typing import Annotated

from fastapi import APIRouter, Query, Request

from assearch.api.dependencies.elasticsearch import ElasticsearchClientDep
from assearch.api.services import search as search_service
from assearch.main import limiter
from assearch.schemas.search import SearchResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
@limiter.limit("30/minute")
async def search(
    request: Request,
    query: Annotated[str, Query(min_length=1, max_length=200)],
    client: ElasticsearchClientDep,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    offset: Annotated[int, Query(ge=0, le=10000)] = 0,
    include_legacy: Annotated[bool, Query()] = False,
) -> SearchResponse:
    return await search_service.search(query, client, limit, offset, include_legacy)
