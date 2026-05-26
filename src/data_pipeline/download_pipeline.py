from pathlib import Path

from pedros import progbar

from data_pipeline.download import download
from data_pipeline.sources import DATA_PATH, DATASETS


def download_data(*, data_path: Path = DATA_PATH) -> None:
    for key in progbar(DATASETS, desc="Downloading data", total=len(DATASETS)):
        source = DATASETS[key]
        download(source["url"], data_path / source["filename"])
