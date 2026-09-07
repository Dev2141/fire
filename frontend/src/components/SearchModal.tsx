import React, { useState, useEffect } from 'react';
import { Search, Flame, Building2, MapPin, ChevronRight, Compass } from 'lucide-react';
import { ThermalEpisode, IndustrialFacility, ScreenTab } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: ThermalEpisode[];
  facilities: IndustrialFacility[];
  onSelectEpisode: (id: string) => void;
  onSelectFacility: (id: string) => void;
  setActiveTab: (tab: ScreenTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  episodes,
  facilities,
  onSelectEpisode,
  onSelectFacility,
  setActiveTab,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedEpisodes = episodes.filter(
    (e) =>
      e.id.toLowerCase().includes(query.toLowerCase()) ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.districtState.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const matchedFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.id.toLowerCase().includes(query.toLowerCase()) ||
      f.district.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181c22] border border-[#262a31] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-[#262a31] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#ff6b00]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search episode ID, coordinates, facility, district... (ESC to close)"
            className="w-full bg-transparent text-white font-mono text-xs placeholder:text-[#a98a7d] focus:outline-none"
          />
          <span className="text-[10px] font-mono text-[#a98a7d] bg-[#10141a] px-2 py-0.5 rounded border border-[#262a31]">
            ESC
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs font-mono">
          {/* Quick Navigation Jumps */}
          <div>
            <div className="text-[10px] text-[#a98a7d] uppercase tracking-wider px-2 mb-1.5">
              Quick Views
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setActiveTab('review'); onClose(); }}
                className="p-2.5 rounded-xl bg-[#10141a] hover:bg-[#262a31] border border-[#262a31] text-left flex items-center justify-between"
              >
                <span className="text-white font-bold flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#ff6b00]" />
                  Review Queue
                </span>
                <span className="text-[10px] text-[#ff6b00]">14 Pending</span>
              </button>
              <button
                onClick={() => { setActiveTab('facilities'); onClose(); }}
                className="p-2.5 rounded-xl bg-[#10141a] hover:bg-[#262a31] border border-[#262a31] text-left flex items-center justify-between"
              >
                <span className="text-white font-bold flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  PPAC Cadastre
                </span>
                <span className="text-[10px] text-emerald-400">1,482 Sites</span>
              </button>
            </div>
          </div>

          {/* Episodes Matches */}
          {matchedEpisodes.length > 0 && (
            <div>
              <div className="text-[10px] text-[#a98a7d] uppercase tracking-wider px-2 mb-1">
                Thermal Episodes
              </div>
              <div className="space-y-1">
                {matchedEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      onSelectEpisode(ep.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#262a31] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-[#ff6b00]" />
                      <div>
                        <div className="text-white font-bold text-xs">{ep.title}</div>
                        <div className="text-[10px] text-[#a98a7d]">{ep.id} • {ep.districtState} • {ep.radiantHeatMw} MW</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#a98a7d]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facilities Matches */}
          {matchedFacilities.length > 0 && (
            <div>
              <div className="text-[10px] text-[#a98a7d] uppercase tracking-wider px-2 mb-1">
                Industrial Facilities
              </div>
              <div className="space-y-1">
                {matchedFacilities.map((fac) => (
                  <div
                    key={fac.id}
                    onClick={() => {
                      onSelectFacility(fac.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#262a31] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#ffb693]" />
                      <div>
                        <div className="text-white font-bold text-xs">{fac.shortName}</div>
                        <div className="text-[10px] text-[#a98a7d]">{fac.id} • {fac.district} • Cap {fac.nominalFrpCapMw} MW</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#a98a7d]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
