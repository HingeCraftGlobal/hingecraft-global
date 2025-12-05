#!/usr/bin/env python3
"""
Extract registry/membership data from provided HTML files into CSV for DB + Wix CMS.

Inputs (local paths):
  - /Users/chandlerfergusen/Downloads/name_on_public_charter_masked_sorted (3).html
  - /Users/chandlerfergusen/Downloads/membership_portal_full V3.html
  - /Users/chandlerfergusen/Downloads/portal_login_social_participation.html
  - /Users/chandlerfergusen/Downloads/lifetime_registry_inclusion (13).html
  - /Users/chandlerfergusen/Downloads/lifetime_registry_inclusion (13) (1).html

Outputs:
  - database/registry_import.csv        (normalized)
  - database/registry_wix_import.csv    (same headers; Wix-friendly)

Run:
  cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
  python3 scripts/extract_registry.py
"""

import ast
import csv
import json
import os
import re
import sys
from datetime import datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_DIR = os.path.join(ROOT, "database")
os.makedirs(DB_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean_text(val):
    if val is None:
        return ""
    return " ".join(str(val).strip().split())


def _now_iso():
    return datetime.utcnow().isoformat()


def _write_csv(path, rows):
    fieldnames = [
        "_id",
        "_createdDate",
        "_updatedDate",
        "_owner",
        "first_name",
        "last_name",
        "twin_name",
        "membership_id",
        "city",
        "region",
        "country",
        "registry_date",
        "source_file",
        "metadata",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow({k: r.get(k, "") for k in fieldnames})


def _load_file(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def _extract_table_rows(html, source_file):
    """Parse simple HTML table rows (first file)."""
    rows = []
    # crude table extraction
    table_body = re.search(r"<tbody>(.*?)</tbody>", html, re.DOTALL | re.IGNORECASE)
    if not table_body:
        return rows
    trs = re.findall(r"<tr>(.*?)</tr>", table_body.group(1), re.DOTALL | re.IGNORECASE)
    for tr in trs:
        tds = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.DOTALL | re.IGNORECASE)
        if len(tds) < 8:
            continue
        first, last, twin, mid, city, region, country, regdate = [re.sub(r"<.*?>", "", t) for t in tds[:8]]
        rows.append({
            "_id": _clean_text(mid) or _clean_text(twin) or _clean_text(first + last),
            "_createdDate": _now_iso(),
            "_updatedDate": _now_iso(),
            "_owner": "system",
            "first_name": _clean_text(first),
            "last_name": _clean_text(last),
            "twin_name": _clean_text(twin),
            "membership_id": _clean_text(mid),
            "city": _clean_text(city),
            "region": _clean_text(region),
            "country": _clean_text(country),
            "registry_date": _clean_text(regdate),
            "source_file": source_file,
            "metadata": "",
        })
    return rows


def _extract_mock_object(html, var_name, source_file):
    """Extract simple JS object like const mockMember = { ... };"""
    rows = []
    m = re.search(rf"const\s+{re.escape(var_name)}\s*=\s*{{(.*?)}};", html, re.DOTALL)
    if not m:
        return rows
    body = m.group(1)
    # Convert JS-ish to JSON-ish
    text = "{%s}" % body
    text = re.sub(r"(\w+):", r'"\1":', text)  # quote keys
    text = text.replace("'", '"')
    text = re.sub(r",\s*}", "}", text)
    try:
        data = json.loads(text)
    except Exception:
        return rows
    rows.append({
        "_id": data.get("membershipId") or data.get("membershipNumericId") or data.get("name"),
        "_createdDate": _now_iso(),
        "_updatedDate": _now_iso(),
        "_owner": "system",
        "first_name": _clean_text(data.get("name", data.get("givenName", ""))).split(" ")[0] if data.get("name") or data.get("givenName") else "",
        "last_name": " ".join(_clean_text(data.get("name", data.get("givenName", ""))).split(" ")[1:]),
        "twin_name": _clean_text(data.get("twinName") or data.get("aiSuggestion") or data.get("membershipId")),
        "membership_id": _clean_text(data.get("membershipId") or data.get("membershipNumericId")),
        "city": _clean_text(data.get("city")),
        "region": _clean_text(data.get("region")),
        "country": _clean_text(data.get("country")),
        "registry_date": _clean_text(data.get("lastDonationDate") or data.get("startDate")),
        "source_file": source_file,
        "metadata": json.dumps(data),
    })
    return rows


def _parse_js_array(js_text, name):
    m = re.search(rf"const\s+{re.escape(name)}\s*=\s*\[(.*?)\];", js_text, re.DOTALL)
    if not m:
        return []
    arr_text = "[" + m.group(1) + "]"
    arr_text = arr_text.replace("\n", "").replace("\r", "")
    return ast.literal_eval(arr_text)


def _extract_lifetime_registry(html, source_file):
    """Rebuild the registry data defined in the lifetime_registry_inclusion files."""
    rows = []
    # Extract arrays
    first_names = _parse_js_array(html, "firstNames")
    last_names = _parse_js_array(html, "lastNames")
    twin_prefixes = _parse_js_array(html, "twinPrefixes")
    twin_suffixes = _parse_js_array(html, "twinSuffixes")
    locations = _parse_js_array(html, "locations")

    if not (first_names and last_names and twin_prefixes and twin_suffixes and locations):
        return rows

    twin_combos = []
    for pre in twin_prefixes:
        for suf in twin_suffixes:
            twin_combos.append(f"{pre} {suf}")

    def registry_date(idx):
        # Deterministic date-ish string
        base = datetime(2024, 1, 1)
        d = base.replace(month=((idx % 12) + 1), day=((idx % 27) + 1))
        return d.strftime("%d-%m-%Y")

    counter = 1
    for i, fn in enumerate(first_names):
        for j, ln in enumerate(last_names):
            if counter > 200:
                break
            combo = twin_combos[(counter - 1) % len(twin_combos)]
            city, region, country = locations[(counter - 1) % len(locations)]
            member_number = str(counter).zfill(10)
            rows.append({
                "_id": member_number,
                "_createdDate": _now_iso(),
                "_updatedDate": _now_iso(),
                "_owner": "system",
                "first_name": fn,
                "last_name": ln,
                "twin_name": combo,
                "membership_id": member_number,
                "city": city,
                "region": region,
                "country": country,
                "registry_date": registry_date(counter),
                "source_file": source_file,
                "metadata": "",
            })
            counter += 1
            if counter > 200:
                break

    # Master record
    rows.append({
        "_id": "00000000001",
        "_createdDate": _now_iso(),
        "_updatedDate": _now_iso(),
        "_owner": "system",
        "first_name": "Dan",
        "last_name": "Diotte",
        "twin_name": "R2D2",
        "membership_id": "00000000001",
        "city": "Aitken",
        "region": "South Carolina",
        "country": "USA",
        "registry_date": registry_date(counter),
        "source_file": source_file,
        "metadata": "",
    })

    return rows


def dedupe(rows):
    seen = set()
    out = []
    for r in rows:
        key = r.get("membership_id") or r.get("_id")
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


def main():
    sources = [
        "/Users/chandlerfergusen/Downloads/name_on_public_charter_masked_sorted (3).html",
        "/Users/chandlerfergusen/Downloads/membership_portal_full V3.html",
        "/Users/chandlerfergusen/Downloads/portal_login_social_participation.html",
        "/Users/chandlerfergusen/Downloads/lifetime_registry_inclusion (13).html",
        "/Users/chandlerfergusen/Downloads/lifetime_registry_inclusion (13) (1).html",
    ]

    all_rows = []

    for path in sources:
        if not os.path.isfile(path):
            print(f"⚠️  Missing file: {path}")
            continue
        html = _load_file(path)
        if "name_on_public_charter_masked_sorted" in path:
            all_rows.extend(_extract_table_rows(html, os.path.basename(path)))
        elif "membership_portal_full" in path:
            all_rows.extend(_extract_mock_object(html, "mockMember", os.path.basename(path)))
        elif "portal_login_social_participation" in path:
            all_rows.extend(_extract_mock_object(html, "mockPortalMember", os.path.basename(path)))
        elif "lifetime_registry_inclusion" in path:
            all_rows.extend(_extract_lifetime_registry(html, os.path.basename(path)))

    all_rows = dedupe(all_rows)
    if not all_rows:
        print("No rows extracted.")
        sys.exit(1)

    # Backfill required fields
    for r in all_rows:
        if not r.get("_id"):
            r["_id"] = r.get("membership_id") or _clean_text(r.get("twin_name")) or _clean_text(r.get("first_name") + r.get("last_name"))
        if not r.get("membership_id"):
            r["membership_id"] = r["_id"]
        r["_createdDate"] = r.get("_createdDate") or _now_iso()
        r["_updatedDate"] = r.get("_updatedDate") or _now_iso()
        r["_owner"] = r.get("_owner") or "system"
        if isinstance(r.get("metadata"), dict):
            r["metadata"] = json.dumps(r["metadata"])

    out_main = os.path.join(DB_DIR, "registry_import.csv")
    out_wix = os.path.join(DB_DIR, "registry_wix_import.csv")

    _write_csv(out_main, all_rows)
    _write_csv(out_wix, all_rows)

    print(f"✅ Extracted {len(all_rows)} records")
    print(f"📄 Written: {out_main}")
    print(f"📄 Written: {out_wix}")


if __name__ == "__main__":
    main()

