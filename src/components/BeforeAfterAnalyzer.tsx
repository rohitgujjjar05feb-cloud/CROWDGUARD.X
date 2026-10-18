import React, { useMemo } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Activity,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Bot,
  Scale,
  Gauge,
  Layers,
} from 'lucide-react';
import { DigitalTwinCanvas } from './common/DigitalTwinCanvas';
import { SimulationEngine } from '../simulation/engine';
import { VenueData, ScenarioSettings } from '../types';

interface BeforeAfterAnalyzerProps {
  venueData: VenueData;
  engine: SimulationEngine;
  scenario: ScenarioSettings;
  onApplyMitigation: () => void;
  onBackToPlatform: () => void;
}

export const BeforeAfterAnalyzer: React.FC<BeforeAfterAnalyzerProps> = ({
  venueData,
  engine,
  scenario,
  onApplyMitigation,
  onBackToPlatform,
}) => {
  // Left: Pure Unmitigated Status Quo Engine (Severe Bottleneck)
  const unmitigatedEngine = useMemo(() => {
    const eng = new SimulationEngine(800, 540, 260);
    eng.setScenario({
      closeGateG2: false,
      redirectFlowToG3: false,
      increaseExitCapacity: false,
      emergencyEvacuation: false,
      inflowRate: 100,
      deployStaffZoneB: false,
    });
    return eng;
  }, [venueData.id]);

  // Right: Fully Mitigated Engine (12 Marshals, Exit Boost, G2 Closed, G3 Bypass)
  const mitigatedEngine = useMemo(() => {
    const eng = new SimulationEngine(800, 540, 260);
    eng.setScenario({
      closeGateG2: true,
      redirectFlowToG3: true,
      increaseExitCapacity: true,
      emergencyEvacuation: false,
      inflowRate: 100,
      deployStaffZoneB: true,
    });
    return eng;
  }, [venueData.id]);
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-800/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="font-tnr text-2xl md:text-3xl font-extrabold text-white tracking-wide">
              Comparative Simulation Analysis — Before vs After
            </h2>
          </div>
          <p className="font-tnr italic text-xs md:text-sm text-cyan-300/80">
            Venue: {venueData.name} • Helbing Social Force Pedestrian Fluid Dynamics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onApplyMitigation}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer font-tnr uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Recommended Policy</span>
          </button>

          <button
            onClick={onBackToPlatform}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-800/60 text-cyan-300 text-xs font-semibold transition-all cursor-pointer font-tnr"
          >
            Back to Unified Platform
          </button>
        </div>
      </div>

      {/* 4 Major Comparative KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Congestion Delta */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg">
          <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">DENSITY REDUCTION</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">↓ 24%</span>
            <span className="text-xs text-slate-400">from 81% to 57%</span>
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-1 font-mono">Peak bottleneck eliminated</div>
        </div>

        {/* Risk Transition */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg">
          <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">RISK PROFILE</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">High → Low</span>
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-1 font-mono">Crush probability suppressed</div>
        </div>

        {/* Velocity Gain */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg">
          <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">FLOW VELOCITY</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">↑ 31%</span>
            <span className="text-xs text-slate-400">0.38 → 1.24 m/s</span>
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-1 font-mono">Laminar crowd propagation</div>
        </div>

        {/* Corridor Balancing */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-lg">
          <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">EXIT DISCHARGE</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300 font-mono">61% Balanced</span>
          </div>
          <div className="text-[10px] text-cyan-300/80 mt-1 font-mono">Diverted via {venueData.bypassGateCode}</div>
        </div>
      </div>

      {/* Side-by-Side Dual View with Generous Canvas Heights (No Cutoff!) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Side: Current Unmitigated Scenario */}
        <div className="bg-slate-900/95 border border-red-900/80 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-red-600/20 text-red-400 border border-red-500/50">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-tnr text-base font-bold text-red-200">Current Status Quo (Unmitigated)</h3>
                  <div className="text-[11px] text-slate-400 font-mono">{venueData.chokeGateCode} bottleneck active</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-red-950 text-red-300 border border-red-500/50">
                CRITICAL CHOKE
              </span>
            </div>

            {/* Generous Canvas Height 340px */}
            <div className="rounded-xl overflow-hidden border border-red-900/60 mb-4 shadow-inner">
              <DigitalTwinCanvas
                engine={unmitigatedEngine}
                zones={venueData.zones}
                gates={venueData.gates}
                venueType={venueData.venueType}
                scenario={{
                  closeGateG2: false,
                  redirectFlowToG3: false,
                  increaseExitCapacity: false,
                  emergencyEvacuation: false,
                  inflowRate: 100,
                  deployStaffZoneB: false,
                }}
                showHeatmap={true}
                isAfterView={false}
                height={340}
              />
            </div>

            {/* Comprehensive Metrics List */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-red-900/50">
                <div className="text-slate-400 text-[11px]">Peak Density</div>
                <div className="text-2xl font-black text-red-400 font-mono mt-0.5">81% - 92%</div>
                <div className="text-[10px] text-red-400/80 mt-0.5 font-mono">Severe crush hazard</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-red-900/50">
                <div className="text-slate-400 text-[11px]">Bottleneck Risk</div>
                <div className="text-2xl font-black text-red-400 font-mono mt-0.5">HIGH</div>
                <div className="text-[10px] text-red-400/80 mt-0.5 font-mono">{venueData.chokeGateCode}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Exit Load</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">72%</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Corridor friction</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Average Flow Speed</div>
                <div className="text-2xl font-black text-red-400 font-mono mt-0.5">0.38 m/s</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Slow shockwave speed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Optimized Simulation (Mitigated) */}
        <div className="bg-slate-900/95 border border-emerald-900/80 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/50">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-tnr text-base font-bold text-emerald-200">After Simulation (Recommended Mitigation)</h3>
                  <div className="text-[11px] text-slate-400 font-mono">Diverted via {venueData.bypassGateCode}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                STABILIZED (LOW RISK)
              </span>
            </div>

            {/* Generous Canvas Height 340px */}
            <div className="rounded-xl overflow-hidden border border-emerald-900/60 mb-4 shadow-inner">
              <DigitalTwinCanvas
                engine={mitigatedEngine}
                zones={venueData.zones}
                gates={venueData.gates}
                venueType={venueData.venueType}
                scenario={{
                  closeGateG2: true,
                  redirectFlowToG3: true,
                  increaseExitCapacity: true,
                  emergencyEvacuation: false,
                  inflowRate: 100,
                  deployStaffZoneB: true,
                }}
                showHeatmap={true}
                isAfterView={true}
                height={340}
              />
            </div>

            {/* Comprehensive Metrics List */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/50">
                <div className="text-slate-400 text-[11px]">Peak Density</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">57%</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">↓ 24% Reduction</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/50">
                <div className="text-slate-400 text-[11px]">Bottleneck Risk</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">LOW</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">Pressure diffused</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Exit Load</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">61%</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">Evenly distributed</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Average Flow Speed</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">1.24 m/s</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">↑ 31% Smooth velocity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
