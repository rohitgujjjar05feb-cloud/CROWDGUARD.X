import React, { useState } from 'react';
import { Shield, ArrowRight, Activity, Users, Flame, Navigation, AlertTriangle, Layers } from 'lucide-react';
import { DigitalTwinCanvas } from '../common/DigitalTwinCanvas';
import { SimulationEngine } from '../../simulation/engine';
import { VenueData, ScreenId, Zone } from '../../types';

interface Screen4DigitalTwinProps {
  venueData: VenueData;
  engine: SimulationEngine;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen4DigitalTwin: React.FC<Screen4DigitalTwinProps> = ({
  venueData,
  engine,
  onNavigate,
}) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(venueData.zones[1]); // Default to Zone B
  const [agentBurstCount, setAgentBurstCount] = useState(0);

  const handleTriggerSurge = () => {
    // Add 50 more agents to demonstrate surge
    for (let i = 0; i < 50; i++) {
      engine.agents.push(engine.createAgent(engine.agents.length + i, false));
    }
    setAgentBurstCount((prev) => prev + 50);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'High':
      case 'Critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Low</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Safe</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Screen Title Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-full">
            4. Digital Twin – Live Venue View
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Real-time Spatial Mesh & Telemetry Synchronization
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerSurge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-700/50 text-cyan-300 text-xs font-medium transition-all"
          >
            <span>+ Simulate Inflow Surge</span>
            {agentBurstCount > 0 && <span className="text-[10px] text-cyan-400 font-mono">(+{agentBurstCount})</span>}
          </button>
          <button
            onClick={() => onNavigate(5)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          >
            <span>View Upcoming Risk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Zone Status Panel (matching image screen 4) + Center Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Zone Status */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Zone Status</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="space-y-2">
              {venueData.zones.map((zone) => {
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: zone.color }}
                      ></span>
                      <span className="text-xs font-medium text-slate-200">{zone.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{zone.density}%</span>
                      {getStatusBadge(zone.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Zone Deep Dive */}
          {selectedZone && (
            <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 shadow-lg backdrop-blur-sm">
              <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>{selectedZone.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400">Capacity</div>
                  <div className="font-mono font-bold text-white">{selectedZone.capacity.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400">Current Occupancy</div>
                  <div className="font-mono font-bold text-cyan-300">{selectedZone.currentCount.toLocaleString()}</div>
                </div>
              </div>
              {selectedZone.id === 'zone-b' && (
                <div className="p-2.5 rounded bg-red-950/50 border border-red-500/40 text-[11px] text-red-300">
                  <div className="font-bold flex items-center gap-1 mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Bottleneck Detected</span>
                  </div>
                  Inflow from Gate G2 exceeds corridor capacity. Speed reduced to 0.35 m/s.
                </div>
              )}
            </div>
          )}

          {/* Venue Card Thumbnail (matching image screen 4 bottom-left) */}
          <div className="bg-gradient-to-b from-slate-900/90 to-cyan-950/40 border border-cyan-900/50 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
            <div className="h-24 w-full rounded-lg bg-cover bg-center mb-2.5 flex items-end p-2 border border-cyan-800/40"
                 style={{ backgroundImage: 'linear-gradient(to top, rgba(8,13,26,0.9), transparent), radial-gradient(circle at center, #0284c7 0%, #070d18 100%)' }}>
              <span className="text-[10px] font-mono text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/40">
                LIVE 60 FPS
              </span>
            </div>
            <div className="text-xs font-bold text-white">Maha Kumbh 2025</div>
            <div className="text-[11px] text-cyan-400 font-mono">Digital Twin • Sector 4 & 5</div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="lg:col-span-8 xl:col-span-9">
          <DigitalTwinCanvas
            engine={engine}
            zones={venueData.zones}
            gates={venueData.gates}
            selectedZoneId={selectedZone?.id}
            onZoneSelect={(zone) => setSelectedZone(zone)}
            height={560}
          />
        </div>
      </div>
    </div>
  );
};
