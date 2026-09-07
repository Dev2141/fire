import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Sliders, 
  RefreshCw, 
  Download, 
  Clock, 
  Radio, 
  Compass, 
  Layers, 
  Check, 
  FileText,
  MapPin,
  ExternalLink,
  Satellite
} from 'lucide-react';
import { ThermalEpisode } from '../types';

interface ReviewQueueScreenProps {
  episodes: ThermalEpisode[];
  onConfirmEpisode: (id: string, classification: string, confidence: number, notes: string, directAlert: boolean) => void;
  onRejectGlint: (id: string) => void;
  onRequestSecondReview: (id: string) => void;
  onSelectEpisodeForMap?: (id: string) => void;
}

export const ReviewQueueScreen: React.FC<ReviewQueueScreenProps> = ({
  episodes,
  onConfirmEpisode,
  onRejectGlint,
  onRequestSecondReview,
  onSelectEpisodeForMap,
}) => {
  // Currently selected episode in the verification panel
  const [selectedId, setSelectedId] = useState<string>(episodes[0]?.id || 'EP-2026-04821');
  const selectedEpisode = episodes.find(e => e.id === selectedId) || episodes[0];

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | '<60' | '60-75' | 'glint'>('all');

  // Form state for current verification sign-off
  const [classification, setClassification] = useState<string>(
    selectedEpisode?.groundTruthClassification || 'forest_fire_likely — Confirmed Canopy Fire Front (Active Wildfire)'
  );
  const [confidence, setConfidence] = useState<number>(95);
  const [directAlert, setDirectAlert] = useState<boolean>(true);
  const [assessmentNotes, setAssessmentNotes] = useState<string>(
    selectedEpisode?.notes || "Thermal cluster detected inside core Bastar forest corridor outside registered PPAC facility buffer. Concentrated thermal anomalies across adjacent 375m pixels with rapid radiant power ramp (+48.2K) confirms advancing ground wildfire front. Immediate alert dispatched."
  );

  // Sync state when selected episode changes
  useEffect(() => {
    if (selectedEpisode) {
      setClassification(selectedEpisode.groundTruthClassification || 'forest_fire_likely — Confirmed Canopy Fire Front (Active Wildfire)');
      setAssessmentNotes(selectedEpisode.notes || `Thermal anomaly ${selectedEpisode.id} in ${selectedEpisode.districtState}. Evaluated by Analyst Vance.`);
      setConfidence(selectedEpisode.confidence > 70 ? Math.round(selectedEpisode.confidence) : 95);
    }
  }, [selectedId]);

  // Auto-sync countdown timer
  const [syncTimer, setSyncTimer] = useState<number>(45);
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTimer(prev => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter episodes list
  const filteredEpisodes = episodes.filter(ep => {
    if (confidenceFilter === '<60') return ep.confidence < 60;
    if (confidenceFilter === '60-75') return ep.confidence >= 60 && ep.confidence <= 75;
    if (confidenceFilter === 'glint') return ep.confidence < 50 || ep.mlInference.toLowerCase().includes('glint');
    return true;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEpisodes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEpisodes.map(e => e.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmCurrent = () => {
    if (!selectedEpisode) return;
    onConfirmEpisode(selectedEpisode.id, classification, confidence, assessmentNotes, directAlert);
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1720px] mx-auto space-y-6">
      {/* Title & SLA Header Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#262a31]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#ff6b00]/20 text-[#ffb693] border border-[#ff6b00]/40 rounded uppercase tracking-wider">
              AGNI-DRISHTI HITL VERIFICATION
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#93000a]/30 text-[#ffb4ab] border border-[#93000a]/50 rounded uppercase tracking-wider">
              HIGH RADIANCE GATE
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Analyst Feedback & Review Queue
          </h1>
          <p className="text-sm text-[#a98a7d] max-w-3xl mt-1 leading-relaxed">
            Human-in-the-loop fire classification: Confirm flare operations, wild canopy blazes, or sensor glints before dispatching emergency broadcast alerts to NDRF, State Disaster Authorities (SDMA), and Forest Brigades.
          </p>
        </div>

        {/* 3 Top KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3 min-w-[130px]">
            <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              ESCALATION SLA
            </div>
            <div className="text-lg lg:text-xl font-mono font-bold text-emerald-400 mt-0.5">
              &lt; 08m 42s
            </div>
            <div className="text-[10px] text-[#a98a7d] mt-0.5">Avg Queue Hold</div>
          </div>

          <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3 min-w-[130px]">
            <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              CONFIRMED BURNS
            </div>
            <div className="text-lg lg:text-xl font-mono font-bold text-[#ff6b00] mt-0.5">
              {episodes.filter(ep => ep.status === 'CONFIRMED' || ep.groundTruthClassification?.includes('Confirmed')).length} Verified
            </div>
            <div className="text-[10px] text-[#a98a7d] mt-0.5">Total Southern Tally</div>
          </div>

          <div className="bg-[#181c22] border border-[#262a31] rounded-xl p-3 min-w-[130px]">
            <div className="text-[10px] font-mono font-semibold text-[#a98a7d] uppercase tracking-wider">
              GLINT RATIO
            </div>
            <div className="text-lg lg:text-xl font-mono font-bold text-sky-400 mt-0.5">
              {((episodes.filter(ep => ep.confidence < 50).length / Math.max(1, episodes.length)) * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#a98a7d] mt-0.5">False Discovery</div>
          </div>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181c22] p-2.5 rounded-xl border border-[#262a31]">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="flex items-center gap-2 bg-[#0a0e14] px-3 py-1.5 rounded-lg border border-[#262a31] cursor-pointer hover:border-[#ff6b00]/40 transition-colors">
            <input 
              type="checkbox" 
              checked={selectedIds.length > 0 && selectedIds.length === filteredEpisodes.length}
              onChange={handleSelectAll}
              className="accent-[#ff6b00] rounded"
            />
            <span className="font-mono text-white font-semibold">
              Select All ({filteredEpisodes.length})
            </span>
          </label>

          <button 
            disabled={selectedIds.length === 0}
            onClick={() => {
              selectedIds.forEach(id => onConfirmEpisode(id, "industrial_activity", 90, "Batch verified by Analyst Vance.", false));
              setSelectedIds([]);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#262a31] hover:bg-[#ff6b00] disabled:opacity-40 disabled:hover:bg-[#262a31] text-white font-semibold rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Batch Confirm Burns
          </button>

          <button 
            disabled={selectedIds.length === 0}
            onClick={() => {
              selectedIds.forEach(id => onRequestSecondReview(id));
              setSelectedIds([]);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#262a31] hover:bg-[#31353c] disabled:opacity-40 text-[#dfe2eb] font-semibold rounded-lg transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Batch Reclassify
          </button>

          <button 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(episodes, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `AGNI_DRISHTI_TELEMETRY_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] font-semibold rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#ffb693]" />
            Export Telemetry
          </button>
        </div>

        {/* Confidence Filters */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[#a98a7d] text-[11px] mr-1 hidden sm:inline">CONFIDENCE:</span>
          <button
            onClick={() => setConfidenceFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${confidenceFilter === 'all' ? 'bg-[#ff6b00] text-white' : 'bg-[#0a0e14] text-[#a98a7d] hover:text-white'}`}
          >
            All ({episodes.length})
          </button>
          <button
            onClick={() => setConfidenceFilter('<60')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${confidenceFilter === '<60' ? 'bg-[#ff6b00] text-white' : 'bg-[#0a0e14] text-[#a98a7d] hover:text-white'}`}
          >
            &lt; 60% (9)
          </button>
          <button
            onClick={() => setConfidenceFilter('60-75')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${confidenceFilter === '60-75' ? 'bg-[#ff6b00] text-white' : 'bg-[#0a0e14] text-[#a98a7d] hover:text-white'}`}
          >
            60-75% (3)
          </button>
          <button
            onClick={() => setConfidenceFilter('glint')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${confidenceFilter === 'glint' ? 'bg-[#ff6b00] text-white' : 'bg-[#0a0e14] text-[#a98a7d] hover:text-white'}`}
          >
            Glint (2)
          </button>
          
          <div className="h-4 w-px bg-[#262a31] mx-1" />
          
          <div className="text-[11px] text-[#ffb693] font-mono hidden md:block">
            Sort: FRP ↓
          </div>
        </div>
      </div>

      {/* Main Review Grid: Left Queue List + Right Deep Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Thermal Episodes List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-mono font-bold tracking-wider text-[#ffb693] flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-[#ff6b00]" />
              PRIORITY THERMAL EPISODES ({filteredEpisodes.length})
            </div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 bg-[#181c22] px-2 py-0.5 rounded border border-[#262a31]">
              <RefreshCw className="w-2.5 h-2.5 " />
              Auto-Sync: {syncTimer}s
            </div>
          </div>

          <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
            {filteredEpisodes.map((ep) => {
              const isSelected = ep.id === selectedId;
              const isChecked = selectedIds.includes(ep.id);

              return (
                <div
                  key={ep.id}
                  onClick={() => setSelectedId(ep.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#1e232b] border-[#ff6b00] shadow-lg shadow-[#ff6b00]/10 ring-1 ring-[#ff6b00]'
                      : 'bg-[#181c22] border-[#262a31] hover:border-[#3d424c]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onClick={(e) => toggleSelectOne(ep.id, e)}
                        onChange={() => {}}
                        className="accent-[#ff6b00] rounded"
                      />
                      <span className="font-mono text-xs font-bold text-white tracking-wider">
                        {ep.id}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                        ep.urgencyTier.includes('IMMEDIATE')
                          ? 'bg-[#93000a]/40 text-[#ffb4ab] border border-[#93000a]'
                          : 'bg-[#ff6b00]/20 text-[#ffb693] border border-[#ff6b00]/40'
                      }`}>
                        {ep.urgencyTier}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#a98a7d]">
                      <Clock className="w-3 h-3" />
                      {ep.relativeTime}
                    </div>
                  </div>

                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-[#dfe2eb] leading-snug">
                      {ep.title}
                    </h3>
                    <div className="text-[11px] text-[#a98a7d] mt-0.5">
                      {ep.districtState} • {ep.sensorPlatform}
                    </div>
                  </div>

                  {/* Radiant Heat Signature Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-[#a98a7d]">RADIANT HEAT SIGNATURE:</span>
                      <span className="text-[#ff6b00] font-bold">{ep.radiantHeatMw} MW PEAK</span>
                    </div>
                    <div className="w-full bg-[#0a0e14] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-[#ff6b00] to-red-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (ep.radiantHeatMw / 500) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* ML Inference & Confidence */}
                  <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-[#262a31]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#a98a7d]">ML:</span>
                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                        {ep.mlInference}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                      {ep.confidence}% Conf.
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#262a31]/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirmEpisode(ep.id, "forest_fire_likely — Confirmed Canopy Fire Front", 95, "Analyst quick-confirmed.", true);
                      }}
                      className="flex-1 py-1 px-2 bg-[#ff6b00]/20 hover:bg-[#ff6b00] text-[#ffb693] hover:text-white border border-[#ff6b00]/40 rounded text-[10px] font-bold font-mono transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      CONFIRM FIRE
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestSecondReview(ep.id);
                      }}
                      className="flex-1 py-1 px-2 bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] rounded text-[10px] font-bold font-mono transition-colors flex items-center justify-center gap-1"
                    >
                      <Sliders className="w-3 h-3 text-amber-400" />
                      CORRECT ML
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Dive & Analyst Sign-off Terminal (Step 3 of 3) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedEpisode ? (
            <div className="bg-[#181c22] border border-[#262a31] rounded-2xl p-4 lg:p-6 space-y-5 shadow-2xl">
              {/* Header Details */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262a31]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#ffb693] bg-[#ff6b00]/20 px-2 py-0.5 rounded border border-[#ff6b00]/40">
                      EPISODE ID: {selectedEpisode.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                      {selectedEpisode.urgencyTier}
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
                      {selectedEpisode.status}
                    </span>
                  </div>
                  <h2 className="text-lg lg:text-xl font-bold text-white mt-1">
                    {selectedEpisode.title}
                  </h2>
                </div>

                {onSelectEpisodeForMap && (
                  <button
                    onClick={() => onSelectEpisodeForMap(selectedEpisode.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#262a31] hover:bg-[#ff6b00] text-white rounded-lg text-xs font-mono transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#ff6b00]" />
                    Inspect on Tactical Map
                  </button>
                )}
              </div>

              {/* Coordinates & Sensor Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#10141a] p-3 rounded-xl border border-[#262a31] text-xs font-mono">
                <div>
                  <div className="text-[10px] text-[#a98a7d]">TARGET COORD</div>
                  <div className="text-white font-bold mt-0.5">{selectedEpisode.coordinates.latStr}, {selectedEpisode.coordinates.lngStr}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#a98a7d]">SENSOR PLATFORM</div>
                  <div className="text-[#ffb693] font-bold mt-0.5">{selectedEpisode.sensorPlatform}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#a98a7d]">FIRST DETECTED</div>
                  <div className="text-white font-bold mt-0.5">{selectedEpisode.firstDetectedUtc}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#a98a7d]">FOREST DIVISION / ZONE</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{selectedEpisode.districtState}</div>
                </div>
              </div>

              {/* LULC Land Cover Data */}
              {selectedEpisode.lulcData && (
                <div className="bg-[#10141a] p-3 rounded-xl border border-[#262a31] text-xs font-mono">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#262a31]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[#a98a7d] font-bold tracking-wider">LULC LAND COVER (500M BUFFER)</span>
                    <span className="ml-auto text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      DOMINANT: {selectedEpisode.lulcData.dominantClass.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    <div>
                      <div className="text-[#a98a7d]">CROPLAND</div>
                      <div className="text-white font-bold mt-0.5">{selectedEpisode.lulcData.cropsPct}%</div>
                    </div>
                    <div>
                      <div className="text-[#a98a7d]">TREES / VEG</div>
                      <div className="text-white font-bold mt-0.5">{selectedEpisode.lulcData.treesPct}%</div>
                    </div>
                    <div>
                      <div className="text-[#a98a7d]">RANGELAND</div>
                      <div className="text-white font-bold mt-0.5">{selectedEpisode.lulcData.rangelandPct}%</div>
                    </div>
                    <div>
                      <div className="text-[#a98a7d]">BUILT-UP / URBAN</div>
                      <div className="text-white font-bold mt-0.5">{selectedEpisode.lulcData.urbanPct}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Side-by-Side Dual Satellite & Thermal Imagery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel 1: Topographic Wildfire Front (Landsat 9 / OLI) */}
                <div className="bg-[#10141a] rounded-xl border border-[#262a31] overflow-hidden flex flex-col">
                  <div className="px-3 py-2 bg-[#181c22] border-b border-[#262a31] flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      TOPOGRAPHIC WILDFIRE FRONT
                    </span>
                    <span className="text-[10px] text-[#a98a7d] bg-[#0a0e14] px-1.5 py-0.5 rounded border border-[#262a31]">
                      LANDSAT 9 / OLI
                    </span>
                  </div>

                  <div className="relative h-48 sm:h-56 overflow-hidden group">
                    <img 
                      src={selectedEpisode.topoData?.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"}
                      alt="Wildfire Front"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10141a] via-transparent to-transparent" />

                    {/* HUD Tactical Markers */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#93000a]/80 text-white rounded backdrop-blur">
                        {selectedEpisode.topoData?.frontAdvance || "18 km/h WSW ADVANCE"}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#10141a]/80 text-[#ffb693] rounded backdrop-blur border border-[#262a31]">
                        {selectedEpisode.topoData?.perimeter || "Perimeter: 14.2 km Active Front"}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-[#dfe2eb] bg-[#10141a]/85 backdrop-blur px-2.5 py-1.5 rounded-lg border border-[#262a31]">
                      <span>Cover: {selectedEpisode.topoData?.landCoverMatrix || "82% Dense Sal Forest"}</span>
                      <span className="text-[#ff6b00] font-bold">{selectedEpisode.topoData?.flameFrontWidth || "Avg 120m Belt"}</span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Thermal IR Ortho View (Live Ortho) */}
                <div className="bg-[#10141a] rounded-xl border border-[#262a31] overflow-hidden flex flex-col">
                  <div className="px-3 py-2 bg-[#181c22] border-b border-[#262a31] flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#ff6b00] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#ff6b00]" />
                      THERMAL IR ORTHO VIEW
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 font-bold">
                      LIVE ORTHO
                    </span>
                  </div>

                  <div className="relative h-48 sm:h-56 overflow-hidden group">
                    <img 
                      src={selectedEpisode.thermalData?.imageUrl || "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80"}
                      alt="Thermal IR View"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 saturate-150"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10141a] via-transparent to-transparent" />

                    {/* Reticle / Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-20 h-20 border border-[#ff6b00]/60 rounded-full flex items-center justify-center ">
                        <div className="w-2 h-2 bg-[#ff6b00] rounded-full shadow-lg shadow-[#ff6b00]" />
                        <div className="absolute w-24 h-[1px] bg-[#ff6b00]/40" />
                        <div className="absolute h-24 w-[1px] bg-[#ff6b00]/40" />
                      </div>
                    </div>

                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#10141a]/90 text-[#ffb693] rounded backdrop-blur border border-[#ff6b00]/40">
                        {selectedEpisode.thermalData?.temperatureRange || "SLSTR TIR // 35°C - 900°C"}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-[#dfe2eb] bg-[#10141a]/85 backdrop-blur px-2.5 py-1.5 rounded-lg border border-[#262a31]">
                      <span className="text-amber-400 font-bold">Contrast: {selectedEpisode.thermalData?.contrast || "+48.2 K"}</span>
                      <span className="text-[#a98a7d]">Buffer: {selectedEpisode.thermalData?.facilityBufferCheck || "8.4 km (Clear)"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ANALYST SIGN-OFF & CORRECTION TERMINAL (Step 3 of 3) */}
              <div className="bg-[#10141a] rounded-xl border border-[#ff6b00]/30 p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#262a31]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff6b00] opacity-80" />
                    <span className="text-xs font-mono font-bold text-white tracking-wider">
                      ANALYST SIGN-OFF & CORRECTION TERMINAL
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#ffb693] bg-[#ff6b00]/10 px-2 py-0.5 rounded border border-[#ff6b00]/20">
                    PROTOCOL STEP 3 OF 3
                  </span>
                </div>

                {/* 1. Final Ground Truth Classification */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#dfe2eb] block">
                    1. FINAL GROUND TRUTH CLASSIFICATION (OVERRIDES RF MODEL V2.4)
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    className="w-full bg-[#181c22] border border-[#262a31] text-white text-xs font-mono rounded-lg p-2.5 focus:border-[#ff6b00] focus:outline-none"
                  >
                    <option value="forest_fire_likely — Confirmed Canopy Fire Front (Active Wildfire)">
                      forest_fire_likely — Confirmed Canopy Fire Front (Active Wildfire)
                    </option>
                    <option value="industrial_activity — Verified Permitted Flare Operation">
                      industrial_activity — Verified Permitted Flare Operation
                    </option>
                    <option value="coal_fire_smoldering — Subsurface Seam Combustion">
                      coal_fire_smoldering — Subsurface Seam Combustion
                    </option>
                    <option value="sensor_glint — High-Albedo Solar Artifact (Reject)">
                      sensor_glint — High-Albedo Solar Artifact (Reject)
                    </option>
                    <option value="agricultural_burn — Crop Stubble / Biomass Clearing">
                      agricultural_burn — Crop Stubble / Biomass Clearing
                    </option>
                  </select>
                </div>

                {/* 2. Assurance Confidence Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#dfe2eb] font-semibold">2. ASSURANCE CONFIDENCE OVERRIDE</span>
                    <span className="text-[#ff6b00] font-bold">{confidence}% (HIGH CERTAINTY)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full accent-[#ff6b00] h-2 bg-[#181c22] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#a98a7d]">
                    <span>50% (Ambiguous)</span>
                    <span>75% (Probable)</span>
                    <span>100% (Absolute Verification)</span>
                  </div>
                </div>

                {/* 3. Direct Alert Checkbox */}
                <label className="flex items-start gap-2.5 bg-[#181c22] p-3 rounded-lg border border-[#262a31] cursor-pointer hover:border-[#ff6b00]/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={directAlert}
                    onChange={(e) => setDirectAlert(e.target.checked)}
                    className="mt-0.5 accent-[#ff6b00] rounded"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      DIRECT ALERT: STATE DISASTER MANAGEMENT AUTHORITY (SDMA) & FOREST DIVISION
                    </span>
                    <span className="text-[11px] text-[#a98a7d] block mt-0.5 leading-relaxed">
                      Automatically broadcasts authenticated AGNI-DRISHTI thermal telegram with vector boundary coordinates to Jagdalpur Forest HQ and NDRF Emergency Response Unit.
                    </span>
                  </div>
                </label>

                {/* 4. Analyst Operational Log */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#dfe2eb] block">
                    4. ANALYST ASSESSMENT & OPERATIONAL LOG (IMMUTABLE AUDIT LOG)
                  </label>
                  <textarea
                    rows={3}
                    value={assessmentNotes}
                    onChange={(e) => setAssessmentNotes(e.target.value)}
                    className="w-full bg-[#181c22] border border-[#262a31] text-xs font-mono text-[#dfe2eb] rounded-lg p-2.5 focus:border-[#ff6b00] focus:outline-none leading-relaxed"
                    placeholder="Enter analytical justification, thermal slope observation, or meteorological context..."
                  />
                </div>

                {/* Verification Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleConfirmCurrent}
                    className="flex-1 min-w-[240px] py-3 px-4 bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] hover:from-[#e56000] hover:to-[#ff6b00] text-white font-bold font-mono text-xs rounded-xl shadow-lg shadow-[#ff6b00]/25 transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Flame className="w-4 h-4 text-white " />
                    CONFIRM BURN & BROADCAST ALERT
                  </button>

                  <button
                    onClick={() => onRequestSecondReview(selectedEpisode.id)}
                    className="py-3 px-4 bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] font-semibold font-mono text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Sliders className="w-4 h-4 text-amber-400" />
                    REQUEST 2ND REVIEW
                  </button>

                  <button
                    onClick={() => onRejectGlint(selectedEpisode.id)}
                    className="py-3 px-4 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] border border-[#93000a]/50 font-semibold font-mono text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                    REJECT GLINT
                  </button>
                </div>
              </div>

              {/* RF Continuous Learning Loop telemetry banner */}
              <div className="bg-[#10141a] p-3 rounded-xl border border-[#262a31] flex items-center justify-between text-xs font-mono text-[#a98a7d]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>RF MODEL CONTINUOUS LEARNING LOOP: <span className="text-white font-bold">Sync Active</span></span>
                </div>
                <span className="text-[11px] text-[#ffb693]">
                  Gradient Weights Updated Post-Shift (02:00 UTC)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#181c22] border border-[#262a31] rounded-2xl p-12 text-center text-[#a98a7d]">
              No episode selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

