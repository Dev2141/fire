"""
Risk Scoring — Southern Zone
FIX v2: Added source agreement component (manual + WRI + OSM) to risk formula
FIX v2: Weights rebalanced to accommodate new source_agreement component
"""

import pandas as pd
import json
import os

# --- Configuration ---
ZONE = "southern"
BASE_DIR = r"C:\Users\padha\Desktop\osm"
FACILITIES_CSV = os.path.join(BASE_DIR, "pipeline_results_southern", f"industrial_facilities_osm_enriched_{ZONE}.csv")
CLASSIFIED_CSV = os.path.join(BASE_DIR, "pipeline_results_southern", f"firms_{ZONE}_classified.csv")
OUT_SCORED    = os.path.join(BASE_DIR, "pipeline_results_southern", f"facilities_{ZONE}_risk_scored.csv")
OUT_DASHBOARD = os.path.join(BASE_DIR, "pipeline_results_southern", f"{ZONE}_dashboard_summary.json")

# Facility type base risk weights
TYPE_WEIGHTS = {
    "refinery":             1.00,
    "petrochemical_complex":0.95,
    "lng_terminal":         0.90,
    "gas_processing_plant": 0.85,
    "oil_terminal":         0.80,
    "thermal_power_plant":  0.70,
    "steel_plant":          0.65,
    "storage_terminal":     0.60,
    "mine":                 0.50,
    "oil_field":            0.45,
}

def get_risk_level(score):
    if score >= 80: return "Critical"
    if score >= 60: return "High"
    if score >= 40: return "Moderate"
    if score >= 20: return "Low"
    return "Minimal"


def calculate_source_agreement(row):
    """
    FIX: Source agreement component.
    source_manual = gold standard (field verified / government data)
    source_wri    = WRI Global Power Plant DB (authoritative)
    source_osm    = OpenStreetMap match (community verified)
    """
    score = 0
    # Parse boolean-like columns (may be stored as string "True"/"False")
    def is_true(val):
        return str(val).strip().lower() in ["true", "1", "yes"]

    if is_true(row.get("source_manual", False)):
        score += 40
    if is_true(row.get("source_wri", False)):
        score += 40
    if is_true(row.get("source_osm", False)):
        score += 20
    return min(score, 100)  # cap at 100


def calculate_score(row):
    """
    Composite risk score formula (0-100):
    FIX v2 weights (must sum to 1.0):
      fire_count    0.23
      frp           0.18
      brightness    0.13
      proximity     0.18
      confidence    0.09
      facility_type 0.09
      source_agree  0.10  ← NEW
    """
    # 1. Fire count score (max at 50 fires → score 100)
    f_score = min((row["fire_count_30d"] / 50.0) * 100, 100)

    # 2. FRP score (max at 100 MW → score 100)
    frp_score = min((row["avg_frp_mw"] / 100.0) * 100, 100)

    # 3. Peak Brightness score (290K baseline, 400K+ = full score)
    b_val = row["max_brightness_k"]
    b_score = min(max((b_val - 290) / 110.0 * 100, 0), 100) if b_val > 0 else 0

    # 4. Proximity score (0km = 100, 10km = 0, no fires = 0)
    dist = row["avg_dist_km"]
    p_score = max((10.0 - dist) / 10.0 * 100, 0) if row["fire_count_30d"] > 0 else 0

    # 5. Confidence score
    c_score = row["high_confidence_pct"]

    # 6. Facility type weight
    t_weight = TYPE_WEIGHTS.get(str(row["facility_type"]).strip(), 0.5)

    # 7. FIX: Source agreement (0-100)
    s_score = calculate_source_agreement(row)

    # Weighted composite
    composite = (
        f_score   * 0.23 +
        frp_score * 0.18 +
        b_score   * 0.13 +
        p_score   * 0.18 +
        c_score   * 0.09 +
        t_weight  * 100 * 0.09 +
        s_score   * 0.10   # NEW component
    )
    return round(composite, 1)


def main():
    if not os.path.exists(CLASSIFIED_CSV):
        print(f"ERROR: {CLASSIFIED_CSV} not found. Run run_firms_enrichment_southern.py first.")
        return

    fac_df   = pd.read_csv(FACILITIES_CSV, skipinitialspace=True)
    fires_df = pd.read_csv(CLASSIFIED_CSV)

    print(f"Scoring {len(fac_df)} facilities based on {len(fires_df)} fire detections...")

    # Only industrial fires count toward risk
    ind_fires = fires_df[fires_df["classification"].str.startswith("industrial", na=False)].copy()
    print(f"Industrial fires used for scoring: {len(ind_fires)}")

    # Aggregate per facility
    agg = ind_fires.groupby("nearest_facility_id").agg(
        fire_count_30d  =("latitude",                   "count"),
        avg_frp_mw      =("frp",                        "mean"),
        max_brightness_k=("bright_ti4",                 "max"),
        avg_dist_km     =("nearest_facility_dist_km",   "mean"),
    ).reset_index()
    agg["avg_frp_mw"]       = agg["avg_frp_mw"].round(2)
    agg["max_brightness_k"] = agg["max_brightness_k"].round(1)
    agg["avg_dist_km"]      = agg["avg_dist_km"].round(3)

    # High confidence %
    high_conf  = ind_fires[ind_fires["confidence"].astype(str).str.lower().isin(["high","n"])].groupby("nearest_facility_id").size()
    total_conf = ind_fires.groupby("nearest_facility_id").size()
    conf_pct   = (high_conf / total_conf * 100).fillna(0).rename("high_confidence_pct").reset_index()
    agg = pd.merge(agg, conf_pct, on="nearest_facility_id", how="left").fillna(0)

    # Merge into master facilities
    scored_df = pd.merge(fac_df, agg,
                         left_on="canonical_facility_id", right_on="nearest_facility_id", how="left")
    scored_df["fire_count_30d"]       = scored_df["fire_count_30d"].fillna(0)
    scored_df["avg_frp_mw"]           = scored_df["avg_frp_mw"].fillna(0)
    scored_df["max_brightness_k"]     = scored_df["max_brightness_k"].fillna(0)
    scored_df["avg_dist_km"]          = scored_df["avg_dist_km"].fillna(10.0)
    scored_df["high_confidence_pct"]  = scored_df["high_confidence_pct"].fillna(0)

    # FIX: Include source agreement in scoring
    scored_df["source_agreement_score"] = scored_df.apply(calculate_source_agreement, axis=1)

    print("Calculating risk scores (with source agreement component)...")
    scored_df["risk_score"] = scored_df.apply(calculate_score, axis=1)
    scored_df["risk_level"] = scored_df["risk_score"].apply(get_risk_level)
    scored_df = scored_df.sort_values("risk_score", ascending=False)

    scored_df.to_csv(OUT_SCORED, index=False)
    print(f"[OK] Saved: {OUT_SCORED}")

    # Dashboard JSON
    print("Generating dashboard JSON...")
    top20 = scored_df.head(20)[[
        "canonical_facility_id", "facility_name", "facility_type",
        "state", "risk_score", "risk_level", "fire_count_30d",
        "source_agreement_score"
    ]].to_dict(orient="records")

    dashboard = {
        "zone":                       "Southern",
        "total_facilities":           int(len(fac_df)),
        "facilities_with_fires":      int((scored_df["fire_count_30d"] > 0).sum()),
        "total_industrial_fires":     int(scored_df["fire_count_30d"].sum()),
        "top_risk_facilities":        top20,
        "fires_by_state":             ind_fires.groupby("nearest_facility_state").size().to_dict() if "nearest_facility_state" in ind_fires.columns else {},
        "fires_by_type":              ind_fires.groupby("nearest_facility_type").size().to_dict() if "nearest_facility_type" in ind_fires.columns else {},
        "risk_level_distribution":    scored_df["risk_level"].value_counts().to_dict(),
        "source_agreement_breakdown": {
            "3_sources_manual_wri_osm": int(scored_df["source_agreement_score"].eq(100).sum()),
            "2_sources_manual_wri":     int(scored_df["source_agreement_score"].eq(80).sum()),
            "manual_only":              int(scored_df["source_agreement_score"].eq(40).sum()),
        }
    }

    with open(OUT_DASHBOARD, "w") as f:
        json.dump(dashboard, f, indent=4)
    print(f"[OK] Saved: {OUT_DASHBOARD}")

    print("\n--- TOP 10 HIGHEST RISK ---")
    cols = ["facility_name", "state", "facility_type", "risk_score", "fire_count_30d", "source_agreement_score"]
    print(scored_df[cols].head(10).to_string(index=False))

    print("\n--- RISK DISTRIBUTION ---")
    print(scored_df["risk_level"].value_counts().to_string())


if __name__ == "__main__":
    main()
