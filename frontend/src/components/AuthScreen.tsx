import React, { useState } from 'react';
import { 
  Flame, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Compass
} from 'lucide-react';
import { AnalystUser, ScreenTab } from '../types';
import { SATELLITE_IMAGES } from '../data/generatedData';

interface AuthScreenProps {
  currentAnalyst: AnalystUser;
  onLoginSuccess: (analyst: AnalystUser) => void;
  onNavigateToConsole: (tab?: ScreenTab) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentAnalyst,
  onLoginSuccess,
  onNavigateToConsole,
}) => {
  const [email, setEmail] = useState('capt.r.vance@ntro.gov.in');
  const [password, setPassword] = useState('Gov-Token-SecurID-99214');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('VERIFYING CRYPTOGRAPHIC TOKEN VIA NTRO SAC GATEWAY...');

    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage('AUTHENTICATED. DECRYPTING GEOSPATIAL FEED...');
      
      const updatedAnalyst: AnalystUser = {
        ...currentAnalyst,
        email,
        isAuthenticated: true,
      };

      onLoginSuccess(updatedAnalyst);

      setTimeout(() => {
        onNavigateToConsole('review');
      }, 400);
    }, 750);
  };

  const handleQuickFill = (analystEmail: string, name: string, role: string) => {
    setEmail(analystEmail);
    setPassword('Gov-Token-SecurID-84920');
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] w-full flex items-center justify-center bg-[#070a0f] overflow-hidden select-none px-4 py-8">
      {/* Outer Tactical Coordinate Marks & Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Deep background ambient darkness */}
        <div className="absolute inset-0 bg-[#05080d]" />

        {/* Tactical Subcontinental Satellite Aperture (Matching Reference Image) */}
        <div className="relative w-[650px] sm:w-[820px] lg:w-[940px] h-[650px] sm:h-[820px] lg:h-[940px] rounded-full overflow-hidden border border-[#2a3444]/30 shadow-[0_0_120px_rgba(0,0,0,0.9)] flex items-center justify-center">
          {/* Thermal Imagery inside the circle */}
          <div 
            className="absolute inset-0 bg-cover bg-center scale-110 opacity-70 filter contrast-125 saturate-150"
            style={{ 
              backgroundImage: `url(${SATELLITE_IMAGES.refineryNight})`,
            }}
          />

          {/* Secondary thermal heat overlay for glowing flare fronts */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
            style={{ 
              backgroundImage: `url(${SATELLITE_IMAGES.thermalIr})`,
            }}
          />

          {/* Tactical Coordinate Grid Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 1000 1000">
            {/* Concentric rings */}
            <circle cx="500" cy="500" r="480" stroke="#ff6b00" strokeWidth="1" strokeDasharray="3 6" fill="none" opacity="0.4" />
            <circle cx="500" cy="500" r="400" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 8" fill="none" opacity="0.2" />
            <circle cx="500" cy="500" r="300" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="4 4" fill="none" opacity="0.15" />
            
            {/* Crosshairs & meridian lines */}
            <line x1="500" y1="20" x2="500" y2="980" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.2" />
            <line x1="20" y1="500" x2="980" y2="500" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.2" />
            
            {/* Diagonal calibration vectors */}
            <line x1="160" y1="160" x2="840" y2="840" stroke="#ff6b00" strokeWidth="0.5" opacity="0.15" />
            <line x1="160" y1="840" x2="840" y2="160" stroke="#ff6b00" strokeWidth="0.5" opacity="0.15" />
          </svg>

          {/* Coordinate Labels around circular lens matching image.png */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-[#a0aec0]/70 select-none">
            111°58' W
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-[#a0aec0]/70 select-none">
            111°58' W
          </div>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest text-[#a0aec0]/70 -rotate-90 select-none">
            23°45' N
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest text-[#a0aec0]/70 rotate-90 select-none">
            86°24' E
          </div>

          {/* Vignette smoothing the aperture edges to dark background */}
          <div className="absolute inset-0 bg-radial from-transparent via-[#06080d]/40 to-[#070a0f] pointer-events-none" />
        </div>
      </div>

      {/* Top Bar Quick Controls */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#10151f]/80 backdrop-blur text-emerald-400 border border-emerald-800/40 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            NTRO SECURE TERMINAL GATEWAY // PS-26162
          </span>
        </div>

        <button
          onClick={() => onNavigateToConsole('review')}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111722]/80 hover:bg-[#1c2432] backdrop-blur text-xs font-mono text-[#94a3b8] hover:text-white border border-[#232d3d] transition-colors"
          title="Direct bypass to console"
        >
          <span>Bypass to Console</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#00c2ff]" />
        </button>
      </div>

      {/* Center Auth Card — Pixel-Perfect to image.png */}
      <div className="relative z-20 w-full max-w-[440px] sm:max-w-[460px] bg-[#0e131d]/95 backdrop-blur-2xl border border-[#1e2736] rounded-2xl p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-300">
        {/* App Icon: Orange Glowing Squircle with Flame */}
        <div className="flex justify-center mb-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#ff7a00] to-[#ff4500] shadow-[0_0_35px_rgba(255,107,0,0.55)] flex items-center justify-center p-2.5 transition-transform hover:scale-105">
            <Flame className="w-7 h-7 text-white fill-white drop-shadow" />
          </div>
        </div>

        {/* App Title & Subtitle */}
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>AGNI</span>
            <span className="text-white font-normal">—</span>
            <span>DRISHTI</span>
          </h1>
          <p className="text-xs text-[#94a3b8] font-normal tracking-normal leading-relaxed">
            NTRO PS 26162 — Geospatial Fire &amp; Thermal Source Intelligence
          </p>
        </div>

        {/* Section Header: ANALYST ACCESS */}
        <div className="pt-2 pb-3">
          <div className="text-[11px] font-bold tracking-[0.18em] text-[#94a3b8] uppercase font-sans">
            ANALYST ACCESS
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Government Email / ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#cbd5e1] block">
              Government Email / ID
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[#64748b] pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="capt.r.vance@ntro.gov.in"
                className="w-full bg-[#161c27] border border-[#232d3d] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00c2ff] focus:ring-1 focus:ring-[#00c2ff]/40 transition-all font-sans"
              />
            </div>
          </div>

          {/* Security Token / Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#cbd5e1]">
                Security Token / Password
              </label>
              <button
                type="button"
                onClick={() => alert("Contact NTRO Security Operations Center (SOC) Support:\nEmergency Hotline: +91 (11) 2436-NTRO\nEmail: soc@ntro.gov.in")}
                className="text-xs font-medium text-[#ff7a00] hover:text-[#ff9433] transition-colors"
              >
                Forgot?
              </button>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[#64748b] pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full bg-[#161c27] border border-[#232d3d] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00c2ff] focus:ring-1 focus:ring-[#00c2ff]/40 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#64748b] hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Status feedback */}
          {statusMessage && (
            <div className="p-2 rounded-lg bg-[#111c2a] border border-[#00c2ff]/40 text-[11px] font-mono text-[#00c2ff] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00c2ff] animate-ping" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Electric Cyan Submit Button: SIGN IN TO CONSOLE */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 bg-[#00c2ff] hover:bg-[#1cd5ff] active:scale-[0.99] text-[#050b14] font-extrabold text-xs sm:text-sm tracking-[0.14em] uppercase rounded-xl shadow-[0_0_28px_rgba(0,194,255,0.4)] hover:shadow-[0_0_38px_rgba(0,194,255,0.65)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                AUTHENTICATING...
              </span>
            ) : (
              <span>SIGN IN TO CONSOLE</span>
            )}
          </button>
        </form>

        {/* Card Footer Warning */}
        <p className="text-[11px] text-[#64748b] text-center leading-relaxed mt-6 max-w-[340px] mx-auto font-normal">
          Access restricted to authorized personnel. Sessions are cryptographic JWT-authenticated and logged in NTRO event ledgers.
        </p>

        {/* Demo Fast-Select Personnel Badges */}
        <div className="mt-6 pt-4 border-t border-[#1e2736]/80">
          <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>DEMO CLEARANCE PROFILES</span>
            <span className="text-emerald-400">READY</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleQuickFill('capt.r.vance@ntro.gov.in', 'Capt. R. Vance', 'Chief Geo-Int Analyst')}
              className="p-2 rounded-lg bg-[#141b26] hover:bg-[#1c2534] border border-[#222c3c] text-left text-[#cbd5e1] hover:text-white transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-white text-[11px]">Capt. Vance</div>
                <div className="text-[9px] text-[#00c2ff]">Chief Analyst</div>
              </div>
              <span className="text-[10px] text-[#64748b]">P0</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('dr.priya.sharma@ntro.gov.in', 'Dr. Priya Sharma', 'Senior Infrared Specialist')}
              className="p-2 rounded-lg bg-[#141b26] hover:bg-[#1c2534] border border-[#222c3c] text-left text-[#cbd5e1] hover:text-white transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-white text-[11px]">Dr. Sharma</div>
                <div className="text-[9px] text-amber-400">IR Specialist</div>
              </div>
              <span className="text-[10px] text-[#64748b]">P1</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
