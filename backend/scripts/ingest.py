"""
ingest.py - SF 311 CSV ingestion script.

Place the downloaded CSV at scripts/data.csv then run:
    python scripts/ingest.py

Reads the full CSV (all open cases), filters to target categories,
and upserts into the local PostgreSQL + PostGIS database in batches.
"""

import os
import sys
import csv
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

DB_DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://civicsense:civicadmin@localhost:5433/civicsense",
)   

CSV_PATH = os.path.join(os.path.dirname(__file__), "data.csv")
BATCH_SIZE = 5000

# ---------------------------------------------------------------------------
# Category normalization
# ---------------------------------------------------------------------------

CATEGORY_MAP = {
    # Illegal Dumping
    "illegal dumping":          "Illegal Dumping",
    "dumping":                  "Illegal Dumping",
    "encampment":               "Illegal Dumping",

    # Graffiti
    "graffiti":                 "Graffiti",
    "illegal postings":         "Graffiti",
    "damaged property":         "Graffiti",
    "damage property":          "Graffiti",

    # Pothole / Street Defects
    "pothole":                  "Pothole",
    "street defect":            "Pothole",
    "street defects":           "Pothole",

    # Blocked Sidewalk
    "blocked street or sidewalk":   "Blocked Sidewalk",
    "blocked street and sidewalk":  "Blocked Sidewalk",
    "sidewalk or curb":             "Blocked Sidewalk",
    "sidewalk and curb":            "Blocked Sidewalk",
    "sidewalk":                     "Blocked Sidewalk",

    # Overflowing Receptacle
    "litter receptacle":        "Overflowing Receptacle",
    "street and sidewalk cleaning": "Overflowing Receptacle",

    # Streetlight
    "streetlight":              "Streetlight Issue",
    "streetlights":             "Streetlight Issue",
    "street light":             "Streetlight Issue",
    "sign repair":              "Streetlight Issue",

    # Traffic Signal
    "traffic signal":           "Traffic Signal Issue",
    "mta parking traffic":      "Traffic Signal Issue",
}


def normalize_category(raw: str) -> str | None:
    if not raw:
        return None
    lower = raw.lower()
    for key, normalized in CATEGORY_MAP.items():
        if key in lower:
            return normalized
    return None


# ---------------------------------------------------------------------------
# Parse a single CSV row
# ---------------------------------------------------------------------------

def parse_dt(val: str) -> datetime | None:
    if not val:
        return None
    try:
        dt = datetime.strptime(val, "%m/%d/%Y %I:%M:%S %p")
        return dt.replace(tzinfo=timezone.utc)
    except ValueError:
        try:
            return datetime.fromisoformat(val)
        except Exception:
            return None


def parse_row(row: dict, skip_reasons: dict) -> dict | None:
    # Category filter
    raw_category = row.get("Category") or ""
    category = normalize_category(raw_category)
    if not category:
        skip_reasons["category_no_match"] += 1
        return None

    # Coordinates
    try:
        lat = float(row.get("Latitude") or "")
        lng = float(row.get("Longitude") or "")
    except (ValueError, TypeError):
        skip_reasons["no_coordinates"] += 1
        return None

    # SF bounding box sanity check
    if not (37.6 <= lat <= 37.95 and -122.55 <= lng <= -122.33):
        skip_reasons["outside_sf"] += 1
        return None

    case_id = row.get("CaseID") or ""
    if not case_id:
        skip_reasons["no_case_id"] += 1
        return None

    return {
        "case_id":      case_id,
        "category":     category,
        "description":  row.get("Request Details") or "",
        "status":       row.get("Status") or "Open",
        "opened_date":  parse_dt(row.get("Opened")),
        "updated_date": parse_dt(row.get("Updated")),
        "address":      row.get("Address") or "",
        "neighborhood": (
            row.get("Neighborhood")
            or row.get("Analysis Neighborhood")
            or ""
        ),
        "media_url": row.get("Media URL") or None,
        "lat": lat,
        "lng": lng,
    }


# ---------------------------------------------------------------------------
# Insert in batches
# ---------------------------------------------------------------------------

def insert_cases(conn, records: list[dict]) -> int:
    if not records:
        return 0

    sql = """
        INSERT INTO cases (
            case_id, category, description, status,
            opened_date, updated_date, address, neighborhood,
            location, source, media_url
        ) VALUES %s
        ON CONFLICT (case_id) DO UPDATE SET
            status       = EXCLUDED.status,
            updated_date = EXCLUDED.updated_date,
            media_url    = EXCLUDED.media_url
    """

    template = """(
        %s, %s, %s, %s, %s, %s, %s, %s,
        ST_GeogFromText(%s), %s, %s
    )"""

    rows = [
        (
            r["case_id"],
            r["category"],
            r["description"],
            r["status"],
            r["opened_date"],
            r["updated_date"],
            r["address"],
            r["neighborhood"],
            f"SRID=4326;POINT({r['lng']} {r['lat']})",
            "311",
            r.get("media_url"),
        )
        for r in records
    ]

    total_inserted = 0
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        with conn.cursor() as cur:
            execute_values(cur, sql, batch, template=template)
        conn.commit()
        total_inserted += len(batch)
        print(f"  Inserted {total_inserted}/{len(rows)} rows ...")

    return total_inserted


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not os.path.exists(CSV_PATH):
        print(f"CSV not found at: {CSV_PATH}")
        print("Place data.csv in the scripts/ folder and try again.")
        sys.exit(1)

    print("Connecting to database ...")
    try:
        conn = psycopg2.connect(DB_DSN)
    except Exception as e:
        print(f"Database connection failed: {e}")
        sys.exit(1)

    print(f"Reading {CSV_PATH} ...")

    records = []
    skipped = 0
    total_read = 0
    skip_reasons = {
        "category_no_match": 0,
        "no_coordinates":    0,
        "outside_sf":        0,
        "no_case_id":        0,
    }

    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_read += 1
            parsed = parse_row(row, skip_reasons)
            if parsed:
                records.append(parsed)
            else:
                skipped += 1

            if total_read % 50000 == 0:
                print(f"  Read {total_read:,} rows, {len(records):,} valid so far ...")

    print(f"\nDone reading.")
    print(f"  Total rows:  {total_read:,}")
    print(f"  Valid:       {len(records):,}")
    print(f"  Skipped:     {skipped:,}")
    print(f"  Skip reasons:")
    for reason, count in skip_reasons.items():
        print(f"    {reason}: {count:,}")

    print("Inserting into database ...")
    inserted = insert_cases(conn, records)
    print(f"\nDone. Total inserted/updated: {inserted:,}")

    conn.close()


if __name__ == "__main__":
    main()