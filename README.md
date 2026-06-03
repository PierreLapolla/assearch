# Assearch

Search engine for French associations from the national RNA registry (Répertoire National des Associations).

---

## Run locally

Two steps: start the stack, then load the data.

### Prerequisites

| Tool | What it does | Install |
|------|-------------|---------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Runs the full stack | [docs.docker.com](https://docs.docker.com/get-started/get-docker/) |
| [uv](https://docs.astral.sh/uv/) | Runs the data pipeline | [docs.astral.sh/uv/getting-started/installation](https://docs.astral.sh/uv/getting-started/installation/) |

> **Check your installs:** run `docker --version` and `uv --version`. Each should print a version number.

---

### Step 1 — Start the stack

From the project root:

```bash
docker compose up --build
```

This starts three services:
- **Elasticsearch** — stores and searches associations
- **API** — backend on [http://localhost:8000](http://localhost:8000)
- **Frontend** — search UI on [http://localhost:3000](http://localhost:3000)

Wait until the frontend is ready (1–3 minutes on first run — Elasticsearch takes the longest).

> **Verify:** open [http://localhost:8000/health](http://localhost:8000/health). You should see `{"status":"ok"}`.

---

### Step 2 — Load the data

Open a **new terminal**, go into `backend/`, and run:

```bash
cd backend
uv run --group data-pipeline python -m data_pipeline.cli all
```

This downloads the RNA datasets from [data.gouv.fr](https://www.data.gouv.fr) and indexes them into Elasticsearch. Downloads ~300 MB — expect **5–15 minutes**.

> **Verify:** progress bars appear while downloading and indexing. No error at the end.

---

### You're ready

Open [http://localhost:3000](http://localhost:3000), type a search term (a name, a city, a topic), and press **Rechercher**.

---

## Stopping

Press `Ctrl+C` in the Docker terminal, or run:

```bash
docker compose down
```

Indexed data is saved in a Docker volume. Next time you start, skip Step 2 — the data is already there.

---

## Troubleshooting

**"Cannot connect to the Docker daemon"** — Docker Desktop is not running. Open it from your applications menu and wait for it to start.

**API health check fails after 3 minutes** — Elasticsearch may need more memory. In Docker Desktop, go to Settings → Resources and increase memory to at least 2 GB.

**No results when searching** — the data pipeline (Step 2) may not have finished. Check that terminal for errors and re-run if needed.

**Port already in use** — something else is using port 3000, 8000, or 9200. Stop that process, or see the sub-READMEs for how to change ports.

---

## Project structure

```
assearch/
├── backend/    # API + data pipeline — see backend/README.md
├── frontend/   # Search UI — see frontend/README.md
└── docker-compose.yml
```

Developer documentation is in [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).
