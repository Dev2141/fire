import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Layers, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Satellite, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { ThermalEpisode, RiskLevel } from '../types';

interface EpisodesTableScreenProps {
  episodes: ThermalEpisode[];
  onSelectEpisodeToReview: (id: string) => void;
  onSelectEpisodeForMap: (id: string) => void;
}

export const EpisodesTableScreen: React.FC<EpisodesTableScreenProps> = ({
  episodes,
  onSelectEpisodeToReview,
  onSelectEpisodeForMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedClassification, setSelectedClassification] = useState<string>('ALL');
  const [nearFacilityOnly, setNearFacilityOnly] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState('48h');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalEpisode, setDetailModalEpisode] = useState<ThermalEpisode | null>(null);

  // Filter episodes
  const filtered = episodes.filter(ep => {
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = 
        ep.id.toLowerCase().includes(q) ||
        ep.title.toLowerCase().includes(q) ||
        ep.districtState.toLowerCase().includes(q) ||
        ep.coordinates.latStr.toLowerCase().includes(q) ||
        ep.coordinates.lngStr.toLowerCase().includes(q) ||
        ep.sensorPlatform.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Risk
    if (selectedRisk !== 'ALL') {
      if (ep.riskLevel !== selectedRisk) return false;
    }

    // Classification
    if (selectedClassification !== 'ALL') {
      if (selectedClassification === 'INDUSTRIAL_LIKELY' && !ep.mlInference.toLowerCase().includes('refinery') && !ep.mlInference.toLowerCase().includes('industrial')) return false;
      if (selectedClassification === 'FOREST_FIRE_LIKELY' && !ep.mlInference.toLowerCase().includes('forest') && !ep.title.toLowerCase().includes('canopy')) return false;
      if (selectedClassification === 'UNCERTAIN' && !ep.mlInference.toLowerCase().includes('uncertain')) return false;
    }

    // Proximity to facility (< 5km)
    if (nearFacilityOnly) {
      if (ep.ppacProximityKm >= 5.0) return false;
    }

    return true;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(e => e.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const riskCounts: Record<string, number> = {
    ALL: 318,
    CRITICAL: 14,
    HIGH: 42,
    MEDIUM: 88,
    LOW: 152,
    UNCERTAIN: 22,
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1720px] mx-auto space-y-6">
      {/* Title & Top Action Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#262a31]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#181c22] text-[#ffb693] border border-[#262a31] rounded uppercase tracking-wider">
              ORBITAL MATRIX
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#ff6b00]/20 text-[#ffb693] border border-[#ff6b00]/40 rounded uppercase tracking-wider">
              318 DETECTIONS
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#93000a]/30 text-[#ffb4ab] border border-[#93000a]/50 rounded uppercase tracking-wider">
              14 P0 CRITICAL LOCKS
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Thermal Anomaly Episodes
          </h1>
          <p className="text-sm text-[#a98a7d] max-w-3xl mt-1">
            AGNI-DRISHTI Dual-sensor spatiotemporal clustering engine aggregating VIIRS 375m I-Band and MODIS 1km calibrated radiative emissions.
          </p>
        </div>

        {/* Global Batch & Export buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#262a31] hover:bg-[#31353c] disabled:opacity-40 text-white rounded-xl text-xs font-mono font-semibold transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            BATCH ACTION ({selectedIds.length} SELECTED)
          </button>

          <button 
            onClick={() => {
              // Simulated instant refresh
              alert("Telemetry Swath Updated: Ingested latest VIIRS 375m pass with 0 latency.");
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#181c22] hover:bg-[#262a31] border border-[#262a31] text-[#dfe2eb] rounded-xl text-xs font-mono font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            REFRESH FEED
          </button>

          <button 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(episodes, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `AGNI_EPISODES_TELEMETRY_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ff6b00] hover:bg-[#e56000] text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-[#ff6b00]/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT SENSOR DATA
          </button>
        </div>
      </div>

      {/* 4 Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              ACTIVE SENSOR SWATH
            </span>
            <Satellite className="w-4 h-4 text-[#ff6b00]" />
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1">
            NOAA-20 / SUOMI
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Primary 375m payload active
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              AGGREGATE FRP HEAT
            </span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-mono font-bold text-[#ff6b00] mt-1">
            8,912.4 MW Total
          </div>
          <div className="text-[11px] text-amber-400 mt-1 font-mono">
            +14.2% since prior pass
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              HITL CLEARED
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
            86.2% Confirmed
          </div>
          <div className="text-[11px] text-[#a98a7d] mt-1 font-mono">
            274 / 318 validated
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              SDRF/NDRF RELAYS
            </span>
            <Radio className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-mono font-bold text-sky-400 mt-1">
            4 Active Dispatches
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            State disaster ops alert
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Search, Dropdowns, Risk Pills, Facility Toggle */}
      <div className="bg-[#181c22] border border-[#262a31] rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#a98a7d] absolute left-3 top-3" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search episode ID, coordinates, district, or facility..."
              className="w-full bg-[#10141a] border border-[#262a31] rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-[#a98a7d] focus:border-[#ff6b00] focus:outline-none"
            />
          </div>

          {/* Acquisition Horizon Dropdown */}
          <div className="md:col-span-3">
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="w-full bg-[#10141a] border border-[#262a31] rounded-xl px-3 py-2.5 text-xs font-mono text-[#dfe2eb] focus:border-[#ff6b00] focus:outline-none"
            >
              <option value="48h">PAST 48 HOURS (OPERATION)</option>
              <option value="24h">PAST 24 HOURS</option>
              <option value="7d">PAST 7 DAYS</option>
              <option value="all">ALL ORBIT PASSES</option>
            </select>
          </div>

          {/* Classification Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-full bg-[#10141a] border border-[#262a31] rounded-xl px-3 py-2.5 text-xs font-mono text-[#dfe2eb] focus:border-[#ff6b00] focus:outline-none"
            >
              <option value="ALL">ALL CLASSIFICATIONS (318)</option>
              <option value="INDUSTRIAL_LIKELY">INDUSTRIAL_LIKELY</option>
              <option value="FOREST_FIRE_LIKELY">FOREST_FIRE_LIKELY</option>
              <option value="UNCERTAIN">UNCERTAIN (FLAGGED)</option>
            </select>
          </div>
        </div>

        {/* Risk Pills & Toggle Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#262a31]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-[#a98a7d] text-[11px] mr-1">RISK LEVEL:</span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN'] as const).map((r) => {
              const isActive = selectedRisk === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRisk(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? r === 'CRITICAL' 
                        ? 'bg-[#93000a] text-white shadow-md' 
                        : 'bg-[#ff6b00] text-white shadow-md'
                      : 'bg-[#10141a] text-[#a98a7d] hover:text-white hover:bg-[#262a31]'
                  }`}
                >
                  {r} ({riskCounts[r] ?? 12})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
              <input 
                type="checkbox"
                checked={nearFacilityOnly}
                onChange={(e) => setNearFacilityOnly(e.target.checked)}
                className="accent-[#ff6b00] rounded"
              />
              <span className="text-[#dfe2eb]">&lt; 5km of Facility</span>
            </label>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRisk('ALL');
                setSelectedClassification('ALL');
                setNearFacilityOnly(false);
              }}
              className="text-xs font-mono text-[#a98a7d] hover:text-[#ff6b00] underline"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabular Episode Grid */}
      <div className="bg-[#181c22] border border-[#262a31] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#10141a] border-b border-[#262a31] text-[11px] font-mono text-[#a98a7d] uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    onChange={handleSelectAll}
                    className="accent-[#ff6b00] rounded"
                  />
                </th>
                <th className="p-3.5 w-14">THUMBNAIL</th>
                <th className="p-3.5">EPISODE ID</th>
                <th className="p-3.5">TARGET COORDINATES & AREA</th>
                <th className="p-3.5">TIMELINE & AGE</th>
                <th className="p-3.5">CLASSIFICATION</th>
                <th className="p-3.5">CONFIDENCE</th>
                <th className="p-3.5">RISK LEVEL</th>
                <th className="p-3.5">URGENCY TIER</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a31] text-xs">
              {filtered.map((ep) => {
                const isChecked = selectedIds.includes(ep.id);

                return (
                  <tr 
                    key={ep.id}
                    className="hover:bg-[#1c2026] transition-colors group cursor-pointer"
                    onClick={() => setDetailModalEpisode(ep)}
                  >
                    <td className="p-3.5 text-center" onClick={(e) => toggleSelectOne(ep.id, e)}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => {}}
                        className="accent-[#ff6b00] rounded"
                      />
                    </td>

                    {/* Thumbnail */}
                    <td className="p-3.5">
                      <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#262a31] relative bg-[#0a0e14]">
                        <img 
                          src={ep.topoData?.imageUrl || ep.thermalData?.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=150&q=80"}
                          alt="Thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-[#ff6b00]/10" />
                      </div>
                    </td>

                    {/* Episode ID */}
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-white group-hover:text-[#ff6b00] transition-colors flex items-center gap-1.5">
                        {ep.id}
                        {ep.isCanopyBreach && (
                          <span className="w-2 h-2 rounded-full bg-red-500 opacity-80" title="Canopy Breach" />
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-[#a98a7d]">{ep.sensorPlatform}</div>
                    </td>

                    {/* Coordinates & Area */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#dfe2eb]">{ep.title}</div>
                      <div className="text-[11px] font-mono text-[#a98a7d] flex items-center gap-2 mt-0.5">
                        <span>{ep.coordinates.latStr}, {ep.coordinates.lngStr}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{ep.districtState}</span>
                      </div>
                    </td>

                    {/* Timeline & Age */}
                    <td className="p-3.5 font-mono">
                      <div className="text-[#dfe2eb] font-semibold">{ep.firstDetectedUtc}</div>
                      <div className="text-[11px] text-[#a98a7d]">{ep.timelineAge}</div>
                    </td>

                    {/* Classification */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ep.mlInference.toLowerCase().includes('forest')
                            ? 'bg-red-950/50 text-red-300 border border-red-800/40'
                            : ep.mlInference.toLowerCase().includes('refinery') || ep.mlInference.toLowerCase().includes('industrial')
                            ? 'bg-amber-950/50 text-amber-300 border border-amber-800/40'
                            : 'bg-purple-950/50 text-purple-300 border border-purple-800/40'
                        }`}>
                          {ep.mlInference}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#ffb693] mt-0.5">
                        FRP: {ep.radiantHeatMw} MW
                      </div>
                    </td>

                    {/* Confidence Bar */}
                    <td className="p-3.5 font-mono">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-[#a98a7d]">Confidence</span>
                        <span className="font-bold text-white">{ep.confidence}%</span>
                      </div>
                      <div className="w-24 bg-[#0a0e14] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            ep.confidence > 80 ? 'bg-emerald-500' : ep.confidence > 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${ep.confidence}%` }}
                        />
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider ${
                        ep.riskLevel === 'CRITICAL'
                          ? 'bg-[#93000a] text-white border border-red-500/50'
                          : ep.riskLevel === 'HIGH'
                          ? 'bg-[#ff6b00]/30 text-[#ffb693] border border-[#ff6b00]/50'
                          : ep.riskLevel === 'MEDIUM'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                          : ep.riskLevel === 'UNCERTAIN'
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-700/50'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                      }`}>
                        {ep.riskLevel}
                      </span>
                    </td>

                    {/* Urgency Tier */}
                    <td className="p-3.5 font-mono text-[11px] text-[#dfe2eb]">
                      {ep.urgencyTier}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailModalEpisode(ep)}
                          className="p-1.5 rounded-lg bg-[#262a31] hover:bg-[#ff6b00] text-white transition-colors"
                          title="Inspect Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectEpisodeToReview(ep.id)}
                          className="px-2.5 py-1 bg-[#ff6b00]/20 hover:bg-[#ff6b00] text-[#ffb693] hover:text-white border border-[#ff6b00]/40 rounded-lg text-[10px] font-mono font-bold transition-colors flex items-center gap-1"
                        >
                          <span>VERIFY</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="p-4 bg-[#10141a] border-t border-[#262a31] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="text-[#a98a7d]">
            Showing <span className="text-white font-bold">1 - {filtered.length}</span> of <span className="text-white font-bold">318</span> episodes
          </div>

          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1 rounded bg-[#ff6b00] text-white font-bold">1</button>
            <button className="px-3 py-1 rounded bg-[#181c22] text-[#a98a7d] hover:text-white">2</button>
            <button className="px-3 py-1 rounded bg-[#181c22] text-[#a98a7d] hover:text-white">3</button>
            <button className="px-3 py-1 rounded bg-[#181c22] text-[#a98a7d] hover:text-white">4</button>
            <span className="text-[#a98a7d] px-1">...</span>
            <button className="px-3 py-1 rounded bg-[#181c22] text-[#a98a7d] hover:text-white">46</button>
            <button className="px-3 py-1 rounded bg-[#262a31] text-[#dfe2eb] hover:bg-[#31353c] font-bold">
              Next Orbit Pass &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 3 Bottom Telemetry Status Cards (Matching Image 7) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              ACTIVE SPACECRAFT INGEST
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-80" />
          </div>
          <div className="text-base font-mono font-bold text-white">
            SNPP-VIIRS HIGH PASS
          </div>
          <p className="text-[11px] text-[#a98a7d]">Ground Station Shadnagar (NRSC)</p>
          <div className="flex justify-between text-[10px] font-mono text-[#ffb693] pt-1 border-t border-[#262a31]">
            <span>Lat Drift: ±0.002°</span>
            <span className="text-emerald-400 font-bold">Sync SNR: 99.8%</span>
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              ML FILTER EFFICIENCY
            </span>
            <span className="text-emerald-400 text-xs font-mono font-bold">94.3% Suppressed</span>
          </div>
          <div className="text-base font-mono font-bold text-white">
            Solar Glint & High-Albedo Masked
          </div>
          <p className="text-[11px] text-[#a98a7d]">Dynamic solar zenith vector suppression active.</p>
          <div className="flex justify-between text-[10px] font-mono text-[#ffb693] pt-1 border-t border-[#262a31]">
            <span>Static Flares: 842</span>
            <span>Active Masked: 71</span>
          </div>
        </div>

        <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              DISASTER OPS GATEWAY
            </span>
            <span className="text-sky-400 text-xs font-mono font-bold">NDRF Crisis Net Relay</span>
          </div>
          <div className="text-base font-mono font-bold text-white">
            Active Relay: Western & Eastern Hubs
          </div>
          <p className="text-[11px] text-[#a98a7d]">Subcontinental emergency broadcast pipeline authenticated.</p>
          <div className="flex justify-between text-[10px] font-mono text-emerald-400 pt-1 border-t border-[#262a31]">
            <span>Uplink: 100% Locked</span>
            <span>Heartbeat: 12s ago</span>
          </div>
        </div>
      </div>

      {/* Episode Inspection Modal */}
      {detailModalEpisode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181c22] border border-[#262a31] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#262a31]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#ff6b00]/20 text-[#ffb693] border border-[#ff6b00]/40 rounded">
                  {detailModalEpisode.id}
                </span>
                <span className="text-sm font-bold text-white">{detailModalEpisode.title}</span>
              </div>
              <button 
                onClick={() => setDetailModalEpisode(null)}
                className="text-[#a98a7d] hover:text-white font-mono text-xs"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#10141a] p-3 rounded-xl border border-[#262a31]">
              <div>
                <span className="text-[#a98a7d] block text-[10px]">COORDINATES</span>
                <span className="text-white font-bold">{detailModalEpisode.coordinates.latStr}, {detailModalEpisode.coordinates.lngStr}</span>
              </div>
              <div>
                <span className="text-[#a98a7d] block text-[10px]">SENSOR / SWATH</span>
                <span className="text-[#ffb693] font-bold">{detailModalEpisode.sensorPlatform}</span>
              </div>
              <div>
                <span className="text-[#a98a7d] block text-[10px]">RADIATIVE HEAT</span>
                <span className="text-red-400 font-bold">{detailModalEpisode.radiantHeatMw} MW Peak</span>
              </div>
              <div>
                <span className="text-[#a98a7d] block text-[10px]">PPAC PROXIMITY</span>
                <span className="text-emerald-400 font-bold">{detailModalEpisode.ppacProximityKm} km to buffer</span>
              </div>
            </div>

            {/* Satellite Image Preview */}
            <div className="relative h-48 rounded-xl overflow-hidden border border-[#262a31]">
              <img 
                src={detailModalEpisode.topoData?.imageUrl || detailModalEpisode.thermalData?.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"}
                alt="Sat preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10141a] to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs font-mono text-white">
                <span className="bg-[#10141a]/90 px-2 py-1 rounded border border-[#262a31]">
                  ML Inference: {detailModalEpisode.mlInference} ({detailModalEpisode.confidence}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onSelectEpisodeForMap(detailModalEpisode.id);
                  setDetailModalEpisode(null);
                }}
                className="px-4 py-2 bg-[#262a31] hover:bg-[#31353c] text-white rounded-xl text-xs font-mono font-semibold"
              >
                Inspect on Map
              </button>
              <button
                onClick={() => {
                  onSelectEpisodeToReview(detailModalEpisode.id);
                  setDetailModalEpisode(null);
                }}
                className="px-4 py-2 bg-[#ff6b00] hover:bg-[#e56000] text-white rounded-xl text-xs font-mono font-bold shadow-md shadow-[#ff6b00]/25"
              >
                Open in HITL Review Queue &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

