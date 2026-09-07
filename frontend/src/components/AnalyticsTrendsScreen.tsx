import React, { useState } from 'react';
import { 
  Cpu, 
  Satellite, 
  Flame, 
  TrendingUp, 
  Download, 
  Activity, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { SATELLITE_IMAGES } from '../data/generatedData';

interface AnalyticsTrendsScreenProps {
  onOpenReviewQueue: () => void;
  onInspectEpisode?: (id: string) => void;
}

export const AnalyticsTrendsScreen: React.FC<AnalyticsTrendsScreenProps> = ({
  onOpenReviewQueue,
  onInspectEpisode,
}) => {
  const [timeRange, setTimeRange] = useState<'30d' | 'q1' | 'ytd' | 'custom'>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  return (
    <div className="p-4 lg:p-6 max-w-[1720px] mx-auto space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#262a31]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#ff6b00]/20 text-[#ffb693] border border-[#ff6b00]/40 rounded uppercase tracking-wider">
              MULTI-TEMPORAL ANALYTICS CORE
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded uppercase tracking-wider">
              RF-NET V2.4 DIAGNOSTICS
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Geospatial Analytics &amp; AI Model Diagnostics
          </h1>
          <p className="text-sm text-[#a98a7d] max-w-3xl mt-1">
            Aggregated thermal radiative flux, continuous Random Forest feature weight calibration, and longitudinal emission trends across industrial clusters and forest biospheres.
          </p>
        </div>

        {/* Range Selection & Export Briefing */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#10141a] p-1 rounded-xl border border-[#262a31] text-xs font-mono">
            {[
              { id: '30d', label: 'Past 30 Days' },
              { id: 'q1', label: 'Q1 2026' },
              { id: 'ytd', label: 'YTD' },
              { id: 'custom', label: 'Custom Range' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeRange === tab.id
                    ? 'bg-[#ff6b00] text-white font-bold shadow'
                    : 'text-[#a98a7d] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              alert("Exporting official Geospatial Geo-Intelligence Tactical Briefing (PDF/GeoJSON) with NTRO cryptographic signature.");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#262a31] hover:bg-[#31353c] text-white rounded-xl text-xs font-mono font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#ffb693]" />
            Export Briefing (PDF/JSON)
          </button>
        </div>
      </div>

      {/* 6 KPI Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3.5">
          <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
            ACTIVE SAT SWARM
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1">
            8 Crafts
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
            Sentinel, VIIRS, Landsat
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3.5">
          <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
            HOTSPOTS INGESTED
          </div>
          <div className="text-xl font-mono font-bold text-[#ffb693] mt-1">
            14,892
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
            +8.4% WoW Flux
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3.5">
          <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
            SYNTHESIZED EPISODES
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1">
            1,428
          </div>
          <div className="text-[10px] text-[#a98a7d] mt-0.5 font-mono">
            Merged spatio-temporal
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3.5">
          <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
            CUMULATIVE PEAK FRP
          </div>
          <div className="text-xl font-mono font-bold text-red-400 mt-1">
            1.84 GW
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5 font-mono">
            Peak Subcontinent
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3.5">
          <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
            MEAN RADIATIVE POWER
          </div>
          <div className="text-xl font-mono font-bold text-[#dfe2eb] mt-1">
            42.8 MW
          </div>
          <div className="text-[10px] text-[#a98a7d] mt-0.5 font-mono">
            Nominal cluster base
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3.5">
          <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
            RF MODEL F1-SCORE
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
            94.2%
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
            +3.1% Post-HITL Gate
          </div>
        </div>
      </div>

      {/* Visuals Row 1: Multi-Temporal FRP Curve (8 cols) + Jharia Coalfield Surveillance (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 30-Day Multi-Temporal Thermal Anomaly Curve */}
        <div className="lg:col-span-8 bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-6 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#ff6b00]" />
                MULTI-TEMPORAL THERMAL ANOMALY CURVE (30-DAY FRP TIMELINE)
              </h2>
              <p className="text-xs text-[#a98a7d] mt-0.5">
                Integrated Radiative Flux: <span className="text-[#ffb693] font-bold font-mono">1,842.6 GW·h</span> across subcontinental monitoring cells.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#ffb693]">
                <span className="w-3 h-1 bg-[#ff6b00] rounded-full" />
                Industrial Flares
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-3 h-1 bg-red-500 rounded-full" />
                Wildfire Canopy Burns
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-3 h-1 bg-purple-500 rounded-full" />
                Coal Smoldering
              </span>
            </div>
          </div>

          {/* Detailed SVG Graph with Peak Callouts */}
          <div className="relative h-64 w-full bg-[#10141a] rounded-xl border border-[#262a31] p-4 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 800 220" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="800" y2="40" stroke="#262a31" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="800" y2="90" stroke="#262a31" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="800" y2="140" stroke="#262a31" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="190" x2="800" y2="190" stroke="#262a31" strokeWidth="1" />

              {/* Y Axis labels */}
              <text x="10" y="38" fill="#a98a7d" fontSize="9" fontFamily="monospace">1400 MW</text>
              <text x="10" y="88" fill="#a98a7d" fontSize="9" fontFamily="monospace">900 MW</text>
              <text x="10" y="138" fill="#a98a7d" fontSize="9" fontFamily="monospace">450 MW</text>
              <text x="10" y="188" fill="#a98a7d" fontSize="9" fontFamily="monospace">0 MW</text>

              {/* Series 3: Coal Smoldering (Purple - steady around 280-350MW) */}
              <path
                d="M 50,150 Q 150,148 250,152 T 450,145 T 650,150 T 780,148"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="2 2"
              />

              {/* Series 1: Industrial Flares (Orange - oscillatory around 300-450MW with a massive spike on day 24 to 1240MW) */}
              <path
                d="M 50,140 Q 120,130 180,142 T 300,135 T 420,138 T 540,128 L 620,30 L 650,135 T 780,125"
                fill="none"
                stroke="#ff6b00"
                strokeWidth="2.5"
              />

              {/* Series 2: Wildfires (Red - spikes in dry period around day 15) */}
              <path
                d="M 50,175 Q 120,170 200,165 T 320,155 L 380,75 L 420,160 T 560,170 T 700,160 T 780,165"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
              />

              {/* Callout 1: Jamnagar Exceedance Spike at (620, 30) */}
              <circle cx="620" cy="30" r="5" fill="#ff6b00" stroke="#fff" strokeWidth="2" className="" />
              <line x1="620" y1="30" x2="620" y2="70" stroke="#ff6b00" strokeWidth="1" strokeDasharray="2 2" />

              {/* Callout 2: Bastar Canopy Breakthrough at (380, 75) */}
              <circle cx="380" cy="75" r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" />
            </svg>

            {/* Overlay Badges positioned over the peaks */}
            <div className="absolute top-5 right-[18%] bg-[#10141a]/90 border border-[#ff6b00] p-2 rounded-lg text-[10px] font-mono text-[#ffb693] backdrop-blur shadow-lg">
              <div className="font-bold text-white flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#ff6b00]" />
                Jamnagar Exceedance: 1,240 MW
              </div>
              <div>Sector 4 Tower-4B Flaring Spike</div>
            </div>

            <div className="absolute top-14 left-[40%] bg-[#10141a]/90 border border-red-500 p-2 rounded-lg text-[10px] font-mono text-[#ffb4ab] backdrop-blur shadow-lg">
              <div className="font-bold text-white flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                Bastar Canopy Breakthrough: 680 MW
              </div>
              <div>Jagdalpur Sal Forest Front</div>
            </div>

            {/* X-axis days */}
            <div className="absolute bottom-2 left-12 right-6 flex justify-between text-[10px] font-mono text-[#a98a7d]">
              <span>Day 1 (T-30d)</span>
              <span>Day 7</span>
              <span>Day 14</span>
              <span>Day 21</span>
              <span>Day 28 (Now)</span>
            </div>
          </div>
        </div>

        {/* Right: Jharia Coalfields Basin Thermal Surveillance */}
        <div className="lg:col-span-4 bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Satellite className="w-4 h-4 text-emerald-400" />
              SATELLITE GROUND TRUTH // JHARIA
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              LANDSAT-9 TIRS
            </span>
          </div>

          <div className="relative h-44 rounded-xl overflow-hidden border border-[#262a31] group">
            <img
              src={SATELLITE_IMAGES.coalSmoldering}
              alt="Jharia Coalfield Satellite View"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10141a] via-transparent to-transparent" />
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#10141a]/90 text-[#ffb693] rounded border border-[#262a31]">
                Centroid: 23.7441° N, 86.4130° E
              </span>
            </div>
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#10141a]/85 backdrop-blur p-2 rounded-lg border border-[#262a31] text-[10px] font-mono text-[#dfe2eb] flex items-center justify-between">
              <span className="text-amber-400 font-bold">Max Temp: 580°C</span>
              <span className="text-[#a98a7d]">14 Active Smoldering Vents</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#262a31]">
              <span className="text-[#a98a7d]">Subsurface Seam XIII Status:</span>
              <span className="text-red-400 font-bold">Uncontrolled Deep Combustion</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#262a31]">
              <span className="text-[#a98a7d]">Overburden Plume Dispersion:</span>
              <span className="text-white">NE 05 Kts toward Dhanbad</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#a98a7d]">Methane / CO Radiative Offset:</span>
              <span className="text-emerald-400 font-bold">Automated Static Geofence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visuals Row 2: Weekly Volume Breakdown (6 cols) + Regional Vulnerability (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Thermal Category Volume Breakdown */}
        <div className="lg:col-span-6 bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ff6b00]" />
              WEEKLY THERMAL CATEGORY VOLUME BREAKDOWN
            </h2>
            <span className="text-[10px] font-mono text-[#a98a7d]">
              Aggregated Radiative Output
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { week: 'Week 4 (Current)', total: '4,120 MW', ref: 44, wild: 28, coal: 18, pwr: 10 },
              { week: 'Week 3', total: '3,890 MW', ref: 38, wild: 34, coal: 18, pwr: 10 },
              { week: 'Week 2', total: '3,410 MW', ref: 42, wild: 26, coal: 20, pwr: 12 },
              { week: 'Week 1', total: '3,240 MW', ref: 40, wild: 25, coal: 22, pwr: 13 },
            ].map((row) => (
              <div key={row.week} className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white font-bold">{row.week}</span>
                  <span className="text-[#ff6b00] font-bold">{row.total}</span>
                </div>
                <div className="h-3 w-full bg-[#10141a] rounded-full overflow-hidden flex">
                  <div style={{ width: `${row.ref}%` }} className="bg-[#ff6b00] h-full" title={`Refineries: ${row.ref}%`} />
                  <div style={{ width: `${row.wild}%` }} className="bg-red-600 h-full" title={`Wildfires: ${row.wild}%`} />
                  <div style={{ width: `${row.coal}%` }} className="bg-purple-600 h-full" title={`Coal Seams: ${row.coal}%`} />
                  <div style={{ width: `${row.pwr}%` }} className="bg-amber-400 h-full" title={`Thermal Power: ${row.pwr}%`} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono pt-2 border-t border-[#262a31] text-[#a98a7d]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff6b00]" /> Refinery Flares (44%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" /> Wildfire Canopy (28%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600" /> Coal Seams (18%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Power Plants (10%)</span>
          </div>
        </div>

        {/* Regional Vulnerability Index */}
        <div className="lg:col-span-6 bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              REGIONAL THERMAL VULNERABILITY INDEX
            </h2>
            <span className="text-[10px] font-mono text-red-400 font-bold">
              MULTI-PARAMETRIC RISK
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { region: 'Bastar Dense Forest Corridor', state: 'Chhattisgarh', score: 88.4, status: 'CRITICAL HAZARD', color: 'bg-red-500' },
              { region: 'Jharia Coal Basin Cluster', state: 'Jharkhand', score: 84.1, status: 'HIGH RISK', color: 'bg-[#ff6b00]' },
              { region: 'Jamnagar Petrochemical SEZ', state: 'Gujarat', score: 79.6, status: 'HIGH EXCEEDANCE', color: 'bg-amber-500' },
              { region: 'Paradip Port Petrochemical Hub', state: 'Odisha', score: 68.2, status: 'MODERATE RISK', color: 'bg-yellow-500' },
            ].map((reg) => (
              <div key={reg.region} className="bg-[#10141a] p-3 rounded-xl border border-[#262a31] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{reg.region}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#262a31] text-[#ffb693]">
                    {reg.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#a98a7d]">
                  <span>{reg.state}</span>
                  <span className="text-white font-bold">{reg.score} / 100</span>
                </div>
                <div className="w-full bg-[#181c22] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${reg.color}`} style={{ width: `${reg.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visuals Row 3: Leaderboard (4 cols) + Feature Importance (4 cols) + HITL Re-calibration Impact (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dominant Recurrent Emitters Leaderboard */}
        <div className="bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#262a31]">
            <h3 className="text-xs font-mono font-bold text-[#ffb693] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#ff6b00]" />
              TOP 5 RECURRENT EMITTERS
            </h3>
            <span className="text-[10px] font-mono text-[#a98a7d]">FRP PEAK</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {[
              { rank: '01', name: 'Jharia Coalfield Mines', loc: 'Jharkhand', mw: '620 MW' },
              { rank: '02', name: 'Jamnagar Petrochemical', loc: 'Gujarat', mw: '490 MW' },
              { rank: '03', name: 'Korba Super Thermal', loc: 'Chhattisgarh', mw: '310 MW' },
              { rank: '04', name: 'Angul Steel Works', loc: 'Odisha', mw: '280 MW' },
              { rank: '05', name: 'Bellary Iron Ore Kilns', loc: 'Karnataka', mw: '215 MW' },
            ].map((emitter) => (
              <div key={emitter.rank} className="flex items-center justify-between p-2 rounded-lg bg-[#10141a] border border-[#262a31]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#a98a7d] w-4">{emitter.rank}</span>
                  <div>
                    <div className="text-white font-bold text-[11px]">{emitter.name}</div>
                    <div className="text-[9px] text-[#a98a7d]">{emitter.loc}</div>
                  </div>
                </div>
                <span className="text-[#ff6b00] font-bold text-xs">{emitter.mw}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Random Forest Feature Importance Matrix */}
        <div className="bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#262a31]">
            <h3 className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              RF FEATURE WEIGHT MATRIX
            </h3>
            <span className="text-[10px] font-mono text-[#a98a7d]">IMPORTANCE</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {[
              { feature: 'FRP Radiative Power (MW)', weight: 38 },
              { feature: 'Normalized Burn Ratio (NBR)', weight: 24 },
              { feature: 'Proximity to PPAC Cadastre', weight: 21 },
              { feature: 'Solar Zenith Glint Filter', weight: 12 },
              { feature: 'Diurnal Temporal Persistence', weight: 5 },
            ].map((feat) => (
              <div key={feat.feature} className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#dfe2eb]">{feat.feature}</span>
                  <span className="text-emerald-400 font-bold">{feat.weight}%</span>
                </div>
                <div className="w-full bg-[#10141a] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${feat.weight * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HITL Feedback Re-Calibration Impact */}
        <div className="bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-5 space-y-3 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#262a31]">
              <h3 className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                HITL RE-CALIBRATION IMPACT
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="bg-[#10141a] p-3 rounded-xl border border-[#262a31]">
                <div className="text-[10px] text-[#a98a7d]">FALSE POSITIVE SUPPRESSION</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-red-400 line-through">18.4%</span>
                  <span className="text-xl font-bold text-emerald-400">→ 2.1%</span>
                </div>
                <div className="text-[10px] text-[#a98a7d] mt-1">
                  Analyst Vance validated 32 episodes this shift.
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenReviewQueue}
            className="w-full py-2.5 px-4 bg-[#ff6b00] hover:bg-[#e56000] text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-[#ff6b00]/20 transition-all flex items-center justify-center gap-2"
          >
            <span>OPEN REVIEW QUEUE (14 PENDING)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

