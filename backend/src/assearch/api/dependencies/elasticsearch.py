from collections.abc import AsyncIterator
from typing import Annotated

from elasticsearch import AsyncElasticsearch
from fastapi import Depends

from assearch.config import get_settings


async def get_elasticsearch_client() -> AsyncIterator[AsyncElasticsearch]:
    client = AsyncElasticsearch(
        get_settings().elasticsearch_url,
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
