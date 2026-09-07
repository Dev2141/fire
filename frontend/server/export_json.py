import pandas as pd
import json
import os
import math

BASE = r'C:\Users\padha\Desktop\osm\pipeline_results_southern'
OUT = r'C:\Users\padha\Desktop\osm\frontend\server\data'
os.makedirs(OUT, exist_ok=True)

def cf(v):
    try:
        f = float(v)
        return 0.0 if math.isnan(f) else round(f, 4)
    except:
        return 0.0

def cs(v):
    if pd.isna(v):
        return ''
    return str(v)

print("Loading CSVs...")
lulc = pd.read_csv(os.path.join(BASE, 'firms_southern_lulc_enriched.csv'), low_memory=False)
cls_df = pd.read_csv(os.path.join(BASE, 'firms_southern_classified.csv'), low_memory=False)
lulc['classification'] = cls_df['classification']

lulc['tier_rank'] = lulc['classification'].map({
    'industrial_confirmed': 1,
    'industrial_probable': 2,
    'industrial_possible': 3,
    'non_industrial': 4
})

ind = lulc[lulc['tier_rank'] <= 2]
ind_pos = lulc[lulc['tier_rank'] == 3].sort_values('frp', ascending=False).head(500)
non_ind = lulc[lulc['tier_rank'] == 4].sort_values('frp', ascending=False).head(2000)
fires = pd.concat([ind, ind_pos, non_ind]).reset_index(drop=True)

out = []
for i, row in fires.iterrows():
    lat = cf(row['latitude'])
    lng = cf(row['longitude'])
    frp = cf(row['frp'])
    cls_v = cs(row['classification'])
    conf = row.get('confidence', '')
    conf_str = str(conf).lower()
    if conf_str in ['high', 'h', 'n']:
        conf_v = 95.0
    elif conf_str == 'l':
        conf_v = 45.0
    elif conf_str == 'm':
        conf_v = 75.0
    else:
        conf_v = cf(conf)

    if 'confirmed' in cls_v:
        risk = 'CRITICAL'
    elif 'probable' in cls_v:
        risk = 'HIGH'
    elif 'possible' in cls_v:
        risk = 'MEDIUM'
    else:
        risk = 'LOW'

    fac_name = cs(row.get('nearest_facility_name', ''))
    out.append({
        'id': f'EP-2026-{i:05d}',
        'title': f'Anomaly near {fac_name}' if fac_name else 'Non-Industrial Fire',
        'lat': lat,
        'lng': lng,
        'frp': frp,
        'classification': cls_v,
        'risk': risk,
        'confidence': conf_v,
        'acq_date': cs(row.get('acq_date', '')),
        'satellite': cs(row.get('satellite', 'VIIRS')),
        'state': cs(row.get('nearest_facility_state', '')),
        'dist_km': round(cf(row.get('nearest_facility_dist_km', 0)), 2),
        'lulc_dominant': cs(row.get('lulc_dominant_class', '')),
        'lulc_crops': cf(row.get('lulc_crops_pct', 0)),
        'lulc_trees': cf(row.get('lulc_trees_pct', 0)),
        'lulc_urban': cf(row.get('lulc_urban_pct', 0)),
        'lulc_rangeland': cf(row.get('lulc_rangeland_pct', 0)),
        'category': 'wildfire' if 'non' in cls_v else 'refinery',
    })

with open(os.path.join(OUT, 'fires.json'), 'w') as f:
    json.dump(out, f)
print(f'fires.json: {len(out)} records')

# Facilities
fac_df = pd.read_csv(os.path.join(BASE, 'facilities_southern_risk_scored.csv'))
facs = []
for i, row in fac_df.iterrows():
    lat = cf(row['latitude'])
    lng = cf(row['longitude'])
    score = cf(row.get('risk_score', 0))
    status = 'EXCEEDANCE' if score > 60 else 'PERSISTENT' if score > 30 else 'NOMINAL'
    facs.append({
        'id': cs(row.get('canonical_facility_id', f'FAC-{i}')),
        'name': cs(row.get('facility_name', '')),
        'type': cs(row.get('facility_type', '')),
        'state': cs(row.get('state', '')),
        'district': cs(row.get('district', '')),
        'lat': lat,
        'lng': lng,
        'risk_score': round(score, 1),
        'fire_count': int(cf(row.get('fire_count_30d', 0))),
        'avg_frp': cf(row.get('avg_frp_mw', 0)),
        'status': status,
    })

with open(os.path.join(OUT, 'facilities.json'), 'w') as f:
    json.dump(facs, f)
print(f'facilities.json: {len(facs)} records')
print('Done!')
