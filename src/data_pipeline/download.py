from pathlib import Path
from urllib.parse import urlparse

import requests
from pedros import safe


def download(
    url: str,
    destination: str | Path,
    *,
    overwrite: bool = False,
    timeout: float = 30,
) -> Path:
    parsed_url = urlparse(url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise ValueError(f"Invalid download URL: {url!r}")

    destination_path = Path(destination)
    destination_path.parent.mkdir(parents=True, exist_ok=True)

    if destination_path.exists() and not overwrite:
        return destination_path

    partial_path = destination_path.with_name(f"{destination_path.name}.part")

    @safe(
        catch=(requests.RequestException, OSError),
        on_error=lambda _: partial_path.unlink(missing_ok=True),
    )
    def write_partial() -> None:
        with requests.get(url, stream=True, timeout=timeout) as response:
            response.raise_for_status()

            with partial_path.open("wb") as file:
                chunks = response.iter_content(chunk_size=1024 * 1024)
                for chunk in chunks:
                    if chunk:
                        file.write(chunk)

    write_partial()
    partial_path.replace(destination_path)

    return destination_path
