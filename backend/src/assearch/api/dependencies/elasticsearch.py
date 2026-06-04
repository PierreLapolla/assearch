from collections.abc import AsyncIterator
from typing import Annotated

from elasticsearch import AsyncElasticsearch
from fastapi import Depends, HTTPException

from assearch.config import get_settings


async def get_elasticsearch_client() -> AsyncIterator[AsyncElasticsearch]:
    try:
        client = AsyncElasticsearch(
            get_settings().elasticsearch_url,
            request_timeout=10,
            retry_on_timeout=True,
            max_retries=2,
        )
    except (ValueError, Exception) as e:
        raise HTTPException(status_code=503, detail=f"Elasticsearch unavailable: {e}") from e
    try:
        yield client
    finally:
        await client.close()


ElasticsearchClientDep = Annotated[
    AsyncElasticsearch, Depends(get_elasticsearch_client)
]
