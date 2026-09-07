"""
LULC Enrichment Script — Southern Zone
Samples ESRI LULC 2025 land cover within a 500m buffer around each FIRMS fire detection.
Adds land cover % columns to the existing enriched fire CSV.

ESRI LULC Class Codes:
  1  = Water
  2  = Trees / Vegetation
  4  = Flooded Vegetation
  5  = Crops / Farmland
  7  = Built-up / Urban
  8  = Bare Ground
  9  = Snow/Ice
  10 = Clouds
  11 = Rangeland / Scrub
"""

import pandas as pd
import numpy as np
import rasterio
from rasterio.transform import rowcol
import os
from pathlib import Path

# --- Configuration ---
ZONE = "southern"
BASE_DIR = r"C:\Users\padha\Desktop\osm"
LULC_DIR = r"C:\Users\padha\Desktop\osm\all tif files\esri_lulc_exports"
ENRICHED_CSV = os.path.join(BASE_DIR, "pipeline_results_southern", f"firms_{ZONE}_enriched.csv")
OUT_CSV = os.path.join(BASE_DIR, "pipeline_results_southern", f"firms_{ZONE}_lulc_enriched.csv")

# Southern zone bounding box
BBOX = {"min_lat": 8.0, "max_lat": 19.5, "min_lon": 73.5, "max_lon": 84.5}

# 500m buffer in degrees (~0.0045 degrees at India's latitude)
BUFFER_DEG = 0.0045

# ESRI LULC class mapping
LULC_CLASSES = {
    1:  "water",
    2:  "trees",
    4:  "flooded_veg",
    5:  "crops",
    7:  "urban",
    8:  "bare",
    9:  "snow",
    10: "clouds",
    11: "rangeland",
}

def load_relevant_tiles(lulc_dir, bbox):
    """Load only the TIF tiles that overlap the given bounding box."""
    tiles = []
    for tif_path in Path(lulc_dir).glob("*.tif"):
        try:
            with rasterio.open(tif_path) as src:
                b = src.bounds
                # Check overlap with bounding box
                if (b.left < bbox["max_lon"] and b.right > bbox["min_lon"] and
                    b.bottom < bbox["max_lat"] and b.top > bbox["min_lat"]):
                    tiles.append(str(tif_path))
        except Exception:
            pass
    print(f"Found {len(tiles)} tiles overlapping southern zone:")
    for t in tiles:
        print(f"  {Path(t).name}")
    return tiles

def sample_lulc_buffer(lat, lon, tile_sources, buffer_deg=BUFFER_DEG):
    """
    Sample all LULC pixels within a buffer_deg box around (lat, lon).
    Returns a dict of {class_name: percentage}.
    """
    min_lon = lon - buffer_deg
    max_lon = lon + buffer_deg
    min_lat = lat - buffer_deg
    max_lat = lat + buffer_deg

    all_pixels = []

    for src in tile_sources:
        b = src.bounds
        # Quick tile overlap check
        if (b.left > max_lon or b.right < min_lon or
            b.bottom > max_lat or b.top < min_lat):
            continue

        try:
            # Get pixel window for the buffer box
            row_min, col_min = rowcol(src.transform, min_lon, max_lat)
            row_max, col_max = rowcol(src.transform, max_lon, min_lat)

            # Clamp to valid raster extent
            row_min = max(0, row_min)
            col_min = max(0, col_min)
            row_max = min(src.height - 1, row_max)
            col_max = min(src.width - 1, col_max)

            if row_max <= row_min or col_max <= col_min:
                continue

            window = rasterio.windows.Window(
                col_min, row_min,
                col_max - col_min,
                row_max - row_min
            )
            data = src.read(1, window=window).flatten()
            all_pixels.extend(data.tolist())
        except Exception:
            continue

    if not all_pixels:
        return {}

    total = len(all_pixels)
    result = {}
    for code, name in LULC_CLASSES.items():
        count = all_pixels.count(code)
        result[f"lulc_{name}_pct"] = round(count / total * 100, 1)

    # Dominant class
    unique, counts = np.unique(all_pixels, return_counts=True)
    dominant_code = int(unique[np.argmax(counts)])
    result["lulc_dominant_class"] = LULC_CLASSES.get(dominant_code, f"unknown_{dominant_code}")

    return result

def main():
    print("Loading enriched fire detections...")
    fires_df = pd.read_csv(ENRICHED_CSV)
    print(f"Loaded {len(fires_df)} fire detections")

    print("\nLoading relevant LULC tiles...")
    tile_paths = load_relevant_tiles(LULC_DIR, BBOX)
    if not tile_paths:
        print("ERROR: No tiles found! Check LULC_DIR path.")
        return

    # Open all tile file handles once (much faster than opening per fire)
    print("\nOpening tile file handles...")
    tile_sources = [rasterio.open(t) for t in tile_paths]

    # Sample LULC for each fire
    print(f"\nSampling LULC for {len(fires_df)} fire detections (500m buffer)...")
    lulc_records = []

    for i, row in fires_df.iterrows():
        if i % 200 == 0:
            print(f"  Processing {i}/{len(fires_df)}...")
        result = sample_lulc_buffer(row['latitude'], row['longitude'], tile_sources)
        lulc_records.append(result)

    # Close tile handles
    for src in tile_sources:
        src.close()

    # Merge LULC columns into fires dataframe
    lulc_df = pd.DataFrame(lulc_records)
    result_df = pd.concat([fires_df.reset_index(drop=True), lulc_df.reset_index(drop=True)], axis=1)

    # Fill NaN (fires outside all tiles — shouldn't happen for southern zone)
    lulc_cols = [c for c in lulc_df.columns if c.startswith("lulc_")]
    for col in lulc_cols:
        if col != "lulc_dominant_class":
            result_df[col] = result_df[col].fillna(0.0)
        else:
            result_df[col] = result_df[col].fillna("unknown")

    result_df.to_csv(OUT_CSV, index=False)
    print(f"\n[OK] Saved LULC-enriched data to {OUT_CSV}")

    # Quick stats
    print("\nLULC Summary for all fire detections:")
    cls_col = 'classification_adjusted' if 'classification_adjusted' in result_df.columns else 'classification'
    if cls_col in result_df.columns:
        industrial = result_df[result_df[cls_col].str.startswith('industrial', na=False)]
    else:
        industrial = result_df  # fallback: use all rows

    if len(industrial) > 0 and 'lulc_urban_pct' in industrial.columns:
        print(f"  Industrial fires analyzed : {len(industrial)}")
        print(f"  Avg percent urban         : {industrial['lulc_urban_pct'].mean():.1f}%")
        print(f"  Avg percent crops         : {industrial['lulc_crops_pct'].mean():.1f}%")
        print(f"  Avg percent trees         : {industrial['lulc_trees_pct'].mean():.1f}%")
        print(f"  Avg percent bare ground   : {industrial['lulc_bare_pct'].mean():.1f}%")
        print(f"  Avg percent rangeland     : {industrial['lulc_rangeland_pct'].mean():.1f}%")
        print("\nDominant LULC class distribution:")
        print(industrial['lulc_dominant_class'].value_counts().to_string())
    else:
        print("  No industrial fires or LULC columns missing — check output CSV.")

if __name__ == "__main__":
    main()
