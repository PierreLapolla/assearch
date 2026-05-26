from collections.abc import Iterator
from pathlib import Path
from typing import Any

from elasticsearch import Elasticsearch
from elasticsearch.helpers import streaming_bulk
from pedros import progbar

from data_pipeline.sources import (
    BATCH_SIZE,
    DATA_PATH,
    ELASTICSEARCH_URL,
    INDEX_NAME,
    parquet_sources,
)
from data_pipeline.transform import iter_documents, row_count

INDEX_SETTINGS = {
    "number_of_replicas": 0,
    "refresh_interval": "-1",
    "analysis": {
        "analyzer": {
            "french_text": {
                "tokenizer": "standard",
                "filter": [
                    "lowercase",
                    "asciifolding",
                    "french_elision",
                    "french_stop",
                ],
            }
        },
        "filter": {
            "french_elision": {
                "type": "elision",
                "articles_case": True,
                "articles": ["l", "m", "t", "qu", "n", "s", "j", "d"],
            },
            "french_stop": {"type": "stop", "stopwords": "_french_"},
        },
    },
}

INDEX_MAPPINGS = {
    "properties": {
        "source": {"type": "keyword"},
        "id": {"type": "keyword"},
        "title": {"type": "text", "analyzer": "french_text"},
        "description": {"type": "text", "analyzer": "french_text"},
        "city": {"type": "keyword"},
        "postal_code": {"type": "keyword"},
        "website": {"type": "keyword", "ignore_above": 512},
    }
}


def elasticsearch_client(
    elasticsearch_url: str = ELASTICSEARCH_URL,
) -> Elasticsearch:
    return Elasticsearch(
        elasticsearch_url,
        request_timeout=180,
        retry_on_timeout=True,
        max_retries=3,
    )


def wait_for_elasticsearch(client: Elasticsearch) -> None:
    health = client.cluster.health(timeout="10s")
    if health["status"] == "red":
        allocation = client.cat.allocation(format="json", bytes="gb")
        raise RuntimeError(
            "Elasticsearch cluster is red; indexing cannot start. "
            f"Allocation: {allocation}"
        )


def create_index(client: Elasticsearch, *, index_name: str = INDEX_NAME) -> None:
    if client.indices.exists(index=index_name):
        return

    client.indices.create(
        index=index_name,
        settings=INDEX_SETTINGS,
        mappings=INDEX_MAPPINGS,
    )


def bulk_actions(
    source: str,
    path: Path,
    *,
    index_name: str = INDEX_NAME,
) -> Iterator[dict[str, Any]]:
    documents = progbar(
        iter_documents(source, path),
        desc=f"Preparing {source}",
        total=row_count(path),
    )
    for document in documents:
        yield {
            "_op_type": "index",
            "_index": index_name,
            "_id": document["_id"],
            "_source": {key: value for key, value in document.items() if key != "_id"},
        }


def index_source(
    client: Elasticsearch,
    source: str,
    path: Path,
    *,
    index_name: str = INDEX_NAME,
) -> None:
    for ok, item in streaming_bulk(
        client,
        bulk_actions(source, path, index_name=index_name),
        chunk_size=BATCH_SIZE,
        max_chunk_bytes=10 * 1024 * 1024,
        request_timeout=180,
        max_retries=3,
        initial_backoff=2,
        max_backoff=30,
        yield_ok=False,
    ):
        if not ok:
            raise RuntimeError(f"Elasticsearch bulk index failed: {item}")


def index_data(
    *,
    data_path: Path = DATA_PATH,
    elasticsearch_url: str = ELASTICSEARCH_URL,
    index_name: str = INDEX_NAME,
) -> None:
    client = elasticsearch_client(elasticsearch_url)
    wait_for_elasticsearch(client)
    create_index(client, index_name=index_name)
    client.indices.put_settings(index=index_name, settings={"refresh_interval": "-1"})
    client.cluster.health(index=index_name, wait_for_status="yellow", timeout="60s")

    sources = parquet_sources(data_path=data_path)
    for source, path in sources:
        index_source(client, source, path, index_name=index_name)

    client.indices.refresh(index=index_name)
    client.indices.put_settings(index=index_name, settings={"refresh_interval": "1s"})
