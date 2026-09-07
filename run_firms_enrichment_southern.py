"""
FIRMS Detection Enrichment + Classification — Southern Zone
FIX v2: Facility-type-specific classification radii
FIX v3: Uses both SNPP parquet files (archive + NRT) for full 2026 coverage
"""

import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import numpy as np
import os

# --- Configuration ---
ZONE = "southern"
BASE_DIR = r"C:\Users\padha\Desktop\osm"
FACILITIES_CSV = os.path.join(BASE_DIR, "pipeline_results_southern", f"industrial_facilities_osm_enriched_{ZONE}.csv")

# FIX v3: Use both parquet files (Jan-Apr archive + Apr-Sep NRT) = full 2026 coverage
FIRMS_ARCHIVE  = os.path.join(BASE_DIR, r"fire_archive_SV-C2_799383_cleaned(1).parquet")
FIRMS_NRT      = os.path.join(BASE_DIR, r"fire_nrt_SV-C2_799383_cleaned(1).parquet")

OUT_DIR        = os.path.join(BASE_DIR, "pipeline_results_southern")
OUT_ENRICHED   = os.path.join(OUT_DIR, f"firms_{ZONE}_enriched.csv")
OUT_CLASSIFIED = os.path.join(OUT_DIR, f"firms_{ZONE}_classified.csv")

# Southern India Bounding Box
BBOX = {"min_lat": 8.0, "max_lat": 19.5, "min_lon": 73.5, "max_lon": 84.5}

# FIX 1: Facility-type-specific classification radii (meters)
# confirmed_m = distance where fire is considered definitely industrial
# probable_m  = distance where fire is considered probably industrial
# possible_m  = distance where fire is considered possibly industrial
FACILITY_RADII = {
    "refinery":             {"confirmed_m": 2000, "probable_m": 5000,  "possible_m": 10000},
    "petrochemical_complex":{"confirmed_m": 2500, "probable_m": 6000,  "possible_m": 10000},
    "lng_terminal":         {"confirmed_m": 1500, "probable_m": 4000,  "possible_m": 10000},
    "gas_processing_plant": {"confirmed_m": 1500, "probable_m": 4000,  "possible_m": 10000},
    "thermal_power_plant":  {"confirmed_m": 1000, "probable_m": 3000,  "possible_m": 10000},
    "steel_plant":          {"confirmed_m": 1500, "probable_m": 4000,  "possible_m": 10000},
    "oil_terminal":         {"confirmed_m": 1500, "probable_m": 4000,  "possible_m": 10000},
    "storage_terminal":     {"confirmed_m": 1500, "probable_m": 4000,  "possible_m": 10000},
    "mine":                 {"confirmed_m": 2000, "probable_m": 5000,  "possible_m": 10000},
    "oil_field":            {"confirmed_m": 2000, "probable_m": 5000,  "possible_m": 10000},
    # Default for any unrecognized type
    "_default":             {"confirmed_m": 2000, "probable_m": 5000,  "possible_m": 10000},
}

# High-risk types for 25km proximity match
HIGH_RISK_TYPES = ["refinery", "lng_terminal", "thermal_power_plant", "petrochemical_complex", "gas_processing_plant"]


def calculate_bearing(fire_lon, fire_lat, fac_lon, fac_lat):
    lat1, lon1 = np.radians(fac_lat), np.radians(fac_lon)
    lat2, lon2 = np.radians(fire_lat), np.radians(fire_lon)
    dLon = lon2 - lon1
    x = np.sin(dLon) * np.cos(lat2)
    y = np.cos(lat1) * np.sin(lat2) - np.sin(lat1) * np.cos(lat2) * np.cos(dLon)
    bearing = (np.degrees(np.arctan2(x, y)) + 360) % 360
    dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return dirs[round(bearing / 45) % 8]


def classify_fire(dist_m, facility_type, verification_status, frp, brightness, confidence):
    """FIX: Use facility-type-specific radii instead of generic 2/5/10km."""
    radii = FACILITY_RADII.get(str(facility_type).strip(), FACILITY_RADII["_default"])
    confirmed_m = radii["confirmed_m"]
    probable_m  = radii["probable_m"]
    possible_m  = radii["possible_m"]

    status = str(verification_status).strip().lower()

    if pd.isna(dist_m):
        base_class = "non_industrial"
    elif dist_m <= confirmed_m and status == "verified":
        base_class = "industrial_confirmed"
    elif dist_m <= probable_m and status in ["verified", "probable"]:
        base_class = "industrial_probable"
    elif dist_m <= possible_m:
        base_class = "industrial_possible"
    else:
        base_class = "non_industrial"

    if base_class == "non_industrial":
        return base_class

    # FRP/Brightness confidence adjustment
    frp  = float(frp or 0)
    bri  = float(brightness or 0)
    conf = str(confidence or "").lower()

    tier_order = ["industrial_confirmed", "industrial_probable", "industrial_possible", "non_industrial"]
    idx = tier_order.index(base_class)

    if frp > 50 and bri > 400 and conf in ["high", "n"]:
        idx = max(0, idx - 1)   # upgrade one tier
    elif frp < 10 and bri < 330 and conf == "l":
        idx = min(len(tier_order) - 1, idx + 1)  # downgrade one tier

    return tier_order[idx]


def main():
    if not os.path.exists(FIRMS_ARCHIVE) and not os.path.exists(FIRMS_NRT):
        print("ERROR: No parquet files found. Check FIRMS_ARCHIVE and FIRMS_NRT paths.")
        return

    # ── Load data ────────────────────────────────────────────────────────────────
    print("Loading facilities...")
    fac_df = pd.read_csv(FACILITIES_CSV, skipinitialspace=True)
    fac_df["latitude"]  = pd.to_numeric(fac_df["latitude"],  errors="coerce")
    fac_df["longitude"] = pd.to_numeric(fac_df["longitude"], errors="coerce")
    fac_df = fac_df.dropna(subset=["latitude", "longitude"])
    fac_df["geometry"] = [Point(xy) for xy in zip(fac_df.longitude, fac_df.latitude)]
    fac_gdf = gpd.GeoDataFrame(fac_df, geometry="geometry", crs="EPSG:4326")

    print("Loading FIRMS data from parquet files (archive + NRT)...")
    frames = []
    for fpath in [FIRMS_ARCHIVE, FIRMS_NRT]:
        if not os.path.exists(fpath):
            print(f"  WARNING: {fpath} not found, skipping.")
            continue
        df = pd.read_parquet(fpath)
        # Normalize column names to lowercase
        df.columns = [c.lower() for c in df.columns]
        # Rename 'brightness' → 'bright_ti4' to match classification logic
        if "brightness" in df.columns and "bright_ti4" not in df.columns:
            df = df.rename(columns={"brightness": "bright_ti4"})
        frames.append(df)
        print(f"  Loaded {len(df):,} rows from {fpath.split(chr(92))[-1]}")

    if not frames:
        print("ERROR: No parquet files found. Check file paths.")
        return

    firms_df = pd.concat(frames, ignore_index=True)

    # Clip to southern zone bbox
    firms_df = firms_df[
        (firms_df["latitude"]  >= BBOX["min_lat"]) & (firms_df["latitude"]  <= BBOX["max_lat"]) &
        (firms_df["longitude"] >= BBOX["min_lon"]) & (firms_df["longitude"] <= BBOX["max_lon"])
    ].copy()

    print(f"Loaded {len(fac_gdf)} facilities | {len(firms_df):,} fire detections (southern zone, Jan–Sep 2026)")


    if len(firms_df) == 0:
        print("ERROR: No fire detections in bounding box. Check FIRMS CSV.")
        return

    firms_df["geometry"] = [Point(xy) for xy in zip(firms_df.longitude, firms_df.latitude)]
    firms_gdf = gpd.GeoDataFrame(firms_df, geometry="geometry", crs="EPSG:4326")

    # ── Reproject to India LCC for accurate meter distances ──────────────────────
    print("Reprojecting to EPSG:7755 (India LCC)...")
    fac_proj   = fac_gdf.to_crs(epsg=7755)
    firms_proj = firms_gdf.to_crs(epsg=7755)

    # ── 10km General Facility Match ──────────────────────────────────────────────
    print("10km general facility match...")
    fac_cols = ["canonical_facility_id", "facility_name", "facility_type",
                "facility_subtype", "operator", "state", "verification_status",
                "source_manual", "source_wri", "source_osm", "geometry"]
    fac_for_join = fac_proj[fac_cols].copy()
    fac_for_join.columns = ["nearest_facility_id", "nearest_facility_name", "nearest_facility_type",
                             "nearest_facility_subtype", "nearest_facility_operator", "nearest_facility_state",
                             "nearest_facility_verification", "nearest_source_manual", "nearest_source_wri",
                             "nearest_source_osm", "geometry"]

    enriched = gpd.sjoin_nearest(
        firms_proj, fac_for_join,
        how="left", max_distance=10000, distance_col="nearest_facility_dist_m"
    )
    enriched = enriched[~enriched.index.duplicated(keep="first")]

    # ── 25km High-Risk Match ─────────────────────────────────────────────────────
    print("25km high-risk facility match...")
    fac_hr = fac_proj[fac_proj["facility_type"].isin(HIGH_RISK_TYPES)][
        ["canonical_facility_id", "facility_name", "facility_type", "geometry"]
    ].copy()
    fac_hr.columns = ["nearest_highrisk_id", "nearest_highrisk_name", "nearest_highrisk_type", "geometry"]

    hr_match = gpd.sjoin_nearest(
        firms_proj, fac_hr,
        how="left", max_distance=25000, distance_col="nearest_highrisk_dist_m"
    )
    hr_match = hr_match[~hr_match.index.duplicated(keep="first")]

    # ── Merge high-risk columns in ───────────────────────────────────────────────
    enriched = enriched.join(
        hr_match[["nearest_highrisk_id", "nearest_highrisk_name",
                   "nearest_highrisk_type", "nearest_highrisk_dist_m"]]
    )

    # Convert distances to km
    enriched["nearest_facility_dist_km"] = (enriched["nearest_facility_dist_m"] / 1000.0).round(3)
    enriched["nearest_highrisk_dist_km"] = (enriched["nearest_highrisk_dist_m"] / 1000.0).round(3)

    # Compute bearings
    print("Computing bearings...")
    fac_lookup = fac_df.set_index("canonical_facility_id")[["latitude", "longitude"]]
    def get_bearing(row):
        fid = row.get("nearest_facility_id")
        if pd.isna(fid): return None
        try:
            f = fac_lookup.loc[fid]
            return calculate_bearing(row["longitude"], row["latitude"], f["longitude"], f["latitude"])
        except Exception:
            return None
    enriched["nearest_facility_bearing"] = enriched.apply(get_bearing, axis=1)

    # ── Back to WGS84, drop temp cols ────────────────────────────────────────────
    enriched = enriched.to_crs(epsg=4326)
    drop_cols = ["geometry", "index_right", "nearest_facility_dist_m", "nearest_highrisk_dist_m"]
    enriched_df = enriched.drop(columns=[c for c in drop_cols if c in enriched.columns])

    enriched_df.to_csv(OUT_ENRICHED, index=False)
    print(f"[OK] Saved enriched: {OUT_ENRICHED}  ({len(enriched_df)} rows)")

    # ── FIX 1: Facility-type-specific Classification ─────────────────────────────
    print("Classifying fires with facility-type-specific radii...")
    enriched_df["classification"] = enriched_df.apply(lambda r: classify_fire(
        dist_m              = r["nearest_facility_dist_m"] if "nearest_facility_dist_m" in r else r["nearest_facility_dist_km"] * 1000,
        facility_type       = r.get("nearest_facility_type"),
        verification_status = r.get("nearest_facility_verification"),
        frp                 = r.get("frp", 0),
        brightness          = r.get("bright_ti4", 0),
        confidence          = r.get("confidence", ""),
    ), axis=1)

    # Re-read dist_km properly since we may have dropped dist_m
    enriched_df2 = pd.read_csv(OUT_ENRICHED)
    enriched_df2["classification"] = enriched_df2.apply(lambda r: classify_fire(
        dist_m              = r["nearest_facility_dist_km"] * 1000,
        facility_type       = r.get("nearest_facility_type"),
        verification_status = r.get("nearest_facility_verification"),
        frp                 = r.get("frp", 0),
        brightness          = r.get("bright_ti4", 0),
        confidence          = r.get("confidence", ""),
    ), axis=1)

    enriched_df2.to_csv(OUT_CLASSIFIED, index=False)
    print(f"[OK] Saved classified: {OUT_CLASSIFIED}  ({len(enriched_df2)} rows)")

    print("\nClassification summary:")
    print(enriched_df2["classification"].value_counts().to_string())
    print()
    print("Radii used per facility type:")
    for ftype, r in FACILITY_RADII.items():
        if ftype != "_default":
            print(f"  {ftype:30s}: confirmed={r['confirmed_m']}m, probable={r['probable_m']}m")


if __name__ == "__main__":
    main()
