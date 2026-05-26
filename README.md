![Ruff](https://img.shields.io/badge/ruff-enabled-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

# Python App Template

This project provides a starter structure and tooling for Python apps, aiming for a consistent and modern dev experience.

## Installation

### Requirements

- [UV](https://docs.astral.sh/uv/) package manager, see [Installing uv](https://docs.astral.sh/uv/getting-started/installation/)


### Initialize your environment

```bash
  uv sync
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

## Docker

Build the image:

```bash
  docker build -t fastapi .
```

Run the container:

```bash
  docker run --rm fastapi
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
