import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Zap,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Bot,
} from 'lucide-react';
import { DigitalTwinCanvas } from '../common/DigitalTwinCanvas';
import { SimulationEngine } from '../../simulation/engine';
import { VenueData, ScreenId, ScenarioSettings } from '../../types';

interface Screen7BeforeAfterProps {
  venueData: VenueData;
  engine: SimulationEngine;
  scenario: ScenarioSettings;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen7BeforeAfter: React.FC<Screen7BeforeAfterProps> = ({
  venueData,
  engine,
  scenario,
  onNavigate,
}) => {
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Screen Title Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-full">
            7. Simulation Results – Before vs After
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Social Force Simulation Run #084 • Comparative Analysis
          </span>
        </div>
        <button
          onClick={() => onNavigate(8)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>Consult AI Decision Copilot</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Side-by-Side Comparison Container (matching image screen 7) */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Left Side: Current Scenario (Unmitigated) */}
        <div className="bg-slate-900/80 border border-red-900/60 rounded-xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-red-600/20 text-red-400 border border-red-500/40">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-sm font-bold text-red-200">Current Scenario</span>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
              UNMITIGATED
            </span>
          </div>

          {/* Canvas Preview - High Congestion Heatmap */}
          <div className="relative rounded-lg overflow-hidden border border-red-900/50 mb-4 h-56">
            <DigitalTwinCanvas
              engine={engine}
              zones={venueData.zones}
              gates={venueData.gates}
              showHeatmap={true}
              isAfterView={false}
              height={224}
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-red-900/40">
              <div className="text-[11px] text-slate-400">Zone B Density</div>
              <div className="text-xl font-black text-red-400 font-mono">81%</div>
              <div className="text-[10px] text-red-400/80">Hazard Level</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-red-900/40">
              <div className="text-[11px] text-slate-400">Bottleneck Risk</div>
              <div className="text-xl font-black text-red-400 font-mono">High</div>
              <div className="text-[10px] text-red-400/80">Gate G2 Inflow Choke</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Exit Load</div>
              <div className="text-xl font-black text-amber-400 font-mono">72%</div>
              <div className="text-[10px] text-slate-400">Corridor Stress</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Flow Speed</div>
              <div className="text-xl font-black text-red-400 font-mono">Slow</div>
              <div className="text-[10px] text-slate-400">~0.38 m/s (Crush Risk)</div>
            </div>
          </div>
        </div>

        {/* Center VS Badge */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-950 border-2 border-cyan-400 items-center justify-center font-black text-xs text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)]">
          VS
        </div>

        {/* Right Side: After Simulation (Recommended) */}
        <div className="bg-slate-900/80 border border-emerald-900/60 rounded-xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="text-sm font-bold text-emerald-200">
                After Simulation (Recommended)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
              OPTIMIZED
            </span>
          </div>

          {/* Canvas Preview - Dispersed Smooth Flow */}
          <div className="relative rounded-lg overflow-hidden border border-emerald-900/50 mb-4 h-56">
            <DigitalTwinCanvas
              engine={engine}
              zones={venueData.zones}
              gates={venueData.gates}
              scenario={scenario}
              showHeatmap={true}
              isAfterView={true}
              height={224}
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-emerald-900/40">
              <div className="text-[11px] text-slate-400">Zone B Density</div>
              <div className="text-xl font-black text-emerald-400 font-mono">57%</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                <span>-24% Reduction</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-emerald-900/40">
              <div className="text-[11px] text-slate-400">Bottleneck Risk</div>
              <div className="text-xl font-black text-emerald-400 font-mono">Low</div>
              <div className="text-[10px] text-emerald-400">Pressure Relieved</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Exit Load</div>
              <div className="text-xl font-black text-emerald-400 font-mono">61%</div>
              <div className="text-[10px] text-emerald-400">Evenly Balanced</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Flow Speed</div>
              <div className="text-xl font-black text-emerald-400 font-mono">Better</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>~1.24 m/s (Smooth)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Banner (matching image screen 7 bottom) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-cyan-950/60 border border-emerald-500/40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-200">
            Simulation complete. Safer and smoother crowd flow achieved.
          </div>
        </div>

        <button
          onClick={() => onNavigate(8)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Review with AI Decision Copilot</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
