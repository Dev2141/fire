import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Building2, 
  Flame, 
  AlertTriangle, 
  Sliders, 
  Download, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  Activity, 
  Video, 
  Satellite, 
  Compass, 
  MapPin,
  Calendar,
  Eye
} from 'lucide-react';
import { IndustrialFacility } from '../types';

interface FacilitiesDirectoryScreenProps {
  facilities: IndustrialFacility[];
  onInspectEpisode: (episodeId: string) => void;
  onOpenMapForFacility: (facilityId: string) => void;
}

export const FacilitiesDirectoryScreen: React.FC<FacilitiesDirectoryScreenProps> = ({
  facilities,
  onInspectEpisode,
  onOpenMapForFacility,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || 'PPAC-REF-009-SEC4');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);

  const selectedFacility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];

  const filteredFacilities = facilities.filter(f => {
    if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 lg:p-6 max-w-[1720px] mx-auto space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#262a31]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#181c22] text-[#ffb693] border border-[#262a31] rounded uppercase tracking-wider">
              PPAC INDUSTRIAL CADASTRE
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded uppercase tracking-wider">
              1,482 MONITORED SITES
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Industrial Facility Buffer Registry
          </h1>
          <p className="text-sm text-[#a98a7d] max-w-3xl mt-1">
            Automated geospatial geofencing associating high-temperature flaring stacks with Ministry Petroleum &amp; Natural Gas (PPAC) authorized envelopes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setGeofenceModalOpen(true)}
            className="px-3.5 py-2 bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#ffb693]" />
            Edit Geo-Fence Polygon
          </button>
          <button 
            onClick={() => setScheduleModalOpen(true)}
            className="px-3.5 py-2 bg-[#ff6b00] hover:bg-[#e56000] text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-[#ff6b00]/20 transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Add Flare Schedule
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Left Cadastre List + Right Facility Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Facilities Cadastre (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#181c22] border border-[#262a31] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#ffb693] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#ff6b00]" />
                FACILITY CADASTRE
              </span>
              <span className="text-[10px] font-mono text-[#a98a7d]">
                {filteredFacilities.length} MATCHING
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#a98a7d] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search facility name, sector, PPAC ID..."
                className="w-full bg-[#10141a] border border-[#262a31] rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-white placeholder:text-[#a98a7d] focus:border-[#ff6b00] focus:outline-none"
              />
            </div>

            {/* Industry Pills */}
            <div className="flex flex-wrap gap-1 text-[11px] font-mono">
              {[
                { label: 'ALL', count: 1482 },
                { label: 'Refineries', count: 142 },
                { label: 'Thermal', count: 386 },
                { label: 'Steel', count: 214 },
                { label: 'Coal', count: 510 },
                { label: 'LNG', count: 48 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setCategoryFilter(item.label)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    categoryFilter === item.label
                      ? 'bg-[#ff6b00] text-white font-bold'
                      : 'bg-[#10141a] text-[#a98a7d] hover:text-white'
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>
          </div>

          {/* Facility List Cards */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredFacilities.map((fac) => {
              const isSelected = fac.id === selectedFacilityId;

              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacilityId(fac.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e232b] border-[#ff6b00] shadow-lg shadow-[#ff6b00]/10 ring-1 ring-[#ff6b00]'
                      : 'bg-[#181c22] border-[#262a31] hover:border-[#3d424c]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#ffb693]">
                      {fac.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      fac.status === 'EXCEEDANCE'
                        ? 'bg-[#93000a] text-white border border-red-500/40'
                        : fac.status === 'SCHEDULED'
                        ? 'bg-amber-950/50 text-amber-300 border border-amber-800/40'
                        : fac.status === 'PERSISTENT'
                        ? 'bg-purple-950/50 text-purple-300 border border-purple-800/40'
                        : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {fac.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                    {fac.shortName}
                  </h3>
                  <div className="text-[11px] text-[#a98a7d] mt-0.5">
                    {fac.stateZone} • {fac.bufferRadiusKm} km Buffer Polygon
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#262a31] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#a98a7d]">
                      Episodes: <strong className="text-white">{fac.linkedEpisodesCount}</strong>
                    </span>
                    <span className="text-[#ff6b00] font-bold">
                      Cap: {fac.nominalFrpCapMw} MW
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Facility Dossier (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedFacility && (
            <div className="bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-6 space-y-6 shadow-2xl">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#262a31]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#ff6b00]/20 text-[#ffb693] border border-[#ff6b00]/40 rounded">
                      CLASS A INDUSTRIAL BUFFER
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded">
                      VERIFIED PPAC ENTITY
                    </span>
                    <span className="text-xs font-mono text-[#a98a7d]">
                      {selectedFacility.id}
                    </span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight">
                    {selectedFacility.name}
                  </h2>
                  <div className="text-xs font-mono text-[#a98a7d] mt-1 flex items-center gap-3">
                    <span className="text-white font-bold">{selectedFacility.coordinates.latStr}, {selectedFacility.coordinates.lngStr}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{selectedFacility.district}</span>
                    <span>•</span>
                    <span className="text-[#ffb693]">{selectedFacility.bufferRadiusKm} km Buffer Polygon</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenMapForFacility(selectedFacility.id)}
                    className="px-3.5 py-2 bg-[#262a31] hover:bg-[#ff6b00] text-white rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#ff6b00]" />
                    Inspect on Map
                  </button>
                  <button
                    onClick={() => {
                      alert(`Exporting official PPAC Industrial Cadastre dossier for ${selectedFacility.name}`);
                    }}
                    className="px-3.5 py-2 bg-[#10141a] hover:bg-[#262a31] border border-[#262a31] text-[#dfe2eb] rounded-xl text-xs font-mono transition-colors"
                  >
                    Export Dossier
                  </button>
                </div>
              </div>

              {/* 4 Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#10141a] p-3.5 rounded-xl border border-[#262a31]">
                  <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
                    NOMINAL FRP CAP
                  </div>
                  <div className="text-xl font-mono font-bold text-white mt-1">
                    {selectedFacility.nominalFrpCapMw} MW
                  </div>
                  <div className="text-[10px] text-[#a98a7d] mt-0.5">
                    Baseline: {selectedFacility.baselineOperatingMw} MW
                  </div>
                </div>

                <div className="bg-[#10141a] p-3.5 rounded-xl border border-[#262a31]">
                  <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
                    REGISTERED STACKS
                  </div>
                  <div className="text-xl font-mono font-bold text-[#ffb693] mt-1">
                    {selectedFacility.registeredStacks}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    Elevated Flare #4 Live
                  </div>
                </div>

                <div className="bg-[#10141a] p-3.5 rounded-xl border border-[#262a31]">
                  <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
                    PEAK FRP (12 MONTHS)
                  </div>
                  <div className="text-xl font-mono font-bold text-red-400 mt-1">
                    {selectedFacility.peakFrp12mMw} MW
                  </div>
                  <div className="text-[10px] text-amber-400 mt-0.5">
                    Exceedance on 02/11
                  </div>
                </div>

                <div className="bg-[#10141a] p-3.5 rounded-xl border border-[#262a31]">
                  <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
                    BUFFER OVERLAPS
                  </div>
                  <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                    {selectedFacility.bufferOverlaps}
                  </div>
                  <div className="text-[10px] text-[#a98a7d] mt-0.5">
                    Clean separation polygon
                  </div>
                </div>
              </div>

              {/* Dual Surveillance & Ground Truth CCTV Feeds (Matching Image 9) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel 1: Aerial & Satellite Surveillance Feed */}
                <div className="bg-[#10141a] rounded-xl border border-[#262a31] overflow-hidden">
                  <div className="px-3.5 py-2.5 bg-[#181c22] border-b border-[#262a31] flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Satellite className="w-3.5 h-3.5 text-[#ff6b00]" />
                      AERIAL & SATELLITE SURVEILLANCE FEED
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      ORBIT PASS: {selectedFacility.satelliteFeed.orbitPass}
                    </span>
                  </div>

                  <div className="relative h-48 sm:h-56 overflow-hidden group">
                    <img 
                      src={selectedFacility.satelliteFeed.imageUrl}
                      alt="Satellite Feed"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10141a] via-transparent to-transparent" />

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 text-[9px] font-mono">
                      <span className="px-2 py-0.5 bg-[#10141a]/90 text-white rounded border border-[#262a31]">
                        FOV: {selectedFacility.satelliteFeed.fov}
                      </span>
                      <span className="px-2 py-0.5 bg-[#93000a]/80 text-[#ffb4ab] rounded font-bold">
                        {selectedFacility.satelliteFeed.coreTemp}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-[10px] font-mono bg-[#10141a]/85 backdrop-blur px-2.5 py-1.5 rounded-lg border border-[#262a31] text-[#dfe2eb] flex items-center justify-between">
                      <span>Target: {selectedFacility.satelliteFeed.target}</span>
                      <span className="text-emerald-400 font-bold">{selectedFacility.satelliteFeed.sensor}</span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Stack CCTV Ground Truth Feed */}
                <div className="bg-[#10141a] rounded-xl border border-[#262a31] overflow-hidden">
                  <div className="px-3.5 py-2.5 bg-[#181c22] border-b border-[#262a31] flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-red-400 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      STACK CCTV GROUND TRUTH // ELEVATED FLARE #4
                    </span>
                    <span className="text-[10px] text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-800/50 font-bold">
                      LIVE FEED
                    </span>
                  </div>

                  <div className="relative h-48 sm:h-56 overflow-hidden group">
                    <img 
                      src={selectedFacility.cctvFeed.imageUrl}
                      alt="CCTV Feed"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10141a] via-transparent to-transparent" />

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 text-[9px] font-mono">
                      <span className="px-2 py-0.5 bg-red-600/90 text-white rounded font-bold">
                        {selectedFacility.cctvFeed.exceedanceStatus}
                      </span>
                      <span className="px-2 py-0.5 bg-[#10141a]/90 text-[#ffb693] rounded border border-[#262a31]">
                        FLAME VELOCITY: {selectedFacility.cctvFeed.flameVelocity}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-[10px] font-mono bg-[#10141a]/85 backdrop-blur px-2.5 py-1.5 rounded-lg border border-[#262a31] text-[#dfe2eb] flex items-center justify-between">
                      <span>Stack Ht: {selectedFacility.cctvFeed.stackHeight}</span>
                      <span className="text-amber-400 font-bold">{selectedFacility.cctvFeed.plumeDispersion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 12-Month Thermal Episode Frequency & Seasonal Trend Line Chart */}
              <div className="bg-[#10141a] p-4 rounded-xl border border-[#262a31] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#ff6b00]" />
                    <span className="font-bold text-white tracking-wider">
                      12-MONTH THERMAL EPISODE FREQUENCY & SEASONAL TREND
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="w-3 h-0.5 bg-[#ff6b00]" />
                      Monthly Mean FRP (MW)
                    </span>
                    <span className="flex items-center gap-1.5 text-red-400">
                      <span className="w-3 h-0.5 bg-red-500 border-dashed" />
                      Nominal Permit Cap (600 MW)
                    </span>
                  </div>
                </div>

                {/* SVG Visualized Trend Chart */}
                <div className="h-44 w-full relative pt-4">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 150">
                    {/* Background Grid Lines */}
                    <line x1="0" y1="30" x2="1000" y2="30" stroke="#262a31" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="75" x2="1000" y2="75" stroke="#262a31" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="120" x2="1000" y2="120" stroke="#262a31" strokeWidth="1" />

                    {/* 600 MW Permit Cap Horizontal Line */}
                    <line x1="0" y1="75" x2="1000" y2="75" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 6" />
                    <text x="10" y="70" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      PERMIT CAP THRESHOLD: 600 MW
                    </text>

                    {/* Polyline Path for 12 months */}
                    {/* Points computed: x goes from 40 to 960 (step ~83px), y inverted from value (0-1300MW) */}
                    <polyline
                      fill="none"
                      stroke="#ff6b00"
                      strokeWidth="3"
                      points="
                        50,113
                        133,110
                        216,114
                        300,117
                        383,112
                        466,115
                        550,108
                        633,110
                        716,104
                        800,101
                        883,10
                        966,78
                      "
                    />

                    {/* February Peak Exceedance Marker */}
                    <circle cx="883" cy="10" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                    <text x="820" y="28" fill="#ffb4ab" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      FEB EXCEEDANCE: 1,240 MW
                    </text>

                    {/* Monthly Labels */}
                    {['MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'FEB (PK)', 'CURRENT'].map((m, idx) => (
                      <text
                        key={m}
                        x={50 + idx * 83}
                        y="145"
                        textAnchor="middle"
                        fill="#a98a7d"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {m}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Recent Detections in Facility Buffer Zone Table */}
              <div className="bg-[#10141a] rounded-xl border border-[#262a31] overflow-hidden">
                <div className="px-4 py-3 bg-[#181c22] border-b border-[#262a31] flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">
                    RECENT SENSOR DETECTIONS IN BUFFER ZONE ({selectedFacility.recentDetections.length})
                  </span>
                  <span className="text-[10px] font-mono text-[#a98a7d]">
                    PPAC Real-Time Audit Link
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#262a31] text-[#a98a7d] text-[10px] uppercase">
                        <th className="p-3">EPISODE DETECTED (UTC)</th>
                        <th className="p-3">FRP RADIANCE</th>
                        <th className="p-3">SENSOR PLATFORM</th>
                        <th className="p-3">CLASSIFICATION</th>
                        <th className="p-3">ANALYST STATUS</th>
                        <th className="p-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262a31]">
                      {selectedFacility.recentDetections.map((det) => (
                        <tr key={det.id} className="hover:bg-[#181c22] transition-colors">
                          <td className="p-3 font-bold text-white flex items-center gap-1.5">
                            {det.flagged && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                            {det.timestampUtc}
                          </td>
                          <td className="p-3">
                            <span className={det.frpMw > 600 ? 'text-red-400 font-bold text-sm' : 'text-[#ffb693] font-bold'}>
                              {det.frpMw} MW
                            </span>
                          </td>
                          <td className="p-3 text-[#dfe2eb]">{det.sensor}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              det.flagged ? 'bg-[#93000a] text-white' : 'bg-[#262a31] text-emerald-400'
                            }`}>
                              {det.classification}
                            </span>
                          </td>
                          <td className="p-3 text-[#a98a7d]">{det.analystStatus}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onInspectEpisode(det.id)}
                              className="px-2.5 py-1 bg-[#262a31] hover:bg-[#ff6b00] text-[#dfe2eb] hover:text-white rounded text-[10px] font-bold transition-colors"
                            >
                              INSPECT
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flare Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181c22] border border-[#262a31] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#262a31]">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff6b00]" />
                ADD SCHEDULED INDUSTRIAL FLARE
              </h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-xs text-[#a98a7d]">✕</button>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[#a98a7d] block mb-1">FACILITY NAME</label>
                <input disabled value={selectedFacility.name} className="w-full bg-[#10141a] p-2 rounded border border-[#262a31] text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#a98a7d] block mb-1">START TIME (UTC)</label>
                  <input type="datetime-local" className="w-full bg-[#10141a] p-2 rounded border border-[#262a31] text-white" />
                </div>
                <div>
                  <label className="text-[#a98a7d] block mb-1">EXPECTED PEAK (MW)</label>
                  <input type="number" defaultValue={450} className="w-full bg-[#10141a] p-2 rounded border border-[#262a31] text-white" />
                </div>
              </div>
              <div>
                <label className="text-[#a98a7d] block mb-1">PURGE REASON / PERMIT NO.</label>
                <input placeholder="PPAC-MAINT-PURGE-2026-B" className="w-full bg-[#10141a] p-2 rounded border border-[#262a31] text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setScheduleModalOpen(false)} className="px-3 py-1.5 bg-[#262a31] text-xs rounded text-white">Cancel</button>
              <button onClick={() => {
                alert("Flare schedule logged in PPAC Cadastre. False positive suppression active.");
                setScheduleModalOpen(false);
              }} className="px-3 py-1.5 bg-[#ff6b00] text-xs rounded text-white font-bold">Register Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Geofence Modal */}
      {geofenceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181c22] border border-[#262a31] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#262a31]">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#ff6b00]" />
                EDIT BUFFER ZONE GEOFENCE
              </h3>
              <button onClick={() => setGeofenceModalOpen(false)} className="text-xs text-[#a98a7d]">✕</button>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[#a98a7d] block mb-1">BUFFER RADIUS (KM)</label>
                <input type="number" step="0.1" defaultValue={selectedFacility.bufferRadiusKm} className="w-full bg-[#10141a] p-2 rounded border border-[#262a31] text-white" />
              </div>
              <div>
                <label className="text-[#a98a7d] block mb-1">NOMINAL FRP CAP (MW)</label>
                <input type="number" defaultValue={selectedFacility.nominalFrpCapMw} className="w-full bg-[#10141a] p-2 rounded border border-[#262a31] text-white" />
              </div>
              <div>
                <label className="text-[#a98a7d] block mb-1">AUDIT REGULATORY NOTES</label>
                <textarea rows={2} defaultValue="PPAC Standard Class A Refinery Buffer geofence envelope." className="w-full bg-[#10141a] p-2 rounded border border-[#262a31] text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setGeofenceModalOpen(false)} className="px-3 py-1.5 bg-[#262a31] text-xs rounded text-white">Cancel</button>
              <button onClick={() => {
                alert("Geofence buffer polygon re-calibrated.");
                setGeofenceModalOpen(false);
              }} className="px-3 py-1.5 bg-[#ff6b00] text-xs rounded text-white font-bold">Update Buffer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
