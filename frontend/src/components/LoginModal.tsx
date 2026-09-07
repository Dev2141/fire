import React, { useState } from 'react';
import { Flame, Lock, ShieldCheck, Mail, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AnalystUser } from '../types';
import { SATELLITE_IMAGES } from '../data/generatedData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnalyst: AnalystUser;
  onLoginSuccess: (analyst: AnalystUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentAnalyst,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('capt.r.vance@ntro.gov.in');
  const [password, setPassword] = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        ...currentAnalyst,
        email,
        isAuthenticated: true,
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Background Image: Deep Space / Orbital Atmosphere */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${SATELLITE_IMAGES.earthNight})` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-[#10141a] via-[#10141a]/60 to-transparent" />

      {/* Floating Card Matching Image 3 */}
      <div className="relative z-10 w-full max-w-md bg-[#181c22]/90 backdrop-blur-xl border border-[#262a31] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        {/* Close button if user just inspecting */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#a98a7d] hover:text-white text-xs font-mono transition-colors"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff6b00] to-[#93000a] p-0.5 shadow-xl shadow-[#ff6b00]/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#10141a] rounded-[14px] flex items-center justify-center">
              <Flame className="w-7 h-7 text-[#ff6b00] animate-pulse" />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              AGNI<span className="text-[#ff6b00]">—</span>DRISHTI
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#ff6b00]/20 text-[#ffb693] border border-[#ff6b00]/40 rounded font-bold">
                अग्नि-दृष्टि
              </span>
            </h1>
            <div className="text-xs font-mono font-bold text-[#ffb693] tracking-wider mt-1 uppercase">
              ANALYST ACCESS
            </div>
            <p className="text-[11px] text-[#a98a7d] mt-1 font-mono">
              National Technical Research Organisation (NTRO) // SAC
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-[#dfe2eb] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#ff6b00]" />
              GOVERNMENT EMAIL / SERVICE ID
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst.callsign@gov.in"
              className="w-full bg-[#10141a] border border-[#262a31] text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:border-[#ff6b00] focus:outline-none placeholder:text-[#a98a7d]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <label className="font-semibold text-[#dfe2eb] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#ff6b00]" />
                SECURITY TOKEN / BIOMETRIC KEY
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Contact NTRO Security Operations Center: soc@ntro.gov.in"); }} className="text-[#ffb693] hover:underline text-[11px]">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter RSA SecurID Token"
                className="w-full bg-[#10141a] border border-[#262a31] text-white rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono focus:border-[#ff6b00] focus:outline-none placeholder:text-[#a98a7d]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#a98a7d] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer text-[#a98a7d]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#ff6b00] rounded"
              />
              <span>Remember clearance</span>
            </label>

            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              PKI 4096-BIT
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] hover:from-[#e56000] hover:to-[#ff6b00] text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-[#ff6b00]/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AUTHENTICATING WITH NTRO GATEWAY...
              </span>
            ) : (
              <span>SIGN IN TO CONSOLE &rarr;</span>
            )}
          </button>
        </form>

        {/* Confidential System Legal Notice */}
        <div className="pt-2 border-t border-[#262a31] text-[9px] font-mono text-[#a98a7d] text-center leading-relaxed">
          SECURITY PROTOCOL // CONFIDENTIAL GOVERNMENT SYSTEM // UNAUTHORIZED ACCESS IS A PUNISHABLE OFFENSE UNDER SECTION 66 OF THE IT ACT, 2000.
        </div>
      </div>
    </div>
  );
};
