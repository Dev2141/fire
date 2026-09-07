import React from 'react';
import { Radio, ShieldAlert, CheckCircle2, Flame, MapPin, Send } from 'lucide-react';
import { ThermalEpisode } from '../types';

interface DispatchAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: ThermalEpisode | null;
  classification: string;
  confidence: number;
}

export const DispatchAlertModal: React.FC<DispatchAlertModalProps> = ({
  isOpen,
  onClose,
  episode,
  classification,
  confidence,
}) => {
  if (!isOpen || !episode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#181c22] border border-[#ff6b00] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262a31]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                EMERGENCY DISASTER BROADCAST
              </span>
              <span className="text-sm font-bold text-white">
                AGNI TELEGRAM DISPATCHED
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a98a7d] hover:text-white text-xs font-mono">
            ✕ CLOSE
          </button>
        </div>

        {/* Telegram Packet Visual */}
        <div className="bg-[#10141a] p-4 rounded-2xl border border-[#262a31] space-y-3 font-mono text-xs">
          <div className="flex justify-between pb-2 border-b border-[#262a31] text-[10px]">
            <span className="text-[#a98a7d]">PROTOCOL: AGNI-SEC-NDRF-V4</span>
            <span className="text-emerald-400 font-bold">STATUS: 100% TRANSMITTED</span>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] text-[#ffb693] font-bold">RECIPIENTS:</div>
            <div className="text-[#dfe2eb] text-[11px] space-y-0.5">
              <div>• National Disaster Response Force (NDRF) — Eastern Crisis Hub</div>
              <div>• State Disaster Management Authority (SDMA) — {episode.districtState}</div>
              <div>• Principal Chief Conservator of Forests (PCCF) Emergency Cell</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#181c22] border border-[#262a31] space-y-1 text-[11px]">
            <div className="text-white font-bold">{episode.title} ({episode.id})</div>
            <div className="text-[#a98a7d]">Coordinates: {episode.coordinates.latStr}, {episode.coordinates.lngStr}</div>
            <div className="text-red-400 font-bold">Radiative Heat: {episode.radiantHeatMw} MW (Tier 1 Escalation)</div>
            <div className="text-emerald-400">Ground Truth: {classification} ({confidence}% Confidence)</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#ff6b00] hover:bg-[#e56000] text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-[#ff6b00]/25 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          ACKNOWLEDGE TRANSMISSION &amp; RETURN
        </button>
      </div>
    </div>
  );
};
