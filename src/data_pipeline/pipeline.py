from pathlib import Path

from data_pipeline.download_pipeline import download_data
from data_pipeline.index import index_data
from data_pipeline.sources import DATA_PATH, ELASTICSEARCH_URL, INDEX_NAME


def run_pipeline(
    step: str = "all",
    *,
    data_path: Path = DATA_PATH,
    elasticsearch_url: str = ELASTICSEARCH_URL,
    index_name: str = INDEX_NAME,
) -> None:
    if step not in {"download", "index", "all"}:
        raise ValueError(f"Invalid pipeline step: {step!r}")

    if step in {"download", "all"}:
        download_data(data_path=data_path)

    if step in {"index", "all"}:
        index_data(
            data_path=data_path,
            elasticsearch_url=elasticsearch_url,
            index_name=index_name,
        )
