"""
Basic tests for apmc_kopargaon_scraper.py

Run with:
    python test_scraper.py

These use a small saved HTML snippet (based on the real structure of
apmcmumbai.org's bajarbhav table, verified 2026-08-26) instead of
hitting the live network, so they run fast and don't depend on the
site being up.
"""

import sys
from apmc_kopargaon_scraper import parse_price_table, build_url, ScrapeError, PriceRow

# A trimmed but structurally faithful sample of the real table HTML
# (Marathi headers + a few real data rows, matching what apmcmumbai.org
# actually returns for /bajarbhav/view-daily-bajarbhav/veg/2026-08-26).
SAMPLE_HTML = """
<html><body>
<table>
  <tr>
    <th>शेतमालाचे नाव</th>
    <th>आवक</th>
    <th>किमान भाव</th>
    <th>कमाल भाव</th>
    <th>सरासरी भाव</th>
  </tr>
  <tr><td>भुईमूग शेंगा</td><td>144</td><td>7000</td><td>11000</td><td>9000</td></tr>
  <tr><td>लिंबू</td><td>110</td><td>2000</td><td>3600</td><td>2800</td></tr>
  <tr><td>टोमॅटो नंबर १</td><td>2706</td><td>1400</td><td>2000</td><td>1700</td></tr>
</table>
</body></html>
"""

EMPTY_HTML = "<html><body><p>No table here, just text.</p></body></html>"

IRRELEVANT_TABLE_HTML = """
<html><body>
<table>
  <tr><th>Menu</th><th>Link</th></tr>
  <tr><td>Home</td><td>/home</td></tr>
</table>
</body></html>
"""


def test_parses_real_structure():
    rows = parse_price_table(SAMPLE_HTML)
    assert len(rows) == 3, f"expected 3 rows, got {len(rows)}"

    first = rows[0]
    assert first.commodity == "भुईमूग शेंगा"
    assert first.arrival_qty == "144"
    assert first.min_price == "7000"
    assert first.max_price == "11000"
    assert first.modal_price == "9000"
    print("PASS: test_parses_real_structure")


def test_no_table_raises():
    try:
        parse_price_table(EMPTY_HTML)
    except ScrapeError as e:
        assert "No <table>" in str(e)
        print("PASS: test_no_table_raises")
        return
    raise AssertionError("Expected ScrapeError for page with no table")


def test_irrelevant_table_raises():
    try:
        parse_price_table(IRRELEVANT_TABLE_HTML)
    except ScrapeError as e:
        assert "none had headers matching" in str(e)
        print("PASS: test_irrelevant_table_raises")
        return
    raise AssertionError("Expected ScrapeError for table with no matching headers")


def test_build_url():
    url = build_url("veg", "2026-08-26")
    assert url == "https://apmcmumbai.org/bajarbhav/view-daily-bajarbhav/veg/2026-08-26"
    print("PASS: test_build_url")


def test_build_url_rejects_bad_date():
    try:
        build_url("veg", "26-08-2026")  # wrong format
    except ValueError:
        print("PASS: test_build_url_rejects_bad_date")
        return
    raise AssertionError("Expected ValueError for malformed date")


def test_raw_cells_always_populated():
    """Even if header mapping is imperfect, raw_cells should always
    preserve the original row data as a fallback."""
    rows = parse_price_table(SAMPLE_HTML)
    for r in rows:
        assert r.raw_cells is not None and len(r.raw_cells) == 5
    print("PASS: test_raw_cells_always_populated")


if __name__ == "__main__":
    tests = [
        test_parses_real_structure,
        test_no_table_raises,
        test_irrelevant_table_raises,
        test_build_url,
        test_build_url_rejects_bad_date,
        test_raw_cells_always_populated,
    ]
    failures = 0
    for t in tests:
        try:
            t()
        except AssertionError as e:
            failures += 1
            print(f"FAIL: {t.__name__}: {e}")
    if failures:
        print(f"\n{failures} test(s) failed")
        sys.exit(1)
    print(f"\nAll {len(tests)} tests passed")
