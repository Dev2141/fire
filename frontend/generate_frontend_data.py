import pandas as pd
import json
import os
import math

# Paths
BASE_DIR = r"C:\Users\padha\Desktop\osm"
RESULTS_DIR = os.path.join(BASE_DIR, "pipeline_results_southern")
FACILITIES_CSV = os.path.join(RESULTS_DIR, "facilities_southern_risk_scored.csv")
FIRES_CSV = os.path.join(RESULTS_DIR, "firms_southern_lulc_enriched.csv")
OUT_TS = os.path.join(BASE_DIR, "frontend", "src", "data", "generatedData.ts")

def clean_float(v):
    if pd.isna(v):
        return 0.0
    if isinstance(v, str):
        try:
            return float(v)
        except ValueError:
            return 0.0
    if isinstance(v, (int, float)) and math.isnan(v):
        return 0.0
    return float(v)

def clean_str(v):
    if pd.isna(v):
        return ""
    return str(v)

def generate():
    print(f"Loading {FACILITIES_CSV}...")
    fac_df = pd.read_csv(FACILITIES_CSV)
    
    print(f"Loading {FIRES_CSV} (LULC data)...")
    lulc_df = pd.read_csv(FIRES_CSV, low_memory=False)
    
    CLASSIFIED_CSV = os.path.join(RESULTS_DIR, "firms_southern_classified.csv")
    print(f"Loading {CLASSIFIED_CSV} (Classification data)...")
    class_df = pd.read_csv(CLASSIFIED_CSV, low_memory=False)
    
    # Since they have the exact same rows in the exact same order, we can safely copy the classification column
    lulc_df['classification'] = class_df['classification']
    
    # Sort fires by FRP descending to get the most intense ones for the UI (top 100)
    # We prioritize confirmed/probable first
    lulc_df['tier_rank'] = lulc_df['classification'].map({
        'industrial_confirmed': 1,
        'industrial_probable': 2,
        'industrial_possible': 3,
        'non_industrial': 4
    })
    
    # Get ALL industrial confirmed and probable, plus top 500 possible
    ind_fires = lulc_df[lulc_df['tier_rank'] <= 2]
    ind_possible = lulc_df[lulc_df['tier_rank'] == 3].sort_values('frp', ascending=False).head(500)
    
    # Get top 2000 non-industrial (wildfires/crop) fires by FRP
    non_ind_fires = lulc_df[lulc_df['tier_rank'] == 4].sort_values('frp', ascending=False).head(2000)
    
    # Combine them (Total ~5000+ fires)
    top_fires = pd.concat([ind_fires, ind_possible, non_ind_fires])
    
    # Base TS output
    ts_out = [
        "import { ThermalEpisode, IndustrialFacility, AnalystUser } from '../types';",
        "",
        "export const CURRENT_ANALYST: AnalystUser = {",
        "  name: 'Capt. R. Vance',",
        "  callsign: 'VANCE-8492',",
        "  idNumber: '#8492',",
        "  email: 'capt.r.vance@ntro.gov.in',",
        "  role: 'Chief Geo-Int Analyst',",
        "  clearanceLevel: 'TOP SECRET // SI-TK // NTRO-PS',",
        "  isAuthenticated: true,",
        "};",
        "",
        "// Curated high quality imagery matching satellite / thermal / infrared views",
        "export const SATELLITE_IMAGES = {",
        "  wildfireAerial: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',",
        "  thermalIr: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=900&q=80',",
        "  refineryNight: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=900&q=80',",
        "  refineryFlareStack: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',",
        "  coalSmoldering: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80',",
        "  earthNight: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',",
        "  subcontinentalNight: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',",
        "};",
        ""
    ]
    
    # 1. Generate INITIAL_EPISODES
    episodes = []
    map_hotspots = []
    
    for idx, row in top_fires.iterrows():
        lat = clean_float(row['latitude'])
        lng = clean_float(row['longitude'])
        
        confidence_val = clean_float(row.get('confidence', 90.0))
        if isinstance(row.get('confidence'), str):
            c_str = row['confidence'].lower()
            if c_str == 'high' or c_str == 'h' or c_str == 'n': confidence_val = 95.0
            elif c_str == 'l': confidence_val = 45.0
            elif c_str == 'm': confidence_val = 75.0
            else: confidence_val = 80.0
            
        frp = clean_float(row['frp'])
        
        # Risk level mapping
        risk = "UNCERTAIN"
        urgency = "ROUTINE"
        cls = str(row['classification'])
        if "confirmed" in cls:
            risk = "CRITICAL"
            urgency = "TIER 1 - IMMEDIATE"
        elif "probable" in cls:
            risk = "HIGH"
            urgency = "TIER 2 - PRIORITY"
        elif "possible" in cls:
            risk = "MEDIUM"
            urgency = "TIER 3 - MONITOR"
        else:
            risk = "LOW"
            urgency = "ROUTINE"
            
        fac_name = clean_str(row.get('nearest_facility_name', 'Unknown Facility'))
        
        ep = {
            "id": f"EP-2026-{int(idx):05d}",
            "title": f"Anomaly near {fac_name}",
            "districtState": clean_str(row.get('nearest_facility_state', 'Southern Zone')),
            "coordinates": {
                "lat": lat,
                "lng": lng,
                "latStr": f"{lat:.4f}° N",
                "lngStr": f"{lng:.4f}° E"
            },
            "sensorPlatform": clean_str(row.get('satellite', 'VIIRS SNPP')),
            "firstDetectedUtc": f"{clean_str(row.get('acq_date', '2026-09-01'))} UTC",
            "timelineAge": "Active (Recent)",
            "relativeTime": "Recent",
            "radiantHeatMw": frp,
            "frpPeakMw": frp,
            "mlInference": cls.upper(),
            "confidence": confidence_val,
            "riskLevel": risk,
            "urgencyTier": urgency,
            "ppacProximityKm": round(clean_float(row.get('nearest_facility_dist_km', 0)), 2),
            "status": "AWAITING VERIFICATION",
            "topoData": {
                "frontAdvance": "N/A",
                "perimeter": f"Buffer Dist: {round(clean_float(row.get('nearest_facility_dist_km', 0)), 2)} km",
                "elevation": "Unknown",
                "landCoverMatrix": f"Dominant: {clean_str(row.get('lulc_dominant_class', 'Unknown'))}",
                "flameFrontWidth": "N/A",
                "imageUrl": "SATELLITE_IMAGES.wildfireAerial" if 'non' in cls else "SATELLITE_IMAGES.refineryNight"
            },
            "thermalData": {
                "temperatureRange": "SLSTR TIR",
                "contrast": f"+{clean_float(row.get('bright_ti4', 0))} K",
                "facilityBufferCheck": f"{round(clean_float(row.get('nearest_facility_dist_km', 0)), 2)} km",
                "imageUrl": "SATELLITE_IMAGES.thermalIr"
            },
            "lulcData": {
                "dominantClass": clean_str(row.get('lulc_dominant_class', 'Unknown')),
                "cropsPct": clean_float(row.get('lulc_crops_pct', 0)),
                "treesPct": clean_float(row.get('lulc_trees_pct', 0)),
                "urbanPct": clean_float(row.get('lulc_urban_pct', 0)),
                "rangelandPct": clean_float(row.get('lulc_rangeland_pct', 0)),
            }
        }
        episodes.append(ep)
        
        map_hotspots.append({
            "id": f"HS-{int(idx):04d}",
            "name": f"Anomaly near {fac_name}",
            "category": "wildfire" if "non" in cls else "refinery",
            "lat": lat,
            "lng": lng,
            "frpMw": frp,
            "risk": risk,
            "episodeId": f"EP-2026-{int(idx):05d}",
            "info": f"Proximity: {round(clean_float(row.get('nearest_facility_dist_km', 0)), 2)} km",
        })

    # Convert episodes dict to TS string (handling JS variables like SATELLITE_IMAGES)
    ep_json = json.dumps(episodes, indent=2)
    # Replace string quotes around SATELLITE_IMAGES references
    ep_json = ep_json.replace('"SATELLITE_IMAGES.wildfireAerial"', "SATELLITE_IMAGES.wildfireAerial")
    ep_json = ep_json.replace('"SATELLITE_IMAGES.refineryNight"', "SATELLITE_IMAGES.refineryNight")
    ep_json = ep_json.replace('"SATELLITE_IMAGES.thermalIr"', "SATELLITE_IMAGES.thermalIr")
    
    ts_out.append(f"export const INITIAL_EPISODES: ThermalEpisode[] = {ep_json};")
    ts_out.append("")
    
    # 2. Generate INITIAL_FACILITIES
    # Export ALL facilities (no limit) sorted by risk score
    top_facs = fac_df.sort_values('risk_score', ascending=False)
    facilities = []
    
    for idx, row in top_facs.iterrows():
        lat = clean_float(row['latitude'])
        lng = clean_float(row['longitude'])
        score = clean_float(row.get('risk_score', 0))
        fc = clean_float(row.get('fire_count_30d', 0))
        
        f_status = "NOMINAL"
        if score > 60: f_status = "EXCEEDANCE"
        elif score > 30: f_status = "PERSISTENT"
        
        cat = "Refineries"
        ftype = clean_str(row.get('facility_type', '')).lower()
        if "thermal" in ftype or "power" in ftype: cat = "Thermal"
        elif "steel" in ftype: cat = "Steel"
        elif "coal" in ftype or "mine" in ftype: cat = "Coal"
        elif "lng" in ftype: cat = "LNG"
        
        fac = {
            "id": clean_str(row.get('canonical_facility_id', f"FAC-{idx}")),
            "name": clean_str(row.get('facility_name', 'Unknown Facility')),
            "shortName": clean_str(row.get('facility_name', 'Unknown Facility'))[:30],
            "category": cat,
            "stateZone": clean_str(row.get('state', 'Unknown State')),
            "district": clean_str(row.get('district', 'Unknown')),
            "coordinates": {
                "lat": lat,
                "lng": lng,
                "latStr": f"{lat:.4f}° N",
                "lngStr": f"{lng:.4f}° E"
            },
            "bufferRadiusKm": 5.0,
            "status": f_status,
            "linkedEpisodesCount": int(fc),
            "baselineOperatingMw": 100,
            "peakFrp12mMw": clean_float(row.get('avg_frp_mw', 0)),
            "nominalFrpCapMw": 200,
            "registeredStacks": "Unknown",
            "bufferOverlaps": f"Risk Score: {score}",
            "satelliteFeed": {
                "orbitPass": "12:00 UTC",
                "fov": "5.0 KM²",
                "target": "MAIN COMPLEX",
                "coreTemp": "N/A",
                "sensor": "VIIRS SNPP",
                "calibration": "STANDARD",
                "imageUrl": "SATELLITE_IMAGES.refineryNight"
            },
            "cctvFeed": {
                "title": "GROUND TRUTH CAMERA",
                "exceedanceStatus": f_status,
                "flameVelocity": "N/A",
                "stackHeight": "N/A",
                "analytics": "Risk Engine Output",
                "plumeDispersion": "N/A",
                "imageUrl": "SATELLITE_IMAGES.refineryFlareStack"
            },
            "monthlyFRP": [],
            "recentDetections": []
        }
        facilities.append(fac)
        
    fac_json = json.dumps(facilities, indent=2)
    fac_json = fac_json.replace('"SATELLITE_IMAGES.refineryNight"', "SATELLITE_IMAGES.refineryNight")
    fac_json = fac_json.replace('"SATELLITE_IMAGES.refineryFlareStack"', "SATELLITE_IMAGES.refineryFlareStack")
    
    ts_out.append(f"export const INITIAL_FACILITIES: IndustrialFacility[] = {fac_json};")
    ts_out.append("")
    
    # 3. Generate MAP_HOTSPOTS
    hotspots_json = json.dumps(map_hotspots, indent=2)
    ts_out.append(f"export const MAP_HOTSPOTS = {hotspots_json};")
    ts_out.append("")
    
    with open(OUT_TS, "w", encoding="utf-8") as f:
        f.write("\n".join(ts_out))
        
    print(f"Successfully generated {OUT_TS}")
    print(f"Exported {len(episodes)} top fires and {len(facilities)} high-risk facilities.")

if __name__ == "__main__":
    generate()
