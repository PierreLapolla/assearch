from pydantic import BaseModel, Field


class SearchResult(BaseModel):
    id: str
    score: float
    source: str | None = None
    title: str | None = None
    description: str | None = None
    city: str | None = None
    postal_code: str | None = None
    website: str | None = None


class SearchResponse(BaseModel):
    query: str
    total: int = Field(ge=0)
    results: list[SearchResult]
