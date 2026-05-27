# Assearch — Frontend

Next.js + shadcn/ui search interface for the Assearch API.

All commands run from the `frontend/` directory.

## Setup

Requires [Bun](https://bun.sh).

```bash
bun install
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to point at the backend (default: `http://localhost:8000`).

## Running

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deployed to Vercel. Set **Root Directory** to `frontend/` in the Vercel project settings. Every push to `master` triggers a deploy; PRs get preview URLs automatically.
