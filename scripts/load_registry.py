#!/usr/bin/env python3
"""
Load registry_import.csv into the members table.

Prereqs:
  pip install psycopg2-binary
Env (defaults shown):
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=hingecraft_db
  DB_USER=hingecraft_user
  DB_PASSWORD=hingecraft_secure_password_123

Run:
  cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
  python3 scripts/load_registry.py
"""

import csv
import os
import sys
import psycopg2
from psycopg2.extras import execute_values

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CSV_PATH = os.path.join(ROOT, "database", "registry_import.csv")


def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "hingecraft_db"),
        user=os.getenv("DB_USER", "hingecraft_user"),
        password=os.getenv("DB_PASSWORD", "hingecraft_secure_password_123"),
    )


def load_rows():
    if not os.path.isfile(CSV_PATH):
        print(f"Missing CSV: {CSV_PATH}")
        sys.exit(1)
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def upsert_members(conn, rows):
    cols = [
        "_id", "_createdDate", "_updatedDate", "_owner",
        "first_name", "last_name", "twin_name", "membership_id",
        "city", "region", "country", "registry_date",
        "source_file", "metadata"
    ]
    values = []
    for r in rows:
        values.append([r.get(c) for c in cols])

    sql = """
    INSERT INTO members (
        "_id","_createdDate","_updatedDate","_owner",
        first_name,last_name,twin_name,membership_id,
        city,region,country,registry_date,
        source_file,metadata
    ) VALUES %s
    ON CONFLICT (membership_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        twin_name = EXCLUDED.twin_name,
        city = EXCLUDED.city,
        region = EXCLUDED.region,
        country = EXCLUDED.country,
        registry_date = EXCLUDED.registry_date,
        source_file = EXCLUDED.source_file,
        metadata = EXCLUDED.metadata,
        "_updatedDate" = NOW(),
        updated_at = NOW();
    """
    with conn.cursor() as cur:
        execute_values(cur, sql, values, page_size=500)
    conn.commit()


def main():
    rows = load_rows()
    if not rows:
        print("No rows to load.")
        return
    conn = get_conn()
    try:
        upsert_members(conn, rows)
        print(f"✅ Loaded {len(rows)} member records into members table.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()







