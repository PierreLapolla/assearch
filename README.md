![Ruff](https://img.shields.io/badge/ruff-enabled-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

# Assearch

Fast search engine for french assocations

## Installation

### Requirements

- [UV](https://docs.astral.sh/uv/) package manager, see [Installing uv](https://docs.astral.sh/uv/getting-started/installation/)


### Initialize your environment

```bash
  uv sync
  uv run opentelemetry-bootstrap -a install
```

## Running the project

To run the project locally, run the following command:

```bash
  uv run fastapi dev
```

To run it in production mode:

```bash
  uv run fastapi run
```

Run locally with telemetry enabled:

```bash
  uv run --env-file .env opentelemetry-instrument fastapi dev
```

## Data pipeline

The data pipeline is source-only and its dependencies are kept out of the main
application install. Run it with the dedicated dependency group:

```bash
  PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli all
```

Download only:

```bash
  PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli download
```

Index existing downloaded data only:

```bash
  PYTHONPATH=src uv run --group data-pipeline python -m data_pipeline.cli index
```

## Docker

Build the image:

```bash
  docker build -t assearch .
```

Run the container locally:

```bash
  docker run --rm --env-file .env -p 8000:8000 assearch
```

Run all services together:

```bash
   docker compose up --build
```

## Tests, linting and formatting

```bash
  uv run pytest
```

```bash
  uvx ruff check . --fix
```

```bash
  uvx ruff format .
```

## License

This project is licensed under the MIT [LICENSE](LICENSE)
