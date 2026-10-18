import React from 'react';
import { Users, Activity, AlertTriangle, Clock, ArrowRight, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import { DigitalTwinCanvas } from '../common/DigitalTwinCanvas';
import { SimulationEngine } from '../../simulation/engine';
import { VenueData, ScreenId } from '../../types';

interface Screen3DashboardProps {
  venueData: VenueData;
  engine: SimulationEngine;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen3Dashboard: React.FC<Screen3DashboardProps> = ({
  venueData,
  engine,
  onNavigate,
}) => {
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Screen Title Pill & Quick Venue Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-full">
            3. Main Dashboard
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {venueData.name} ({venueData.tagline})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(5)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-medium transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Active Risk Warning</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards (matching image screen 3 top) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Crowd */}
        <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Crowd</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {venueData.totalCrowd.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium mt-1">
            <span>↑ 12%</span>
            <span className="text-slate-400 font-normal">in last 15 min</span>
          </div>
        </div>

        {/* Avg. Density */}
        <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg. Density</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {venueData.avgDensity}%
          </div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium mt-1">
            <span>↑ 8%</span>
            <span className="text-slate-400 font-normal">approaching surge</span>
          </div>
        </div>

        {/* Risk Level (Amber badge with triangle) */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Risk Level</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></div>
            <div className="text-2xl lg:text-3xl font-black text-amber-400 tracking-tight">
              {venueData.riskLevel}
            </div>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1 font-mono">
            Zone B choke hazard
          </div>
        </div>

        {/* Next Prediction */}
        <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Next Prediction</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black text-cyan-300 tracking-tight font-mono">
            {venueData.nextPredictionTime}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Short-horizon forecast cycle
          </div>
        </div>
      </div>

      {/* Main Center Canvas with Floating Alert (matching image screen 3) */}
      <div className="relative">
        <DigitalTwinCanvas
          engine={engine}
          zones={venueData.zones}
          gates={venueData.gates}
          height={520}
          onZoneSelect={() => onNavigate(4)}
        />

        {/* Floating Bottom-Right Alert Pill (Screen 3 visual match) */}
        <div
          onClick={() => onNavigate(5)}
          className="absolute bottom-4 left-4 sm:left-auto sm:right-4 z-20 flex items-center gap-3 bg-red-950/90 hover:bg-red-900/90 border border-red-500/80 text-white p-3.5 rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.5)] backdrop-blur-md cursor-pointer transition-all transform hover:scale-[1.02] max-w-sm"
        >
          <div className="w-9 h-9 rounded-lg bg-red-600/30 border border-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-300 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-red-200">Zone B density is rising</div>
            <div className="text-[11px] text-slate-300">Predicted bottleneck in 5 minutes.</div>
          </div>
          <ArrowRight className="w-4 h-4 text-red-300 shrink-0 ml-auto" />
        </div>
      </div>

      {/* Quick Access Action Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <button
          onClick={() => onNavigate(4)}
          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-cyan-900/40 text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div className="text-xs font-semibold">Inspect Live Venue Twin</div>
              <div className="text-[10px] text-slate-400">Examine Zone A to D telemetry</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigate(5)}
          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-red-900/40 text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-red-400" />
            <div className="text-left">
              <div className="text-xs font-semibold">Prediction Analytics (+10 min)</div>
              <div className="text-[10px] text-slate-400">View density growth curves</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigate(6)}
          className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900/80 hover:to-blue-900/80 border border-cyan-500/40 text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <div className="text-left">
              <div className="text-xs font-semibold">Run What-If Simulation</div>
              <div className="text-[10px] text-cyan-300/80">Test Gate G2 closure & detour</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-300" />
        </button>
      </div>
    </div>
  );
};
