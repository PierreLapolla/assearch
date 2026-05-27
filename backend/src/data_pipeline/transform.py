from collections.abc import Iterator
from pathlib import Path
from typing import Any

import polars as pl

SOURCE_COLUMNS = {
    "import": {
        "city": "libcom",
    },
    "waldec": {
        "city": "adrs_libcommune",
    },
}


def row_count(path: Path) -> int:
    return pl.scan_parquet(path).select(pl.len()).collect().item()


def normalized_frame(source: str, path: Path) -> pl.DataFrame:
    city_column = SOURCE_COLUMNS[source]["city"]

    return (
        pl.read_parquet(
            path,
            columns=["id", "titre", "objet", "adrs_codepostal", city_column, "siteweb"],
        )
        .rename(
            {
                "titre": "title",
                "objet": "description",
                "adrs_codepostal": "postal_code",
                city_column: "city",
                "siteweb": "website",
            }
        )
        .with_columns(source=pl.lit(source))
    )


def iter_documents(source: str, path: Path) -> Iterator[dict[str, Any]]:
    frame = normalized_frame(source, path)
    for row in frame.iter_rows(named=True):
        yield {
            "_id": f"{source}:{row['id']}",
            "source": row["source"],
            "id": row["id"],
            "title": row["title"],
            "description": row["description"],
            "city": row["city"],
            "postal_code": row["postal_code"],
            "website": row["website"],
        }
