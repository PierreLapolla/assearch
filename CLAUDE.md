# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

```
assearch/
├── backend/       # FastAPI app + data pipeline (Python/uv)
├── frontend/      # Next.js search UI (Bun)
└── docker-compose.yml  # orchestrates api + elasticsearch
```

## Backend commands (run from `backend/`)

```bash
# Install
uv sync
uv run opentelemetry-bootstrap -a install

# Dev server
uv run fastapi dev

# Dev server with OTel
uv run --env-file .env opentelemetry-instrument fastapi dev

# Tests
uv run pytest

# Single test file
uv run pytest tests/test_app/test_search.py

# Lint / format
uvx ruff check . --fix
uvx ruff format .

# Data pipeline
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli all
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli download
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli index
```

## Frontend commands (run from `frontend/`)

```bash
bun install
bun dev
```

## Docker (run from repo root)

```bash
docker compose up --build
```

Build backend image standalone (from `backend/`):

```bash
docker build -t assearch .
```

## Backend architecture

FastAPI app (`backend/src/assearch/`) backed by Elasticsearch. Two source trees under `backend/src/`:

- `assearch/` — HTTP API (runtime deps only)
- `data_pipeline/` — offline ETL in separate `data-pipeline` dep group, never imported by the API

**Request flow:** `main.py` → `api/router.py` → `api/routes/search.py` or `api/routes/health.py`

`GET /search?query=...&limit=...` runs a `multi_match` query against the `associations` ES index. Fields: `title^3`, `description`, `city^2`, `postal_code`, `website`. Fuzziness `AUTO`, operator `and`.

**Data pipeline flow:** `cli.py` → `pipeline.py` → `download_pipeline.py` + `index.py`

Downloads two parquet datasets from data.gouv.fr (`import`, `waldec`) into `backend/data/`. Indexes with a French-language analyzer (lowercase + asciifolding + elision + stop words). Batch size: 500 docs.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `ELASTICSEARCH_URL` | `http://localhost:9200` | API + pipeline |
| `OTEL_*` | — | OpenTelemetry (see `backend/.env.example`) |

Backend `.env` lives at `backend/.env`. Docker Compose reads it from there.

## Vercel deployment

Frontend deploys to Vercel. Set **Root Directory** = `frontend/` in Vercel project settings.
