import React from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Flame,
  Bot,
  Lightbulb,
  Check,
  Cpu,
  MapPin,
  HelpCircle,
  FlaskConical,
} from 'lucide-react';
import { VenueData, ScenarioSettings } from '../types';

interface StoryboardViewProps {
  venueData: VenueData;
  scenario: ScenarioSettings;
  onSelectScreen?: (screenNumber: number) => void;
  onApplyMitigation: () => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  venueData,
  scenario,
  onSelectScreen,
  onApplyMitigation,
}) => {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Overview Header in Times New Roman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyan-800/40 pb-4">
        <div>
          <h2 className="font-tnr text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-cyan-400" />
            <span>CROWDGUARD X — Full System Architecture Storyboard</span>
          </h2>
          <p className="font-tnr italic text-xs md:text-sm text-cyan-300/90 mt-1">
            End-to-End Operational Lifecycle: Monitor → Predict → Simulate → Decide (SISTec Hackathon IS-15)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            All 9 Operational Modules Active
          </span>
        </div>
      </div>

      {/* 9-Panel Grid (Matching the User's Image Layout: 3x3 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* PANEL 1: Launch Screen – CROWDGUARD X */}
        <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
            <span className="font-bold">1. Launch Screen – CROWDGUARD X</span>
            <span className="text-slate-500">INIT</span>
          </div>

          <div className="my-auto py-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] mb-2">
              <Shield className="w-6 h-6 text-cyan-300" />
            </div>
            <div className="font-tnr text-base font-extrabold text-white tracking-wider">
              CROWDGUARD <span className="text-cyan-400">X</span>
            </div>
            <div className="text-[10px] text-cyan-300 font-mono tracking-widest uppercase mb-3">
              PREDICT • SIMULATE • PROTECT
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800 mb-1">
              <div className="bg-cyan-400 h-full rounded-full w-[72%]" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Initializing system... 72%</div>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-300 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1 text-emerald-400">✓ Venue Model Loaded</span>
            <span className="flex items-center gap-1 text-emerald-400">✓ Prediction Ready</span>
            <span className="flex items-center gap-1 text-emerald-400">✓ Simulation Ready</span>
            <span className="flex items-center gap-1 text-emerald-400">✓ Copilot Ready</span>
          </div>
        </div>

        {/* PANEL 2: System Initialization */}
        <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
            <span className="font-bold">2. System Initialization</span>
            <span className="text-emerald-400">100%</span>
          </div>

          <div className="space-y-1.5 my-auto">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              SYSTEM STATUS
            </div>
            {[
              'Prediction Engine',
              'Crowd Simulation',
              'Digital Twin',
              'Risk Analysis',
              'Decision Copilot',
            ].map((sub) => (
              <div key={sub} className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/60 border border-slate-800 text-[10px]">
                <span className="text-slate-300">{sub}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> READY
                </span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-cyan-300 font-mono pt-2 border-t border-slate-800 flex justify-between">
            <span>Entering Command Center...</span>
            <span className="text-emerald-400 font-bold">100%</span>
          </div>
        </div>

        {/* PANEL 3: Main Dashboard */}
        <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
            <span className="font-bold">3. Main Dashboard</span>
            <span className="text-amber-400">Medium Risk</span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">Total Crowd</div>
              <div className="text-base font-black text-white font-mono">{venueData.totalCrowd.toLocaleString()}</div>
              <div className="text-[9px] text-cyan-400">↑ 12% in 15m</div>
            </div>
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">Avg. Density</div>
              <div className="text-base font-black text-white font-mono">{venueData.avgDensity}%</div>
              <div className="text-[9px] text-cyan-400">↑ 8% rising</div>
            </div>
            <div className="p-2 rounded bg-slate-950/70 border border-amber-500/30">
              <div className="text-[10px] text-slate-400">Risk Level</div>
              <div className="text-sm font-black text-amber-400 font-mono">Medium</div>
              <div className="text-[9px] text-amber-300">Gate G2 Alert</div>
            </div>
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-400">Next Horizon</div>
              <div className="text-sm font-black text-cyan-300 font-mono">+5 min</div>
              <div className="text-[9px] text-slate-400">Forecast loop</div>
            </div>
          </div>

          <div className="p-2 rounded bg-red-950/60 border border-red-500/40 text-[10px] text-red-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Zone B density rising. Predicted bottleneck in 5 min.</span>
          </div>
        </div>

        {/* PANEL 4: Digital Twin – Live Venue View */}
        <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
            <span className="font-bold">4. Digital Twin – Live Venue View</span>
            <span className="text-cyan-300">Sector 4 & 5</span>
          </div>

          <div className="space-y-1.5 my-auto">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              ZONE STATUS
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/60 text-[10px]">
              <span className="text-slate-300">Zone A (North Approach)</span>
              <span className="text-emerald-400 font-mono">Low (24%)</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded bg-red-950/50 border border-red-500/40 text-[10px]">
              <span className="text-red-200 font-bold">Zone B (Main Ghat/Temple)</span>
              <span className="text-red-400 font-mono font-bold">High (81%)</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/60 text-[10px]">
              <span className="text-slate-300">Zone C (Plaza / Food)</span>
              <span className="text-amber-400 font-mono">Medium (54%)</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/60 text-[10px]">
              <span className="text-slate-300">Zone D (East Transit)</span>
              <span className="text-emerald-400 font-mono">Low (32%)</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/60 text-[10px]">
              <span className="text-slate-300">Exit (South Pier)</span>
              <span className="text-emerald-400 font-mono">Safe (18%)</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
            Gates: G1 (Open), G2 (Congested Choke), G3 (Bypass Reserve)
          </div>
        </div>

        {/* PANEL 5: Prediction – Upcoming Risk */}
        <div className="bg-slate-900/90 border border-red-900/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-red-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-red-400 mb-2">
            <span className="font-bold">5. Prediction – Upcoming Risk</span>
            <span className="bg-red-950/70 border border-red-500/40 px-1.5 py-0.5 rounded text-[9px]">CRITICAL</span>
          </div>

          <div className="my-auto space-y-2">
            <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-[11px] text-red-300">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>High Congestion Risk</span>
              </div>
              Zone B will reach critical density in 5 minutes.
            </div>

            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-[10px] font-mono">
              <div className="text-slate-400 mb-1">Density Timeline (+10 Min Projection):</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Now: 68%</span>
                <span className="text-amber-400">+2m: 74%</span>
                <span className="text-red-400 font-bold">+5m: 81%</span>
                <span className="text-red-500 font-black">+10m: 88%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-slate-400 pt-2 border-t border-slate-800 text-center">
            <span>📈 Rising Density</span>
            <span className="text-red-400">⚠️ Bottleneck Choke</span>
            <span>📉 Flow Drops</span>
          </div>
        </div>

        {/* PANEL 6: What-If Scenario */}
        <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
            <span className="font-bold">6. What-If Scenario (Lab)</span>
            <span className="text-cyan-300">SANDBOX</span>
          </div>

          <div className="space-y-1.5 my-auto">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              SCENARIO SETTINGS
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-cyan-950/40 border border-cyan-500/40 text-[10px] text-white">
              <Check className="w-3 h-3 text-cyan-400" />
              <span>Close Gate G2 (Halt Inbound Choke)</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-cyan-950/40 border border-cyan-500/40 text-[10px] text-white">
              <Check className="w-3 h-3 text-cyan-400" />
              <span>Redirect flow to G3 (East Bypass)</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400">
              <span className="w-3 h-3 rounded-sm border border-slate-600 inline-block"></span>
              <span>Increase exit capacity</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400">
              <span className="w-3 h-3 rounded-sm border border-slate-600 inline-block"></span>
              <span>Emergency evacuation</span>
            </div>
          </div>

          <div className="text-[10px] text-emerald-400 font-mono pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Reroute Flow Computed</span>
            <span className="font-bold">Sim Ready →</span>
          </div>
        </div>

        {/* PANEL 7: Simulation Results – Before vs After */}
        <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
            <span className="font-bold">7. Simulation Results – Before vs After</span>
            <span className="text-emerald-400">VS</span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            {/* Before */}
            <div className="p-2 rounded bg-red-950/40 border border-red-500/30 text-[10px]">
              <div className="font-bold text-red-300 mb-1">Before Simulation</div>
              <div className="text-slate-300">Density: <span className="font-mono text-red-400 font-bold">81%</span></div>
              <div className="text-slate-300">Risk: <span className="font-mono text-red-400">High</span></div>
              <div className="text-slate-300">Flow: <span className="font-mono text-red-400">Slow (0.38 m/s)</span></div>
            </div>

            {/* After */}
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px]">
              <div className="font-bold text-emerald-300 mb-1">After (Recommended)</div>
              <div className="text-slate-300">Density: <span className="font-mono text-emerald-400 font-bold">57%</span></div>
              <div className="text-slate-300">Risk: <span className="font-mono text-emerald-400">Low</span></div>
              <div className="text-slate-300">Flow: <span className="font-mono text-emerald-400">Better (1.2 m/s)</span></div>
            </div>
          </div>

          <div className="text-[10px] text-slate-300 font-mono pt-2 border-t border-slate-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Safer and smoother crowd flow achieved.</span>
          </div>
        </div>

        {/* PANEL 8: AI Decision Copilot */}
        <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
            <span className="font-bold">8. AI Decision Copilot</span>
            <span className="text-emerald-400 font-bold">RECOMMENDED</span>
          </div>

          <div className="space-y-2 my-auto">
            <div className="p-2 rounded bg-slate-950/80 border border-cyan-500/40 text-[10px] space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended Action:</span>
              </div>
              <div className="text-slate-200">• Close Gate G2 temporarily</div>
              <div className="text-slate-200">• Redirect crowd through Gate G3</div>
              <div className="text-slate-200">• Deploy additional staff in Zone B</div>
              <div className="text-emerald-400 font-bold pt-1">
                Reduces congestion risk by 62% in 10 minutes.
              </div>
            </div>

            <div className="text-[9px] text-slate-400 space-y-0.5">
              <div>• Why: Zone B density rising (81%)</div>
              <div>• Why: Simulation shows better flow with G2 closed</div>
              <div>• Why: Safer route identified via Gate G3</div>
            </div>
          </div>

          <button
            onClick={onApplyMitigation}
            className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shadow transition-all cursor-pointer"
          >
            Apply Suggestion
          </button>
        </div>

        {/* PANEL 9: Final Result – Safer Response */}
        <div className="bg-slate-900/90 border border-emerald-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-2">
            <span className="font-bold">9. Final Result – Safer Response</span>
            <span className="text-emerald-400 font-bold">COMPLETE</span>
          </div>

          <div className="my-auto space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-1.5 rounded bg-slate-950/70 border border-emerald-500/30">
                <div className="text-[9px] text-slate-400">CONGESTION</div>
                <div className="text-sm font-black text-emerald-400 font-mono">↓ 24%</div>
              </div>
              <div className="p-1.5 rounded bg-slate-950/70 border border-emerald-500/30">
                <div className="text-[9px] text-slate-400">RISK</div>
                <div className="text-xs font-black text-emerald-400 font-mono">High → Low</div>
              </div>
              <div className="p-1.5 rounded bg-slate-950/70 border border-emerald-500/30">
                <div className="text-[9px] text-slate-400">FLOW</div>
                <div className="text-sm font-black text-emerald-400 font-mono">↑ 31%</div>
              </div>
              <div className="p-1.5 rounded bg-slate-950/70 border border-emerald-500/30">
                <div className="text-[9px] text-slate-400">SAFER ROUTE</div>
                <div className="text-xs font-black text-cyan-300 font-mono">Identified</div>
              </div>
            </div>

            <div className="p-2 rounded bg-emerald-950/50 border border-emerald-500/50 text-[10px] text-emerald-200 text-center font-medium">
              ✓ Recommended response applied. Crowd movement is now under control.
            </div>
          </div>

          <div className="text-[10px] text-cyan-400 font-mono pt-2 border-t border-slate-800 text-center">
            Mission Successfully Resolved
          </div>
        </div>
      </div>
    </div>
  );
};
