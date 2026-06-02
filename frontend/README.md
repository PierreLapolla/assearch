# Assearch — Frontend

Next.js search interface for the Assearch API.

> **Running locally for the first time?** See the [root README](../README.md) for step-by-step setup.

All commands run from the `frontend/` directory.

---

## Setup

Requires [Bun](https://bun.sh).

```bash
bun install
```

To point at a non-local backend, create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://your-api-host:8000
```

Default is `http://localhost:8000`.

---

## Dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Skeleton capture (boneyard)

Loading skeletons are auto-generated from the real card layout by [boneyard-js](https://github.com/0xGF/boneyard). After the app is running with real search results visible, regenerate captures:

```bash
npx boneyard-js build
```

Commit the `.bones/` output so skeletons stay accurate in production.

---

## Deploy

Deployed to Vercel. Set **Root Directory** to `frontend/` in the Vercel project settings. Every push to `master` triggers a deploy; PRs get preview URLs automatically.
