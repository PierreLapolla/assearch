from concurrent.futures import ThreadPoolExecutor, as_completed
from collections.abc import Iterable

import requests
from pedros import progbar

TIMEOUT = 5.0
CONCURRENCY = 30
# Sites that block HEAD but are alive return 405; treat anything <500 as reachable.
# Connection errors / timeouts → False.


def _check_one(url: str) -> tuple[str, bool]:
    try:
        r = requests.head(url, allow_redirects=True, timeout=TIMEOUT)
        return url, r.status_code < 500
    except Exception:
        return url, False


def check_urls(urls: Iterable[str]) -> dict[str, bool]:
    """Returns {url: reachable} for each unique non-empty URL in `urls`."""
    unique = list({u for u in urls if u and u.strip()})
    if not unique:
        return {}

    results: dict[str, bool] = {}
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
        futures = {pool.submit(_check_one, url): url for url in unique}
        for future in progbar(as_completed(futures), desc="Checking URLs", total=len(unique)):
            url, ok = future.result()
            results[url] = ok

    return results
