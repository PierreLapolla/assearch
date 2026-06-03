from unittest.mock import AsyncMock, patch

import anyio
import pytest
from elasticsearch import AsyncElasticsearch, TransportError
from fastapi import HTTPException

from assearch.api.dependencies.elasticsearch import get_elasticsearch_client
from assearch.api.services.search import parse_total, search
from assearch.main import app


class FakeElasticsearch:
    async def search(self, **kwargs):
        assert kwargs["index"] == "associations"
        assert kwargs["size"] == 2
        q = kwargs["query"]
        # when include_legacy=False the query is wrapped in bool/must_not
        multi_match = q.get("multi_match") or q["bool"]["must"]["multi_match"]
        assert multi_match["query"] == "football"

        return {
            "hits": {
                "total": {"value": 1, "relation": "eq"},
                "hits": [
                    {
                        "_id": "waldec:1",
                        "_score": 12.5,
                        "_source": {
                            "source": "waldec",
                            "id": "1",
                            "title": "Club de football",
                            "description": "Association sportive",
                            "city": "Lyon",
                            "postal_code": "69000",
                            "website": "https://example.org",
                        },
                    }
                ],
            }
        }


def test_search() -> None:
    response = anyio.run(search, "football", FakeElasticsearch(), 2)

    assert response.model_dump() == {
        "query": "football",
        "total": 1,
        "total_capped": False,
        "results": [
            {
                "id": "1",
                "score": 12.5,
                "source": "waldec",
                "title": "Club de football",
                "description": "Association sportive",
                "address": None,
                "city": "Lyon",
                "postal_code": "69000",
                "website": "https://example.org",
                "date_creat": None,
                "date_disso": None,
                "position": None,
                "nature": None,
                "groupement": None,
            }
        ],
    }


def test_search_route_is_registered() -> None:
    routes = {route.path for route in app.routes}

    assert "/search" in routes


# --- parse_total ---

def test_parse_total_int() -> None:
    assert parse_total(42) == (42, False)


def test_parse_total_dict_not_capped() -> None:
    assert parse_total({"value": 10, "relation": "eq"}) == (10, False)


def test_parse_total_dict_capped() -> None:
    assert parse_total({"value": 100, "relation": "gte"}) == (100, True)


# --- include_legacy branch ---

class FakeElasticsearchAny:
    """Returns one hit regardless of query shape."""

    async def search(self, **kwargs):
        return {
            "hits": {
                "total": {"value": 1, "relation": "eq"},
                "hits": [
                    {
                        "_id": "waldec:1",
                        "_score": 1.0,
                        "_source": {"id": "1", "title": "Club"},
                    }
                ],
            }
        }


def test_search_include_legacy() -> None:
    async def _run():
        return await search("football", FakeElasticsearchAny(), 10, 0, True)

    response = anyio.run(_run)
    assert response.query == "football"
    assert response.total == 1


# --- TransportError → 503 ---

class ErrorElasticsearch:
    async def search(self, **kwargs):
        raise TransportError(503, "connection error")


def test_search_transport_error_raises_503() -> None:
    async def _run():
        return await search("football", ErrorElasticsearch(), 10)

    with pytest.raises(HTTPException) as exc_info:
        anyio.run(_run)
    assert exc_info.value.status_code == 503


# --- get_elasticsearch_client lifecycle ---

def test_get_elasticsearch_client_yields_and_closes() -> None:
    async def _run():
        mock_close = AsyncMock()
        with patch(
            "assearch.api.dependencies.elasticsearch.AsyncElasticsearch"
        ) as mock_es_class:
            mock_instance = mock_es_class.return_value
            mock_instance.close = mock_close
            async for client in get_elasticsearch_client():
                assert client is mock_instance
        mock_close.assert_called_once()

    anyio.run(_run)
