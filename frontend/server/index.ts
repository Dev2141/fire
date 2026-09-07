import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Load JSON data once at startup — keeps server fast
const firesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'fires.json'), 'utf-8'));
const facilitiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'facilities.json'), 'utf-8'));

console.log(`Loaded ${firesData.length} fires and ${facilitiesData.length} facilities`);

// --- FIRES API ---
// GET /api/fires?page=1&limit=50&category=wildfire&risk=CRITICAL&search=...
app.get('/api/fires', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const category = req.query.category as string;
  const risk = req.query.risk as string;
  const search = req.query.search as string;

  let filtered = firesData;

  if (category && category !== 'ALL') {
    filtered = filtered.filter((f: any) => f.category === category.toLowerCase());
  }
  if (risk && risk !== 'ALL') {
    filtered = filtered.filter((f: any) => f.risk === risk.toUpperCase());
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((f: any) =>
      f.title.toLowerCase().includes(s) ||
      f.state.toLowerCase().includes(s) ||
      f.classification.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  res.json({ total, page, limit, pages: Math.ceil(total / limit), items });
});

// GET /api/fires/map — lightweight markers for map (lat, lng, risk, category only)
app.get('/api/fires/map', (req, res) => {
  const category = req.query.category as string;
  let filtered = firesData;
  if (category && category !== 'ALL') {
    filtered = filtered.filter((f: any) => f.category === category.toLowerCase());
  }
  const markers = filtered.map((f: any) => ({
    id: f.id,
    lat: f.lat,
    lng: f.lng,
    risk: f.risk,
    category: f.category,
    frp: f.frp,
    title: f.title,
  }));
  res.json(markers);
});

// GET /api/fires/:id — single fire full detail
app.get('/api/fires/:id', (req, res) => {
  const fire = firesData.find((f: any) => f.id === req.params.id);
  if (!fire) return res.status(404).json({ error: 'Not found' });
  res.json(fire);
});

// --- FACILITIES API ---
// GET /api/facilities?page=1&limit=25&status=EXCEEDANCE&search=...
app.get('/api/facilities', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const status = req.query.status as string;
  const search = req.query.search as string;
  const sortBy = (req.query.sortBy as string) || 'risk_score';

  let filtered = facilitiesData;

  if (status && status !== 'ALL') {
    filtered = filtered.filter((f: any) => f.status === status.toUpperCase());
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((f: any) =>
      f.name.toLowerCase().includes(s) ||
      f.state.toLowerCase().includes(s) ||
      f.type.toLowerCase().includes(s)
    );
  }

  filtered = [...filtered].sort((a: any, b: any) => b[sortBy] - a[sortBy]);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  res.json({ total, page, limit, pages: Math.ceil(total / limit), items });
});

// GET /api/facilities/:id
app.get('/api/facilities/:id', (req, res) => {
  const fac = facilitiesData.find((f: any) => f.id === req.params.id);
  if (!fac) return res.status(404).json({ error: 'Not found' });
  res.json(fac);
});

// GET /api/stats — summary stats for dashboards
app.get('/api/stats', (_req, res) => {
  const critical = firesData.filter((f: any) => f.risk === 'CRITICAL').length;
  const high = firesData.filter((f: any) => f.risk === 'HIGH').length;
  const wildfires = firesData.filter((f: any) => f.category === 'wildfire').length;
  const industrial = firesData.filter((f: any) => f.category !== 'wildfire').length;
  const exceedance = facilitiesData.filter((f: any) => f.status === 'EXCEEDANCE').length;

  res.json({
    totalFires: firesData.length,
    totalFacilities: facilitiesData.length,
    critical,
    high,
    wildfires,
    industrial,
    facilitiesExceedance: exceedance,
    zone: 'Southern',
  });
});

app.listen(PORT, () => {
  console.log(`\nFire Analysis API running at http://localhost:${PORT}`);
  console.log(`  GET /api/fires          — paginated fire list`);
  console.log(`  GET /api/fires/map      — map markers`);
  console.log(`  GET /api/facilities     — paginated facilities`);
  console.log(`  GET /api/stats          — dashboard summary stats\n`);
});
