import React, { useState, useEffect } from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

const API = 'http://localhost:3001/api';

type Hotspot = {
  id: string; lat: number; lng: number; risk: string; category: string;
  frp: number; title: string;
};

interface MapDashboardScreenProps {
  onSelectEpisodeToReview: (id: string) => void;
  onOpenFacilityDossier: (facilityId?: string) => void;
}


// Cached icons for performance - avoid recreating on every render
const iconCache = new Map<string, L.DivIcon>();

const createCustomIcon = (risk: string, category: string, isSelected: boolean) => {
  const key = `${risk}-${category}-${isSelected}`;
  if (iconCache.has(key)) return iconCache.get(key)!;

  const isCritical = risk === 'CRITICAL';
  const isWildfire = category === 'wildfire';
  const color = isCritical ? '#ef4444' : isWildfire ? '#f59e0b' : '#ff6b00';
  const border = isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.7)';
  const size = isSelected ? 14 : 10;

  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border};box-shadow:0 0 6px ${color};"></div>`;

  const icon = L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  iconCache.set(key, icon);
  return icon;
};


export const MapDashboardScreen: React.FC<MapDashboardScreenProps> = ({
  onSelectEpisodeToReview,
  onOpenFacilityDossier,
}) => {
  const [activeLayer, setActiveLayer] = useState<'THERMAL_IR' | 'OPTICAL'>('THERMAL_IR');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [allHotspots, setAllHotspots] = useState<Hotspot[]>([]);

  useEffect(() => {
    fetch(`${API}/fires/map`)
      .then(r => r.json())
      .then((data: Hotspot[]) => setAllHotspots(data))
      .catch(() => console.warn('Could not fetch map markers from API'));
  }, []);

  const filteredHotspots = selectedCategory === 'ALL'
    ? allHotspots
    : allHotspots.filter(h => h.category === selectedCategory.toLowerCase());


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
              <span className="w-2 h-2 rounded-full bg-red-500 opacity-80" />
              CRITICAL THERMAL ALERTS
            </span>
            <span className="text-[10px] font-mono text-emerald-400">P0 ACTIVE</span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            {allHotspots.filter(h => h.risk === 'CRITICAL').length} <span className="text-xs font-normal text-red-400">(NEW LOCKS)</span>
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
      </div>

      {/* Floating Right Detail Card (When a hotspot is selected) */}
      {selectedHotspot && (
        <div className="absolute bottom-6 right-4 lg:right-6 z-[1000] max-w-sm w-full bg-[#181c22]/95 backdrop-blur-md border border-[#262a31] rounded-2xl p-4 space-y-3 shadow-2xl">
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


    </div>
  );
};

