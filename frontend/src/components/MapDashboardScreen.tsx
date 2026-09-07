import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  MapPin, 
  Building2, 
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { MAP_HOTSPOTS } from '../data/generatedData';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';

interface MapDashboardScreenProps {
  onSelectEpisodeToReview: (id: string) => void;
  onOpenFacilityDossier: (facilityId?: string) => void;
}

// A helper component to automatically fly the map to the selected hotspot
const MapPanController: React.FC<{
  selectedHotspot: typeof MAP_HOTSPOTS[0] | null;
}> = ({ selectedHotspot }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedHotspot) {
      // Pan to the selected hotspot with a smooth animation and zoom in a bit
      map.flyTo([selectedHotspot.lat, selectedHotspot.lng], 12, {
        duration: 1.5,
      });
    }
  }, [selectedHotspot, map]);
  return null;
};

// Create custom animated divIcons using React markup rendered to string
const createCustomIcon = (risk: string, category: string, isSelected: boolean) => {
  const isWildfire = category === 'wildfire';
  const isCritical = risk === 'CRITICAL';
  
  const outerColorClass = isCritical ? 'bg-red-500' : isWildfire ? 'bg-amber-500' : 'bg-[#ff6b00]';
  const innerColorClass = isCritical ? 'bg-red-600' : isWildfire ? 'bg-amber-600' : 'bg-[#ff6b00]';
  const coreColorClass = isCritical ? 'bg-red-500 shadow-red-500/80' : isWildfire ? 'bg-amber-500 shadow-amber-500/80' : 'bg-[#ff6b00] shadow-[#ff6b00]/80';
  const selectedRingClass = isSelected ? 'scale-125 ring-4 ring-[#ff6b00]' : '';

  const html = `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 w-10 h-10 group">
      <span class="absolute w-10 h-10 rounded-full animate-ping opacity-60 ${outerColorClass}"></span>
      <span class="absolute w-6 h-6 rounded-full opacity-40 animate-pulse ${innerColorClass}"></span>
      <div class="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${selectedRingClass} ${coreColorClass}">
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};


export const MapDashboardScreen: React.FC<MapDashboardScreenProps> = ({
  onSelectEpisodeToReview,
  onOpenFacilityDossier,
}) => {
  const [activeLayer, setActiveLayer] = useState<'THERMAL_IR' | 'OPTICAL'>('THERMAL_IR');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedHotspot, setSelectedHotspot] = useState<typeof MAP_HOTSPOTS[0] | null>(MAP_HOTSPOTS[0]);
  const [radarActive, setRadarActive] = useState<boolean>(true);

  const filteredHotspots = MAP_HOTSPOTS.filter(h => {
    if (selectedCategory !== 'ALL' && h.category !== selectedCategory.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-100px)] min-h-[700px] bg-[#070a0e] overflow-hidden flex flex-col select-none">
      
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Layer Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#10141a]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#262a31] shadow-2xl">
          {(['THERMAL_IR', 'OPTICAL'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeLayer === layer
                  ? 'bg-[#ff6b00] text-white shadow-md shadow-[#ff6b00]/30'
                  : 'text-[#a98a7d] hover:text-white hover:bg-[#181c22]'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>

        {/* Hotspot Category Filter */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#10141a]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#262a31] shadow-2xl text-xs font-mono">
          <span className="text-[#a98a7d] px-2 hidden sm:inline">FILTER:</span>
          {['ALL', 'Wildfire', 'Refinery', 'Thermal', 'Mine'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#262a31] text-white border border-[#ff6b00]/50 font-bold'
                  : 'text-[#a98a7d] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Left Tactical HUD Metrics */}
      <div className="absolute top-20 left-4 z-[1000] space-y-3 pointer-events-none hidden md:block">
        {/* Critical Thermal Alerts */}
        <div className="pointer-events-auto bg-[#10141a]/90 backdrop-blur-md border border-[#262a31] p-3.5 rounded-2xl shadow-2xl min-w-[240px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              CRITICAL THERMAL ALERTS
            </span>
            <span className="text-[10px] font-mono text-emerald-400">P0 ACTIVE</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {MAP_HOTSPOTS.filter(h => h.risk === 'CRITICAL').length} <span className="text-xs font-normal text-red-400">(NEW LOCKS)</span>
          </div>
          <div className="text-[11px] text-[#a98a7d]">Subcontinental Swath VIIRS-375m</div>
        </div>

        {/* Facilities Monitored */}
        <div className="pointer-events-auto bg-[#10141a]/90 backdrop-blur-md border border-[#262a31] p-3.5 rounded-2xl shadow-2xl min-w-[240px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#ffb693] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#ff6b00]" />
              FACILITIES MONITORED
            </span>
            <span className="text-[10px] font-mono text-emerald-400">100% GEOFENCE</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            208 <span className="text-xs font-normal text-[#a98a7d]">(SOUTHERN ZONE)</span>
          </div>
          <div className="text-[11px] text-[#a98a7d]">Active Flare &amp; Flue Envelopes</div>
        </div>
      </div>

      {/* Main Map Tactical Canvas Area */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[14.0, 79.0]} // Southern India approx center
          zoom={6} 
          zoomControl={false}
          className="w-full h-full bg-[#121922]"
        >
          {/* Basemaps */}
          {activeLayer === 'THERMAL_IR' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          <MapPanController selectedHotspot={selectedHotspot} />

          {/* Markers */}
          <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
            {filteredHotspots.map(h => (
              <Marker
                key={h.id}
                position={[h.lat, h.lng]}
                icon={createCustomIcon(h.risk, h.category, selectedHotspot?.id === h.id)}
                eventHandlers={{
                  click: () => setSelectedHotspot(h)
                }}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Tactical Radar Scanline Effect */}
        {radarActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-[500]">
            <div className="w-[1000px] h-[1000px] rounded-full border border-[#ff6b00]/10 radar-sweep-effect relative">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#ff6b00]/15 to-transparent rounded-tl-full origin-bottom-right" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Right Detail Card (When a hotspot is selected) */}
      {selectedHotspot && (
        <div className="absolute bottom-6 right-4 lg:right-6 z-[1000] max-w-sm w-full bg-[#181c22]/95 backdrop-blur-md border border-[#262a31] rounded-2xl p-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262a31]">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedHotspot.risk === 'CRITICAL'
                  ? 'bg-red-950/60 text-red-300 border border-red-800/50'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
              }`}>
                {selectedHotspot.risk} LOCK
              </span>
              <span className="text-xs font-mono font-bold text-[#ffb693]">
                {selectedHotspot.episodeId}
              </span>
            </div>
            <button 
              onClick={() => setSelectedHotspot(null)} 
              className="text-[#a98a7d] hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white leading-snug">
              {selectedHotspot.name}
            </h3>
            <div className="text-[11px] font-mono text-[#a98a7d] mt-0.5">
              Lat {selectedHotspot.lat.toFixed(4)}° N, Long {selectedHotspot.lng.toFixed(4)}° E
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#10141a] p-2.5 rounded-xl border border-[#262a31]">
            <div>
              <span className="text-[#a98a7d] text-[10px] block">PEAK RADIANCE</span>
              <span className="text-red-400 font-bold text-sm">{selectedHotspot.frpMw} MW</span>
            </div>
            <div>
              <span className="text-[#a98a7d] text-[10px] block">CATEGORY</span>
              <span className="text-emerald-400 font-bold uppercase">{selectedHotspot.category}</span>
            </div>
          </div>

          <div className="text-[11px] text-[#dfe2eb] bg-[#10141a]/60 p-2 rounded-lg border border-[#262a31]">
            {selectedHotspot.info}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onSelectEpisodeToReview(selectedHotspot.episodeId)}
              className="flex-1 py-2 px-3 bg-[#ff6b00] hover:bg-[#e56000] text-white font-mono font-bold text-xs rounded-xl shadow-md shadow-[#ff6b00]/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>HITL VERIFY</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenFacilityDossier(selectedHotspot.episodeId)}
              className="py-2 px-3 bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] font-mono font-semibold text-xs rounded-xl transition-colors"
            >
              Cadastre
            </button>
          </div>
        </div>
      )}

      {/* Radar Toggle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1.5 bg-[#10141a]/90 backdrop-blur-md p-1.5 rounded-full border border-[#262a31] shadow-2xl">
        <button
          onClick={() => setRadarActive(!radarActive)}
          className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-colors ${
            radarActive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-[#181c22] text-[#a98a7d]'
          }`}
        >
          RADAR SCAN {radarActive ? 'ON' : 'OFF'}
        </button>
      </div>

    </div>
  );
};
