"""
APMC Bajarbhav Scraper (Mumbai APMC "veg-daily-public" source)
=================================================================

IMPORTANT CONTEXT:
Kopargaon APMC's own website (apmckopargaon.com) does NOT publish an
HTML price table - it links out to Mumbai APMC's bajarbhav system for
"Today's Market Rate". That system publishes real, dated, structured
HTML tables at predictable URLs:

    https://apmcmumbai.org/bajarbhav/view-daily-bajarbhav/{category}/{YYYY-MM-DD}

Known category slugs (from the site's own menu structure):
    veg    -> Vegetable Market (पालेभाजी)
    (others such as fruit/grain/spice/onion-potato categories may
     exist under similar slugs - verify by browsing the site's Market
     menu and checking the URL each sub-page uses)

This script fetches ONE day's PUBLICLY VISIBLE table (no login, no
private API, no auth) - the same table any visitor sees in a browser.

Usage:
    python apmc_kopargaon_scraper.py
    python apmc_kopargaon_scraper.py --category veg --date 2026-08-26
    python apmc_kopargaon_scraper.py --out prices.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import time
from dataclasses import dataclass, asdict
from typing import List, Optional

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://apmcmumbai.org/bajarbhav/view-daily-bajarbhav"
DEFAULT_CATEGORY = "veg"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)
REQUEST_TIMEOUT = 15  # seconds
MAX_RETRIES = 3
RETRY_BACKOFF = 2  # seconds, doubles each retry


@dataclass
class PriceRow:
    """One row of market price data. Fields are optional because
    different APMC table layouts use different column sets."""
    commodity: Optional[str] = None
    variety: Optional[str] = None
    unit: Optional[str] = None
    min_price: Optional[str] = None
    max_price: Optional[str] = None
    modal_price: Optional[str] = None
    arrival_qty: Optional[str] = None
    date: Optional[str] = None
    raw_cells: Optional[List[str]] = None  # fallback: unparsed row


class ScrapeError(Exception):
    """Raised when the page can't be fetched or has no usable table."""


def fetch_html(url: str, session: Optional[requests.Session] = None) -> str:
    """Fetch page HTML with retries and basic error handling."""
    sess = session or requests.Session()
    headers = {"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"}

    last_exc: Optional[Exception] = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = sess.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            if not resp.text.strip():
                raise ScrapeError("Server returned an empty page.")
            return resp.text
        except (requests.RequestException, ScrapeError) as exc:
            last_exc = exc
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF * attempt)
            continue

    raise ScrapeError(f"Failed to fetch {url} after {MAX_RETRIES} attempts: {last_exc}")


# Header keywords we try to map onto our normalized PriceRow fields.
# Includes both English and the Marathi terms actually used by
# apmcmumbai.org's bajarbhav tables (शेतमालाचे नाव, आवक, किमान भाव, etc).
#
# IMPORTANT: keys are checked in this order, and matching is by
# substring, so more specific / longer Marathi terms must come before
# shorter generic ones that could be accidental substrings of a
# DIFFERENT field's header (e.g. "माल" is a substring of "कमाल", so a
# naive commodity check would wrongly claim the max-price column).
# We deliberately use only unambiguous full terms below.
_HEADER_MAP = {
    "min_price": ["min", "minimum", "किमान"],
    "max_price": ["max", "maximum", "कमाल"],
    "modal_price": ["modal", "average", "सरासरी"],
    "arrival_qty": ["arrival", "quantity", "आवक"],
    "date": ["date", "दिनांक"],
    "variety": ["variety", "प्रत"],
    "unit": ["unit", "एकक"],
    "commodity": ["commodity", "produce", "item", "शेतमाल"],
}


def _classify_header(header_text: str) -> str:
    """Map a raw header cell to a normalized field name, or return
    the cleaned raw text if no match is found."""
    h = header_text.strip().lower()
    for field, keywords in _HEADER_MAP.items():
        if any(kw in h for kw in keywords):
            return field
    return header_text.strip() or "col"


def parse_price_table(html: str) -> List[PriceRow]:
    """Find and parse the market price table from the page HTML.

    Strategy:
      1. Look for all <table> elements.
      2. Pick the one whose header row best matches known price-table
         keywords (commodity/price/arrival/etc).
      3. Map each row's cells to PriceRow fields by header position.
      4. If no table is found or none look like price data, raise
         ScrapeError with a clear explanation (page may use an image
         or PDF instead of an HTML table).
    """
    soup = BeautifulSoup(html, "lxml")
    tables = soup.find_all("table")

    if not tables:
        raise ScrapeError(
            "No <table> element found on the page. The site may be "
            "displaying prices as an image or a linked PDF instead of "
            "an HTML table — check the page manually and, if so, use "
            "a PDF/image extraction approach instead."
        )

    best_table = None
    best_score = 0

    for table in tables:
        header_cells = table.find_all("th")
        if not header_cells:
            first_row = table.find("tr")
            header_cells = first_row.find_all(["td", "th"]) if first_row else []

        header_texts = [c.get_text(strip=True).lower() for c in header_cells]
        score = sum(
            1
            for h in header_texts
            for kws in _HEADER_MAP.values()
            if any(kw in h for kw in kws)
        )
        if score > best_score:
            best_score = score
            best_table = table

    if best_table is None or best_score == 0:
        raise ScrapeError(
            "Found table(s) on the page, but none had headers matching "
            "expected price-table columns (commodity, price, arrival, "
            "etc). The table structure may have changed — inspect the "
            "page HTML manually."
        )

    rows = best_table.find_all("tr")
    header_row = rows[0]
    header_cells = header_row.find_all(["th", "td"])
    field_order = [_classify_header(c.get_text(strip=True)) for c in header_cells]

    results: List[PriceRow] = []
    for row in rows[1:]:
        cells = [c.get_text(strip=True) for c in row.find_all("td")]
        if not cells or all(c == "" for c in cells):
            continue  # skip blank/spacer rows

        record = PriceRow(raw_cells=cells)
        for field, value in zip(field_order, cells):
            if field in PriceRow.__dataclass_fields__ and field != "raw_cells":
                setattr(record, field, value)
        results.append(record)

    if not results:
        raise ScrapeError("Table found but contained no data rows.")

    return results


def build_url(category: str, date: str) -> str:
    """Build a bajarbhav page URL for a given category and date.

    date must be in YYYY-MM-DD format (e.g. '2026-08-26').
    """
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        raise ValueError(f"date must be YYYY-MM-DD, got: {date!r}")
    return f"{BASE_URL}/{category}/{date}"


def scrape(url: str) -> List[PriceRow]:
    """High-level entry point: fetch + parse a given page URL."""
    html = fetch_html(url)
    return parse_price_table(html)


def scrape_date(category: str = DEFAULT_CATEGORY, date: Optional[str] = None) -> List[PriceRow]:
    """Convenience wrapper: scrape a specific category/date.

    If date is None, uses today's date (Asia/Kolkata-naive; adjust if
    your server runs in a different timezone and the site expects IST).
    """
    if date is None:
        date = time.strftime("%Y-%m-%d")
    url = build_url(category, date)
    return scrape(url)


def save_csv(rows: List[PriceRow], path: str) -> None:
    if not rows:
        raise ValueError("No rows to save.")
    fieldnames = [f for f in PriceRow.__dataclass_fields__ if f != "raw_cells"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: getattr(row, k) for k in fieldnames})


def save_json(
    rows: List[PriceRow],
    path: str,
    category: str = DEFAULT_CATEGORY,
    date: Optional[str] = None,
    source_url: str = ""
) -> None:
    from datetime import datetime, timezone
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    scrape_date = date or time.strftime("%Y-%m-%d")
    payload = {
        "category": category,
        "date": scrape_date,
        "scraped_at_utc": now_utc,
        "row_count": len(rows),
        "source_url": source_url,
        "rows": [asdict(r) for r in rows]
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--category", default=DEFAULT_CATEGORY,
                         help="Bajarbhav category slug, e.g. 'veg' (default: veg)")
    parser.add_argument("--date", default=None,
                         help="Date in YYYY-MM-DD format (default: today)")
    parser.add_argument("--url", default=None,
                         help="Full page URL to scrape (overrides --category/--date)")
    parser.add_argument("--out", default=None, help="Output file (.csv or .json)")
    parser.add_argument("--publish", default=None, help="Publish JSON output file path (e.g. public/data/prices.json)")
    args = parser.parse_args()

    scrape_date = args.date or time.strftime("%Y-%m-%d")
    url = args.url or build_url(args.category, scrape_date)

    try:
        rows = scrape(url)
    except ScrapeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Scraped {len(rows)} rows from {url}\n")
    for r in rows[:10]:
        print(asdict(r))
    if len(rows) > 10:
        print(f"... and {len(rows) - 10} more rows")

    target_json = args.publish or (args.out if args.out and args.out.endswith(".json") else None)
    if target_json:
        import os
        os.makedirs(os.path.dirname(os.path.abspath(target_json)), exist_ok=True)
        save_json(rows, target_json, category=args.category, date=scrape_date, source_url=url)
        print(f"\nPublished JSON to {target_json}")
    elif args.out:
        save_csv(rows, args.out)
        print(f"\nSaved CSV to {args.out}")


if __name__ == "__main__":
    main()
