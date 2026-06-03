from collections.abc import Iterator
from pathlib import Path
from typing import Any

import polars as pl

NULL_DATE = "0001-01-01"

WALDEC_COLUMNS = [
    "id", "titre", "objet",
    "adrs_numvoie", "adrs_typevoie", "adrs_libvoie", "adrs_complement",
    "adrs_codepostal", "adrs_libcommune",
    "siteweb", "date_creat", "date_disso",
    "position", "nature", "groupement",
]

IMPORT_COLUMNS = [
    "id", "titre", "objet",
    "adr1", "adr2", "adr3",
    "adrs_codepostal", "libcom",
    "siteweb", "date_creat",
    "position", "nature", "groupement",
]


def row_count(path: Path) -> int:
    return pl.scan_parquet(path).select(pl.len()).collect().item()


def _clean_date(val: str | None) -> str | None:
    if not val or str(val).startswith(NULL_DATE):
        return None
    return str(val)[:10]


def _build_waldec_address(row: dict[str, Any]) -> str | None:
    street_parts = [row.get("adrs_numvoie"), row.get("adrs_typevoie"), row.get("adrs_libvoie")]
    street = " ".join(p.strip() for p in street_parts if p and str(p).strip())
    complement = row.get("adrs_complement")
    if complement and str(complement).strip():
        return f"{street}, {complement.strip()}" if street else complement.strip()
    return street or None


def _build_import_address(row: dict[str, Any]) -> str | None:
    parts = [row.get("adr1"), row.get("adr2"), row.get("adr3")]
    return ", ".join(str(p).strip() for p in parts if p and str(p).strip()) or None


def iter_documents(source: str, path: Path) -> Iterator[dict[str, Any]]:
    if source == "waldec":
        frame = pl.read_parquet(path, columns=WALDEC_COLUMNS)
        for row in frame.iter_rows(named=True):
            yield {
                "_id": f"waldec:{row['id']}",
                "source": "waldec",
                "id": row["id"],
                "title": row["titre"],
                "description": row["objet"],
                "address": _build_waldec_address(row),
                "city": row["adrs_libcommune"],
                "postal_code": row["adrs_codepostal"],
                "website": row["siteweb"],
                "date_creat": _clean_date(row.get("date_creat")),
                "date_disso": _clean_date(row.get("date_disso")),
                "position": row.get("position"),
                "nature": row.get("nature"),
                "groupement": row.get("groupement"),
            }
    else:
        frame = pl.read_parquet(path, columns=IMPORT_COLUMNS)
        for row in frame.iter_rows(named=True):
            yield {
                "_id": f"import:{row['id']}",
                "source": "import",
                "id": row["id"],
                "title": row["titre"],
                "description": row["objet"],
                "address": _build_import_address(row),
                "city": row["libcom"],
                "postal_code": row["adrs_codepostal"],
                "website": row["siteweb"],
                "date_creat": _clean_date(row.get("date_creat")),
                "date_disso": None,
                "position": row.get("position"),
                "nature": row.get("nature"),
                "groupement": row.get("groupement"),
            }
