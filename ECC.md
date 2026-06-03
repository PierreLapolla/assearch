# ECC — How Claude Uses It in This Project

ECC is the agent harness that wraps Claude Code with skills, hooks, and specialized agents.

## What fires automatically (no prompt needed)

Claude should trigger these without being asked:

| Trigger | Skill fired |
|---------|-------------|
| Any `.tsx` / `.jsx` change | `/ecc:react-review` |
| Any Python change | `/ecc:python-review` |
| Any FastAPI route / schema change | `/ecc:fastapi-review` |
| New feature implemented | `/ecc:code-review` |
| Auth, input handling, external API, Docker config | `/ecc:security-scan` |
| Build fails | `/ecc:react-build` (frontend) or `/ecc:build-fix` (backend) |

If Claude modifies code and skips these, call it out — it should self-correct.

---

## What you invoke manually

### Planning
```
/ecc:plan "description"        — break feature into tasks before coding
/ecc:feature-dev "description" — full TDD cycle: plan → test → implement → review
```

### Code review
```
/code-review          — review current diff (default: medium effort)
/code-review high     — broader coverage
/code-review ultra    — deep multi-agent cloud review (costs more, use before big merges)
/code-review --fix    — review + auto-apply fixes
```

### PR workflow
```
/ecc:pr               — create PR with full summary and test plan
```

### Production readiness
```
/ecc:production-audit — full pre-launch checklist
/ecc:security-scan    — OWASP, secrets, injection audit
/ecc:seo              — meta tags, structured data, Core Web Vitals
```

### Maintenance
```
/ecc:refactor-clean   — remove dead code, duplicates (runs knip/depcheck)
/ecc:test-coverage    — check coverage, identify gaps
```

---

## Skill anatomy

Skills live in `~/.claude/skills/` (global) and `.claude/skills/` (project).
Each is a `SKILL.md` file Claude reads as a loaded instruction set when invoked.

To see what a skill does before running it: ask "what does /ecc:X do?"

---

## This project's stack → relevant skills

| Layer | Skills |
|-------|--------|
| Next.js frontend | `/ecc:react-review`, `/ecc:react-patterns`, `/ecc:react-performance`, `/ecc:nextjs-turbopack` |
| FastAPI backend | `/ecc:fastapi-review`, `/ecc:python-review`, `/ecc:python-patterns` |
| Elasticsearch | `/ecc:backend-patterns` |
| Docker | `/ecc:docker-patterns`, `/ecc:deployment-patterns` |
| Security | `/ecc:security-scan`, `/ecc:security-review` |
| Testing | `/ecc:tdd-workflow`, `/ecc:test-coverage`, `/ecc:e2e-testing` |
