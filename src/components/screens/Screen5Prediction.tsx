import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertOctagon,
  ArrowUpRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { VenueData, ScreenId } from '../../types';

interface Screen5PredictionProps {
  venueData: VenueData;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen5Prediction: React.FC<Screen5PredictionProps> = ({
  venueData,
  onNavigate,
}) => {
  const chartData = [
    { time: 'Now', density: 68, safeLimit: 75, count: 42580 },
    { time: '+2 min', density: 74, safeLimit: 75, count: 45200 },
    { time: '+5 min', density: 81, safeLimit: 75, count: 48900 },
    { time: '+10 min', density: 88, safeLimit: 75, count: 52400 },
  ];

  const zonePredictions = [
    { name: 'Zone A', status: 'Low', trend: '↑', color: 'emerald' },
    { name: 'Zone B', status: 'High', trend: '↑', color: 'red', isCritical: true },
    { name: 'Zone C', status: 'Medium', trend: '→', color: 'amber' },
    { name: 'Zone D', status: 'Low', trend: '→', color: 'emerald' },
    { name: 'Exit', status: 'Safe', trend: '→', color: 'emerald' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Screen Title Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-full">
            5. Prediction – Upcoming Risk
          </span>
          <span className="text-xs text-slate-400 font-mono">
            AI Multi-Horizon Temporal Density Forecast
          </span>
        </div>
        <button
          onClick={() => onNavigate(6)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
        >
          <span>Open What-If Scenario Lab</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Alert Banner (matching image screen 5) */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-red-900/40 to-slate-900/80 border border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-600/30 border border-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>High Congestion Risk</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                CRITICAL IN +5 MIN
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Zone B will reach critical density in 5 minutes. Gate G2 bottleneck forming rapidly.
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate(6)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <span>Take Action</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Prediction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Chart Area: Zone B Crowd Density (Next 10 Minutes) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-cyan-900/50 rounded-xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Zone B Crowd Density (Next 10 Minutes)</span>
                <span className="text-red-400 font-mono text-xs bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                  Peak: 81%
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                AI prediction based on Gate G2 inflow velocity & Helbing social force density model
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Predicted
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-0.5 bg-amber-400"></span> Threshold (75%)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis
                  domain={[40, 100]}
                  unit="%"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950/95 border border-cyan-800 p-3 rounded-lg shadow-xl text-xs font-mono">
                          <div className="text-slate-400 mb-1">Time Horizon: {data.time}</div>
                          <div className="text-red-400 font-bold text-sm">Density: {data.density}%</div>
                          <div className="text-cyan-300">Predicted Crowd: {data.count.toLocaleString()}</div>
                          <div className="text-amber-400 mt-1">
                            {data.density > 75 ? '⚠️ Critical Hazard Level' : 'Normal Range'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={75}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: 'CRITICAL THRESHOLD (75%)', fill: '#f59e0b', fontSize: 10, position: 'top' }}
                />
                <Area
                  type="monotone"
                  dataKey="density"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#densityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 3 Forecast Badges (matching image screen 5 bottom) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Rising Density</div>
                <div className="text-[10px] text-slate-400">+13% surge in 5 min</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-xs font-semibold text-red-300">Bottleneck Risk</div>
                <div className="text-[10px] text-red-400/80">Gate G2 Choke Point</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <Activity className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Flow Slowdown</div>
                <div className="text-[10px] text-slate-400">Velocity drops to 0.35 m/s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Prediction (Next 10 Minutes) per zone (matching image screen 5) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
              Prediction (Next 10 Minutes)
            </div>

            <div className="space-y-2.5">
              {zonePredictions.map((zp) => (
                <div
                  key={zp.name}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    zp.isCritical
                      ? 'bg-red-950/50 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                      : 'bg-slate-950/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        zp.color === 'red'
                          ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                          : zp.color === 'amber'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-xs font-medium text-slate-200">{zp.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                    <span
                      className={
                        zp.color === 'red'
                          ? 'text-red-400'
                          : zp.color === 'amber'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {zp.status}
                    </span>
                    <span
                      className={`text-sm ${
                        zp.color === 'red'
                          ? 'text-red-400 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {zp.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Cascade Explanation */}
            <div className="mt-4 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-cyan-300">Cascade Propagation:</div>
              <div>
                If Gate G2 is not throttled, Zone B overflow will spill into Zone C and block the main exit corridor within 8 minutes.
              </div>
            </div>

            <button
              onClick={() => onNavigate(6)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Mitigation Scenarios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
