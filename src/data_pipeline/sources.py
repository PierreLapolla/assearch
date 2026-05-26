from pathlib import Path

PROJECT_PATH = Path(__file__).parent.parent.parent
DATA_PATH = PROJECT_PATH / "data"
ELASTICSEARCH_URL = "http://localhost:9200"
INDEX_NAME = "associations"
BATCH_SIZE = 500

DATASETS = {
    "rna_doc": {
        "url": "https://www.data.gouv.fr/api/1/datasets/r/0d819aed-00e9-40a9-84d3-e7daeb586c81",
        "filename": "rna_doc.pdf",
    },
    "import": {
        "url": "https://www.data.gouv.fr/api/1/datasets/r/e3b0db97-7069-44bc-99dc-0ea7805986a8",
        "filename": "import.parquet",
    },
    "waldec": {
        "url": "https://www.data.gouv.fr/api/1/datasets/r/cc7b8f0c-45ea-4444-8b55-55d30bc34ac5",
        "filename": "waldec.parquet",
    },
}


def dataset_path(key: str, *, data_path: Path = DATA_PATH) -> Path:
    return data_path / DATASETS[key]["filename"]


def parquet_sources(*, data_path: Path = DATA_PATH) -> tuple[tuple[str, Path], ...]:
    return (
        ("import", dataset_path("import", data_path=data_path)),
        ("waldec", dataset_path("waldec", data_path=data_path)),
    )
