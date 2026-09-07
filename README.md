# Geospatial Fire & Industrial Anomaly Risk Engine

A high-performance, end-to-end Python pipeline and React dashboard for monitoring, classifying, and assessing risks of thermal anomalies across the Indian subcontinent. The system ingests NASA FIRMS data, maps it against industrial OpenStreetMap facilities, determines land-cover context using Esri satellite rasters, and outputs to a blazing fast interactive tactical map.

---

## 🏗️ System Architecture

1. **Backend Data Pipeline (Python)**
   - Correlates NASA FIRMS fire detections with known industrial facilities.
   - Calculates a custom multi-factor risk score (considering FRP, proximity, fire frequency, and confidence).
   - Enriches geospatial points with Land Use/Land Cover (LULC) percentages (Crops, Trees, Urban, etc.).
   
2. **Frontend UI (React + Vite + Leaflet)**
   - Generates a static data bridge via a python exporter script.
   - Uses `react-leaflet` with `react-leaflet-cluster` to dynamically render thousands of glowing tactical markers on dark Carto/Esri basemaps.
   - Features a Human-in-the-Loop (HITL) review dashboard.

---

## ⚠️ Important: Missing Data Files
Because of GitHub's file size limits, the massive satellite and geographic data files were excluded from this repository via `.gitignore`. 

If you clone this repository on a fresh machine, **you must place the following files in the root folder (`/osm`) before running the pipeline:**

1. **FIRMS Thermal Data (`.parquet`)**
   - Download the 2026 Historical Archive (`fire_archive_SV-C2_...parquet`)
   - Download the 2026 Near Real-Time (`fire_nrt_SV-C2_...parquet`)
   - Place them directly in the root directory.

2. **Esri LULC Satellite Rasters (`.tif`)**
   - Create a folder called `all tif files/` in the root directory.
   - Place your 10m resolution `.tif` rasters inside this folder (e.g., `esri_lulc_india_2025-...tif`).

3. **OpenStreetMap Geography Data (`.pbf`)** *(Optional for core pipeline)*
   - Place your `south-zone.osm.pbf` (or equivalent zone file) in the root directory if you intend to run raw OSM postGIS extractions.

---

## 🚀 How to Run the System

You will need **two terminal windows**.

### 1. Run the Python Data Pipeline
Open a terminal in the root folder and run the scripts in exact order:

```bash
# 1. Match fires to facilities based on geospatial proximity
python run_firms_enrichment_southern.py

# 2. Calculate composite threat scores for all affected facilities
python run_risk_scoring_southern.py

# 3. Analyze surrounding Land Cover (Crops/Trees/Urban) using TIF files
python run_lulc_enrichment_southern.py

# 4. Generate the JSON data files for the backend server
cd frontend
python server/export_json.py

# 5. Generate the Typescript data bridge for the UI (for offline fallback)
python generate_frontend_data.py
```

### 2. Run the Express API Backend
Open a **second terminal** inside the `frontend` folder. This serves all fire and facility data via a fast REST API with pagination and filtering:

```bash
cd frontend

# Install dependencies
npm install

# Start the Express data server (runs on port 3001)
npm run server
```

### 3. Run the React Tactical Dashboard
Open a **third terminal** inside the `frontend` folder:

```bash
cd frontend

# Start the Vite dev server (runs on port 3000)
npm run dev
```

Finally, open your browser to **http://localhost:3000** to access the interactive tactical map and review queue!

> **Why two servers?**
> The **Express server (port 3001)** serves data with pagination — the frontend fetches only what it needs per page instead of loading all 5,600+ fires at once. This is what makes navigation smooth and instant.
