from pydantic import BaseModel, Field


class SearchResult(BaseModel):
    id: str
    score: float
    source: str | None = None
    title: str | None = None
    description: str | None = None
    address: str | None = None
    city: str | None = None
    postal_code: str | None = None
    website: str | None = None
    website_ok: bool | None = None
    date_creat: str | None = None
    date_disso: str | None = None
    position: str | None = None
    nature: str | None = None
    groupement: str | None = None


class SearchResponse(BaseModel):
    query: str
    total: int = Field(ge=0)
    total_capped: bool = False  # true when total hit the tracking limit
    results: list[SearchResult]
