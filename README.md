# Assearch

Search engine for French associations from the national RNA registry (Répertoire National des Associations).

---

## Run locally

You will run three things: a database + API (via Docker), the data loader, and the website.

### Prerequisites

Install these tools before starting. Each link points to official installation instructions.

| Tool | What it does | Install |
|------|-------------|---------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Runs the database and API | [docs.docker.com](https://docs.docker.com/get-started/get-docker/) |
| [uv](https://docs.astral.sh/uv/) | Runs the data pipeline (Python) | [docs.astral.sh/uv/getting-started/installation](https://docs.astral.sh/uv/getting-started/installation/) |
| [Bun](https://bun.sh) | Runs the website (frontend) | [bun.sh/docs/installation](https://bun.sh/docs/installation) |

> **Check your installs:** open a terminal and run `docker --version`, `uv --version`, `bun --version`. Each should print a version number, not an error.

---

### Step 1 — Start the database and API

Open a terminal in the project root folder and run:

```bash
docker compose up --build
```

This downloads and starts two services:
- **Elasticsearch** — the database that stores and searches associations
- **API** — the backend that your browser will talk to

Wait until you see a line like `Uvicorn running on http://0.0.0.0:8000`. This takes 1–3 minutes on first run.

> **Verify:** open [http://localhost:8000/health](http://localhost:8000/health) in your browser. You should see `{"status":"ok"}`.

---

### Step 2 — Load the data

Open a **new terminal** (keep Step 1 running), go into the `backend/` folder, and run:

```bash
cd backend
uv run --group data-pipeline python -m data_pipeline.cli all
```

This downloads the RNA datasets from [data.gouv.fr](https://www.data.gouv.fr) and indexes them into Elasticsearch. It downloads ~300 MB and processes hundreds of thousands of associations — expect **5–15 minutes**.

> **Verify:** you should see progress bars while it downloads and indexes. It ends with no error message.

---

### Step 3 — Start the website

Open a **third terminal**, go into the `frontend/` folder, and run:

```bash
cd frontend
bun install
bun dev
```

`bun install` only needs to run once (or after updating the project). `bun dev` starts the website.

> **Verify:** open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Assearch search page.

---

### You're ready

Go to [http://localhost:3000](http://localhost:3000), type a search term (a name, a city, a topic), and press **Rechercher**.

---

## Stopping

- Website: press `Ctrl+C` in the frontend terminal
- API + database: press `Ctrl+C` in the Docker terminal, or run `docker compose down`

Your indexed data is saved in a Docker volume. Next time you start, skip Step 2 — the data is already there.

---

## Troubleshooting

**"Cannot connect to the Docker daemon"** — Docker Desktop is not running. Open it from your applications menu and wait for it to start.

**API health check fails after 3 minutes** — Elasticsearch may need more memory. In Docker Desktop, go to Settings → Resources and increase memory to at least 2 GB.

**No results when searching** — the data pipeline (Step 2) may not have finished. Check that terminal for errors and re-run if needed.

**Port already in use** — something else is using port 8000 or 3000. Stop that process, or see the sub-READMEs for how to change ports.

---

## Project structure

```
assearch/
├── backend/    # API + data pipeline — see backend/README.md
├── frontend/   # Search website — see frontend/README.md
└── docker-compose.yml
```

Developer documentation is in [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).
