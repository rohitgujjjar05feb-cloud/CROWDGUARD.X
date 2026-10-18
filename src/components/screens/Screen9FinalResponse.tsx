import React, { useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScreenId, VenueData } from '../../types';

interface Screen9FinalResponseProps {
  venueData: VenueData;
  onBackToDashboard: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen9FinalResponse: React.FC<Screen9FinalResponseProps> = ({
  venueData,
  onBackToDashboard,
  onNavigate,
}) => {
  useEffect(() => {
    // Trigger celebratory confetti burst
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#3b82f6', '#38bdf8'],
    });
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col justify-between p-6 bg-[#040814] overflow-hidden select-none">
      <div className="absolute inset-0 bg-radial from-emerald-950/20 via-[#040814]/80 to-[#02050e] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />

      {/* Screen Title Pill */}
      <div className="relative z-10 w-full flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-full">
          9. Final Result – Safer Response
        </span>
        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Mitigation Orders Deployed
        </span>
      </div>

      {/* Center Modal / Complete Card (matching image screen 9) */}
      <div className="relative z-10 w-full max-w-3xl mx-auto my-auto flex flex-col items-center text-center bg-slate-900/85 border border-cyan-500/40 rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.2)]">
        {/* Shield Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-cyan-300" />
          </div>
          <span className="text-lg font-black tracking-wider text-white">CROWDGUARD</span>
          <span className="text-lg font-black text-cyan-400">X</span>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-cyan-300 tracking-widest uppercase mb-8">
          SCENARIO COMPLETE
        </h2>

        {/* 4 Metric Badges (matching image screen 9) */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Congestion */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 mb-1">CONGESTION</span>
            <div className="flex items-center gap-1 text-2xl font-black text-emerald-400 font-mono">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <span>24%</span>
            </div>
          </div>

          {/* Risk */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 mb-1">RISK</span>
            <div className="text-base md:text-lg font-black text-emerald-400 font-mono flex items-center gap-1">
              <span className="text-slate-400 text-xs">High</span>
              <span>→</span>
              <span className="text-emerald-400">Low</span>
            </div>
          </div>

          {/* Flow */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 mb-1">FLOW</span>
            <div className="flex items-center gap-1 text-2xl font-black text-emerald-400 font-mono">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>31%</span>
            </div>
          </div>

          {/* Safer Route */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 mb-1">SAFER ROUTE</span>
            <div className="text-base font-black text-cyan-300 font-mono flex items-center gap-1">
              <span>Identified</span>
            </div>
          </div>
        </div>

        {/* Success Alert Box (matching image screen 9) */}
        <div className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-8">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
          </div>
          <div className="text-left">
            <div className="text-xs md:text-sm font-bold text-emerald-200">
              Recommended response applied.
            </div>
            <div className="text-[11px] md:text-xs text-slate-300">
              Crowd movement is now under control. Gate G2 reroute active via G3 East Bypass.
            </div>
          </div>
        </div>

        {/* Back to Dashboard Button (matching image screen 9) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all transform hover:scale-105 cursor-pointer"
          >
            Back to Dashboard
          </button>

          <button
            onClick={() => onNavigate(1)}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Pitch Tour</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 text-center text-xs text-slate-500 font-mono">
        Maha Kumbh 2025 Incident Response Log #084-A • NovaTech AI Solution
      </div>
    </div>
  );
};
