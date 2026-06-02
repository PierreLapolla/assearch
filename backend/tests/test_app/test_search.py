import anyio

from assearch.api.routes.search import search
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
