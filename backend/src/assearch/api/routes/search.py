from collections.abc import AsyncIterator
from os import getenv
from typing import Annotated, Any

from elasticsearch import AsyncElasticsearch, TransportError
from fastapi import APIRouter, Depends, HTTPException, Query, status

from assearch.schemas.search import SearchResponse, SearchResult

ELASTICSEARCH_URL = getenv("ELASTICSEARCH_URL", "http://localhost:9200")
INDEX_NAME = "associations"
SEARCH_FIELDS = ("title^3", "description", "address", "city^2", "postal_code", "website")
TOTAL_HITS_CAP = 100  # ES won't count beyond this; signals user to narrow search

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


def parse_total(value: int | dict[str, Any]) -> tuple[int, bool]:
    """Returns (count, capped) where capped=True means count hit TOTAL_HITS_CAP."""
    if isinstance(value, int):
        return value, False
    return int(value.get("value", 0)), value.get("relation") == "gte"


def result_from_hit(hit: dict[str, Any]) -> SearchResult:
    source = hit.get("_source", {})
    return SearchResult(
        id=str(source.get("id") or hit["_id"]),
        score=float(hit.get("_score") or 0),
        source=source.get("source"),
        title=source.get("title"),
        description=source.get("description"),
        address=source.get("address"),
        city=source.get("city"),
        postal_code=source.get("postal_code"),
        website=source.get("website"),
        date_creat=source.get("date_creat"),
        date_disso=source.get("date_disso"),
        position=source.get("position"),
        nature=source.get("nature"),
        groupement=source.get("groupement"),
    )


@router.get("")
async def search(
    query: Annotated[str, Query(min_length=1, max_length=200)],
    client: ElasticsearchClientDep,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    offset: Annotated[int, Query(ge=0, le=10000)] = 0,
    include_legacy: Annotated[bool, Query()] = False,
) -> SearchResponse:
    must_query: dict[str, Any] = {
        "multi_match": {
            "query": query,
            "fields": SEARCH_FIELDS,
            "type": "best_fields",
            "operator": "and",
            "fuzziness": "AUTO",
        }
    }

    if include_legacy:
        es_query = must_query
    else:
        es_query = {
            "bool": {
                "must": must_query,
                "must_not": {"term": {"source": "import"}},
            }
        }

    try:
        response = await client.search(
            index=INDEX_NAME,
            size=limit,
            from_=offset,
            query=es_query,
            track_total_hits=TOTAL_HITS_CAP,
        )
    except TransportError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Search backend unavailable",
        ) from error

    hits = response["hits"]
    total, total_capped = parse_total(hits["total"])
    return SearchResponse(
        query=query,
        total=total,
        total_capped=total_capped,
        results=[result_from_hit(hit) for hit in hits["hits"]],
    )
