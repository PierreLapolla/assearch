![Ruff](https://img.shields.io/badge/ruff-enabled-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

# Assearch — Backend

FastAPI search API backed by Elasticsearch. Includes an offline ETL pipeline that downloads RNA datasets from data.gouv.fr and indexes them.

> **Running locally for the first time?** See the [root README](../README.md) for step-by-step setup.

All commands below run from the `backend/` directory.

---

## Setup

Requires [uv](https://docs.astral.sh/uv/getting-started/installation/).

```bash
uv sync
```

---

## Dev server

```bash
uv run fastapi dev
```

The API listens on [http://localhost:8000](http://localhost:8000). Requires Elasticsearch running (see Docker section below).

---

## Data pipeline

Downloads two RNA parquet datasets from data.gouv.fr and indexes them into Elasticsearch.

```bash
# Full run (download + index)
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli all

# Steps individually
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli download
PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli index
```

**Data sources:**
- `waldec` — current RNA data (updated regularly)
- `import` — legacy data for associations not updated since 2009; hidden in search by default

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `ELASTICSEARCH_URL` | `http://localhost:9200` | API + pipeline |

---

## Tests, linting, formatting

```bash
uv run pytest
uvx ruff check . --fix
uvx ruff format .
```

---

## Docker

Run full stack (from repo root):

```bash
docker compose up --build
```

Build and run standalone (from `backend/`):

```bash
docker build -t assearch .
docker run --rm -p 8000:8000 assearch
```

---

## License

MIT — see [LICENSE](LICENSE)
