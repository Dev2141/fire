import React, { useState } from 'react';
import { 
  Flame, 
  Search, 
  Bell, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  User, 
  Activity,
  ChevronDown
} from 'lucide-react';
import { ScreenTab, AnalystUser } from '../types';

interface HeaderProps {
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  reviewCount: number;
  analyst: AnalystUser;
  onOpenSearch: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
  analyst,
  onOpenSearch,
  onOpenLogin,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#10141a]/95 backdrop-blur-md border-b border-[#262a31] px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Brand Logo & Military Clearance Mark */}
      <div className="flex items-center gap-3 shrink-0">
        <div 
          onClick={() => setActiveTab('map')} 
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b00] to-[#93000a] flex items-center justify-center p-0.5 shadow-lg shadow-[#ff6b00]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#10141a] rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <Flame className="w-5 h-5 text-[#ff6b00] animate-pulse" />
              <div className="absolute inset-0 bg-[#ff6b00]/10 rounded-[10px]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg lg:text-xl tracking-tight text-white flex items-center gap-1.5">
                AGNI<span className="text-[#ff6b00]">—</span>DRISHTI
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#ff6b00]/20 text-[#ffb693] border border-[#ff6b00]/40 rounded">
                अग्नि-दृष्टि
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#1c2026] text-[#e2bfb0] border border-[#31353c] rounded">
                GEO-INT
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#a98a7d] tracking-wider hidden sm:block">
              NTRO // THERMAL INFRARED ORBITAL MATRIX
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav className="hidden md:flex items-center gap-1.5 bg-[#0a0e14] p-1 rounded-full border border-[#262a31]">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'map'
              ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] text-white shadow-md shadow-[#ff6b00]/30 font-bold'
              : 'text-[#a98a7d] hover:text-white hover:bg-[#1c2026]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${activeTab === 'map' ? 'bg-red-500 animate-ping' : 'bg-red-500/60'}`} />
          MAP DASHBOARD
        </button>

        <button
          onClick={() => setActiveTab('episodes')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'episodes'
              ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] text-white shadow-md shadow-[#ff6b00]/30 font-bold'
              : 'text-[#a98a7d] hover:text-white hover:bg-[#1c2026]'
          }`}
        >
          EPISODES TABLE
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'facilities'
              ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] text-white shadow-md shadow-[#ff6b00]/30 font-bold'
              : 'text-[#a98a7d] hover:text-white hover:bg-[#1c2026]'
          }`}
        >
          FACILITIES DIRECTORY
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] text-white shadow-md shadow-[#ff6b00]/30 font-bold'
              : 'text-[#a98a7d] hover:text-white hover:bg-[#1c2026]'
          }`}
        >
          ANALYTICS & TRENDS
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all relative ${
            activeTab === 'review'
              ? 'bg-[#ff6b00] text-white shadow-md shadow-[#ff6b00]/30 font-bold'
              : 'text-[#a98a7d] hover:text-white hover:bg-[#1c2026]'
          }`}
        >
          <span>REVIEW QUEUE</span>
          <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full ${
            activeTab === 'review' 
              ? 'bg-white text-[#ff6b00]' 
              : 'bg-[#93000a] text-white'
          }`}>
            {reviewCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('auth')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'auth'
              ? 'bg-[#00c2ff] text-[#050b14] shadow-md shadow-[#00c2ff]/30 font-bold'
              : 'text-[#00c2ff]/80 hover:text-white hover:bg-[#1c2026]'
          }`}
        >
          <Lock className="w-3 h-3 text-[#00c2ff]" />
          <span>AUTH</span>
        </button>
      </nav>

      {/* Right Utility & Profile Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search Command Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 bg-[#0a0e14] hover:bg-[#1c2026] text-[#a98a7d] hover:text-white border border-[#262a31] rounded-full px-3 py-1.5 text-xs transition-colors"
          title="Search telemetry, episode ID, facility (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-[#ffb693]" />
          <span className="hidden xl:inline text-xs">Search episode, grid, unit..</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-[#1c2026] border border-[#31353c] rounded text-[#e2bfb0]">
            ⌘K
          </kbd>
        </button>

        {/* RF-NET Status Tag */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#181c22] border border-[#262a31] rounded-full text-[10px] font-mono text-[#a98a7d]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-semibold">RF-NET v2.4 ACTIVATED</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-full bg-[#181c22] hover:bg-[#262a31] text-[#a98a7d] hover:text-white border border-[#262a31] transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-[#ff6b00] text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#10141a]">
              3
            </span>
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#181c22] border border-[#262a31] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#262a31]">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#ff6b00]" />
                  ORBITAL PRIORITY ALERTS
                </span>
                <span className="text-[10px] text-[#ff6b00] font-mono">LIVE FEED</span>
              </div>
              <div className="divide-y divide-[#262a31] text-xs">
                <div className="py-2 hover:bg-[#1c2026] px-1 rounded cursor-pointer" onClick={() => setActiveTab('review')}>
                  <div className="flex justify-between text-[11px] font-mono font-semibold text-[#ffb693]">
                    <span>EP-2026-04821</span>
                    <span className="text-red-400">TIER 2 URGENT</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">Bastar Dense Canopy Corridor — Unconfirmed Crown Fire (+48.2K)</p>
                  <span className="text-[9px] text-[#a98a7d]">3h 41m ago // VIIRS SNPP</span>
                </div>
                <div className="py-2 hover:bg-[#1c2026] px-1 rounded cursor-pointer" onClick={() => setActiveTab('facilities')}>
                  <div className="flex justify-between text-[11px] font-mono font-semibold text-[#ffb693]">
                    <span>PPAC-REF-009</span>
                    <span className="text-amber-400">EXCEEDANCE</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">Reliance Jamnagar Sector 4 — Peak FRP 1,240 MW (Permit Cap 600 MW)</p>
                  <span className="text-[9px] text-[#a98a7d]">34m ago // Sensor M13</span>
                </div>
                <div className="py-2 hover:bg-[#1c2026] px-1 rounded cursor-pointer" onClick={() => setActiveTab('episodes')}>
                  <div className="flex justify-between text-[11px] font-mono font-semibold text-[#ffb693]">
                    <span>DISASTER OPS RELAY</span>
                    <span className="text-emerald-400">SECURE UPLINK</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">NDRF Eastern Hub synchronized with Jagdalpur Forest Division.</p>
                  <span className="text-[9px] text-[#a98a7d]">12s ago // Heartbeat OK</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analyst Profile Badge with Switch / Lock Modal */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 bg-[#181c22] hover:bg-[#262a31] border border-[#262a31] rounded-full p-1 pl-1.5 pr-2.5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff6b00] to-[#93000a] flex items-center justify-center text-white font-bold text-xs shadow">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                {analyst.name}
                <ChevronDown className="w-3 h-3 text-[#a98a7d]" />
              </div>
              <div className="text-[9px] font-mono text-[#ffb693] leading-none">
                {analyst.role}
              </div>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#181c22] border border-[#262a31] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in">
              <div className="pb-2 border-b border-[#262a31]">
                <div className="text-xs font-bold text-white">{analyst.name}</div>
                <div className="text-[10px] font-mono text-[#ffb693]">{analyst.email}</div>
                <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {analyst.clearanceLevel}
                </div>
              </div>
              <div className="pt-2 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setActiveTab('auth');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#262a31] text-[#dfe2eb] flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-[#00c2ff]" />
                  Auth &amp; Personnel Gateway
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setActiveTab('auth');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#262a31] text-[#dfe2eb] flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Lock Console (Gov-Auth)
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setActiveTab('auth');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#93000a]/20 text-red-400 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  Sign Out of Terminal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
