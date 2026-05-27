# syntax=docker/dockerfile:1.7
ARG PYTHON_VERSION=3.14
ARG UV_VERSION=0.11.0

FROM ghcr.io/astral-sh/uv:${UV_VERSION}-python${PYTHON_VERSION}-trixie-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_LINK_MODE=copy \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY pyproject.toml uv.lock README.md LICENSE /app/

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-install-project --no-editable

COPY src /app/src

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-editable

RUN --mount=type=cache,target=/root/.cache/pip \
    opentelemetry-bootstrap -a install


FROM python:${PYTHON_VERSION}-slim-trixie AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

RUN useradd --create-home --uid 10001 --shell /usr/sbin/nologin appuser

COPY --from=builder /opt/venv /opt/venv
COPY pyproject.toml /app/pyproject.toml

USER appuser
WORKDIR /app

EXPOSE 8000

ENTRYPOINT ["opentelemetry-instrument", "fastapi", "run"]
