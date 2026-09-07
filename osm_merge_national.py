"""
osm_merge_national.py
=====================
Run this LOCALLY after all zone teams have submitted their output zip files.

Place all zone enriched files in the same folder as this script and run:
    python osm_merge_national.py

Expected input files (one per zone):
    industrial_facilities_osm_enriched_northern.csv
    industrial_facilities_osm_enriched_western.csv
    industrial_facilities_osm_enriched_central.csv
    industrial_facilities_osm_enriched_eastern.csv
    industrial_facilities_osm_enriched_southern.csv
    industrial_facilities_osm_enriched_northeastern.csv

    osm_facility_match_review_northern.csv
    ... (same pattern for all zones)
"""

import pandas as pd
import os

ZONES = ["northern", "western", "central", "eastern", "southern", "northeastern"]

EXPECTED_18_COLS = [
    "canonical_facility_id", "facility_name", "facility_type",
    "facility_subtype", "operator", "state", "district",
    "latitude", "longitude", "capacity_mw", "primary_fuel",
    "commissioning_year", "closure_year", "source_manual",
    "source_wri", "source_osm", "verification_status", "geometry_source",
]

INPUT_DIR  = "."   # change if files are in a subfolder
OUTPUT_DIR = "."

# ── Merge enriched operational files ─────────────────────────────────────────
print("Merging zone enriched files …")
enriched_frames = []
missing_zones = []

for zone in ZONES:
    path = os.path.join(INPUT_DIR, f"industrial_facilities_osm_enriched_{zone}.csv")
    if not os.path.exists(path):
        print(f"  [WARN] Missing: {path}")
        missing_zones.append(zone)
        continue
    df = pd.read_csv(path, dtype=str, skipinitialspace=True, engine="python")
    df.columns = df.columns.str.strip()
    enriched_frames.append(df)
    print(f"  {zone:15s}: {len(df)} rows")

if not enriched_frames:
    raise RuntimeError("No zone files found. Check INPUT_DIR path.")

enriched_national = pd.concat(enriched_frames, ignore_index=True)

# ── QA ────────────────────────────────────────────────────────────────────────
print(f"\nNational enriched total rows: {len(enriched_national)}")

# Check for duplicate canonical IDs
dupes = enriched_national["canonical_facility_id"].duplicated()
if dupes.any():
    print(f"  [WARN] Duplicate canonical_facility_ids: {dupes.sum()}")
    print(enriched_national[dupes][["canonical_facility_id","state"]].head(10))
else:
    print("  No duplicate canonical_facility_ids. OK")

# Schema check
for col in EXPECTED_18_COLS:
    if col not in enriched_national.columns:
        print(f"  [ERROR] Missing column: {col}")

# source_osm summary
print(f"\n  source_osm = True  : {(enriched_national['source_osm'].str.strip()=='True').sum()}")
print(f"  source_osm = False : {(enriched_national['source_osm'].str.strip()=='False').sum()}")
print(f"  mapped_polygon     : {(enriched_national['geometry_source'].str.strip()=='mapped_polygon').sum()}")

# Save
enriched_national.to_csv(
    os.path.join(OUTPUT_DIR, "industrial_facilities_osm_enriched_national.csv"),
    index=False
)
print("\nSaved: industrial_facilities_osm_enriched_national.csv")

# ── Merge review/audit files ──────────────────────────────────────────────────
print("\nMerging review/audit files …")
review_frames = []

for zone in ZONES:
    path = os.path.join(INPUT_DIR, f"osm_facility_match_review_{zone}.csv")
    if not os.path.exists(path):
        print(f"  [WARN] Missing: {path}")
        continue
    df = pd.read_csv(path, dtype=str, skipinitialspace=True, engine="python")
    df["zone"] = zone
    review_frames.append(df)
    print(f"  {zone:15s}: {len(df)} rows")

if review_frames:
    review_national = pd.concat(review_frames, ignore_index=True)
    review_national.to_csv(
        os.path.join(OUTPUT_DIR, "osm_facility_match_review_national.csv"),
        index=False
    )
    print(f"\nSaved: osm_facility_match_review_national.csv ({len(review_national)} rows)")

    print("\n── National match status summary ──────────────────────")
    print(review_national["osm_match_status"].value_counts(dropna=False))

# ── Merge confirmed matches ───────────────────────────────────────────────────
print("\nMerging confirmed match files …")
confirmed_frames = []

for zone in ZONES:
    path = os.path.join(INPUT_DIR, f"osm_facility_confirmed_matches_{zone}.csv")
    if not os.path.exists(path):
        continue
    df = pd.read_csv(path, dtype=str, skipinitialspace=True, engine="python")
    df["zone"] = zone
    confirmed_frames.append(df)

if confirmed_frames:
    confirmed_national = pd.concat(confirmed_frames, ignore_index=True)
    confirmed_national.to_csv(
        os.path.join(OUTPUT_DIR, "osm_facility_confirmed_matches_national.csv"),
        index=False
    )
    print(f"Saved: osm_facility_confirmed_matches_national.csv ({len(confirmed_national)} rows)")

print("\nDone. National merge complete.")
if missing_zones:
    print(f"[NOTE] These zones were missing: {missing_zones}")
