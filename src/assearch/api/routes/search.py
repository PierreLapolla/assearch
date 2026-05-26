from collections.abc import AsyncIterator
from typing import Annotated, Any

from elasticsearch import AsyncElasticsearch, TransportError
from fastapi import APIRouter, Depends, HTTPException, Query, status

from assearch.schemas.search import SearchResponse, SearchResult

ELASTICSEARCH_URL = "http://localhost:9200"
INDEX_NAME = "associations"
SEARCH_FIELDS = ("title^3", "description", "city^2", "postal_code", "website")

router = APIRouter(prefix="/search", tags=["search"])


async def get_elasticsearch_client() -> AsyncIterator[AsyncElasticsearch]:
    client = AsyncElasticsearch(
        ELASTICSEARCH_URL,
        request_timeout=10,
        retry_on_timeout=True,
        max_retries=2,
    )
    try:
        yield client
    finally:
        await client.close()


ElasticsearchClientDep = Annotated[
    AsyncElasticsearch, Depends(get_elasticsearch_client)
]


def total_hits(value: int | dict[str, Any]) -> int:
    if isinstance(value, int):
        return value
    return int(value.get("value", 0))


def result_from_hit(hit: dict[str, Any]) -> SearchResult:
    source = hit.get("_source", {})
    return SearchResult(
        id=str(source.get("id") or hit["_id"]),
        score=float(hit.get("_score") or 0),
        source=source.get("source"),
        title=source.get("title"),
        description=source.get("description"),
        city=source.get("city"),
        postal_code=source.get("postal_code"),
        website=source.get("website"),
    )


@router.get("")
async def search(
    query: Annotated[str, Query(min_length=1, max_length=200)],
    client: ElasticsearchClientDep,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> SearchResponse:
    try:
        response = await client.search(
            index=INDEX_NAME,
            size=limit,
            query={
                "multi_match": {
                    "query": query,
                    "fields": SEARCH_FIELDS,
                    "type": "best_fields",
                    "operator": "and",
                    "fuzziness": "AUTO",
                }
            },
        )
    except TransportError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Search backend unavailable",
        ) from error

    hits = response["hits"]
    return SearchResponse(
        query=query,
        total=total_hits(hits["total"]),
        results=[result_from_hit(hit) for hit in hits["hits"]],
    )
