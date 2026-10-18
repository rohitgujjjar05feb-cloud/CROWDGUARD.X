import React from 'react';
import {
  Shield,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Scale,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

export type ViewMode = 'platform' | 'analyzer' | 'storyboard' | 'launch';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedVenue: string;
  onVenueChange: (venueId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  selectedVenue,
  onVenueChange,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#060b17]/95 backdrop-blur-md border-b border-cyan-900/40 px-4 py-2.5">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 max-w-[1600px] mx-auto">
        {/* Left: Branding & Status in Times New Roman */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div
            onClick={() => onViewModeChange('platform')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.8)] transition-all">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-tnr font-black tracking-wider text-lg text-white">CROWDGUARD</span>
                <span className="font-tnr text-cyan-400 font-black text-lg">X</span>
              </div>
              <div className="text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest -mt-1">
                AI Crowd Digital Twin
              </div>
            </div>
          </div>



          {/* System Online Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-medium font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Online</span>
          </div>

          {/* Venue Dropdown with 4 Venue Types: Riverside, Railway, Stadium, Festival */}
          <div className="relative">
            <select
              value={selectedVenue}
              onChange={(e) => onVenueChange(e.target.value)}
              className="appearance-none bg-slate-900 text-cyan-200 text-xs font-semibold pl-3 pr-8 py-1.5 rounded-lg border border-cyan-800/50 hover:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="ujjain-junction">🚆 Venue: Ujjain Junction (Railway Station - Simhastha Hub)</option>
              <option value="kashi-temple">🛕 Venue: Kashi Vishwanath (Temple)</option>
              <option value="kumbh-2025">🌊 Venue: Maha Kumbh (Riverside)</option>
              <option value="grand-stadium">🏟 Venue: Grand Arena (Stadium)</option>
              <option value="horizon-fest">⚡ Venue: Horizon Fest (Music Festival)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Center: Major View Switchers */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-cyan-950">
          <button
            onClick={() => {
              soundManager.playBlip();
              onViewModeChange('platform');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-tnr ${
              viewMode === 'platform'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Command Platform</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBlip();
              onViewModeChange('analyzer');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-tnr ${
              viewMode === 'analyzer'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Before vs After Analyzer</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBlip();
              onViewModeChange('storyboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-tnr ${
              viewMode === 'storyboard'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>9-Screen Storyboard Grid</span>
          </button>
        </div>

        {/* Right Tools: Re-Launch & Sound */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-950/50 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Audio Telemetry' : 'Enable Audio Telemetry'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundManager.playAlert();
              onViewModeChange('launch');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-800/60 text-cyan-300 text-xs font-semibold transition-all cursor-pointer font-tnr"
            title="Re-open Great Launch Screen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Great Launch</span>
          </button>
        </div>
      </div>
    </header>
  );
};
