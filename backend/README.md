![Ruff](https://img.shields.io/badge/ruff-enabled-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

# Assearch — Backend

Fast search API for French associations. FastAPI + Elasticsearch.

All commands below run from the `backend/` directory.

## Setup

Requires [uv](https://docs.astral.sh/uv/getting-started/installation/).

```bash
uv sync
uv run opentelemetry-bootstrap -a install
```

Copy `.env.example` to `.env` and fill in your Grafana OTLP token.

## Running

```bash
# Dev
uv run fastapi dev

# Dev with telemetry
uv run --env-file .env opentelemetry-instrument fastapi dev

# Production
uv run fastapi run
```

## Data pipeline

Downloads association datasets from data.gouv.fr and indexes them into Elasticsearch.

```bash
# Full run (download + index)
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli all

# Steps individually
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli download
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli index
```

## Tests, linting, formatting

```bash
uv run pytest
uvx ruff check . --fix
uvx ruff format .
```

## Docker

Build and run standalone (from `backend/`):

```bash
docker build -t assearch .
docker run --rm --env-file .env -p 8000:8000 assearch
```

Run full stack (from repo root):

```bash
docker compose up --build
```

## License

MIT — see [LICENSE](LICENSE)
