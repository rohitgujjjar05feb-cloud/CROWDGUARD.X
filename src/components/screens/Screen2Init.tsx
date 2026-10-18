import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, ArrowRight, Activity, Cpu, Map, Bot, AlertOctagon } from 'lucide-react';
import { ScreenId } from '../../types';

interface Screen2InitProps {
  onNext: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen2Init: React.FC<Screen2InitProps> = ({ onNext, onNavigate }) => {
  const [activeItems, setActiveItems] = useState<number[]>([]);

  const statusItems = [
    { title: 'Prediction Engine', detail: 'XGBoost & Time-Series Models Loaded', icon: Activity },
    { title: 'Crowd Simulation', detail: 'Social Force Pedestrian Physics Engine Initialized', icon: Cpu },
    { title: 'Digital Twin', detail: 'Maha Kumbh 3D Venue Geometry & Gates Mapped', icon: Map },
    { title: 'Risk Analysis', detail: 'Real-Time Bottleneck & Cascade Risk Algorithms Active', icon: AlertOctagon },
    { title: 'Decision Copilot', detail: 'Autonomous Incident Response & Reroute AI Online', icon: Bot },
  ];

  useEffect(() => {
    statusItems.forEach((_, index) => {
      setTimeout(() => {
        setActiveItems((prev) => [...prev, index]);
      }, (index + 1) * 350);
    });
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col justify-between p-6 bg-[#040814] overflow-hidden select-none">
      <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />

      {/* Screen Title Pill */}
      <div className="relative z-10 w-full flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-full">
          2. System Initialization
        </span>
        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Subsystems Online
        </span>
      </div>

      {/* Center Initialization Modal Card */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/80 border border-cyan-900/60 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        {/* Left Status List */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Shield className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-wider text-lg text-white">
                <span>CROWDGUARD</span>
                <span className="text-cyan-400">X</span>
              </div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">
                AI CROWD INTELLIGENCE PLATFORM
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
            SYSTEM STATUS
          </div>

          <div className="space-y-3">
            {statusItems.map((item, index) => {
              const isReady = activeItems.includes(index);
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                    isReady
                      ? 'bg-slate-800/80 border-cyan-500/40'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isReady ? 'text-cyan-400' : 'text-slate-600'}`} />
                    <div>
                      <div className="text-xs text-white font-medium">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.detail}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    {isReady ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                        <span className="text-emerald-400 font-bold">READY</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        <span className="text-slate-500">INIT...</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300">System ready. Entering Command Center...</span>
            <span className="text-emerald-400 font-bold">100%</span>
          </div>
        </div>

        {/* Right Wireframe / Isometric Blueprint Art */}
        <div className="relative flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-cyan-950/80 min-h-[340px]">
          {/* Holographic Wireframe Circle Grid */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin [animation-duration:20s]" />
            <div className="absolute inset-4 rounded-full border border-cyan-400/30 border-dashed animate-spin [animation-duration:12s] [animation-direction:reverse]" />
            <div className="absolute inset-10 rounded-full border border-blue-500/40 animate-pulse" />

            {/* Radar scan needle */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-cyan-400/20 to-transparent animate-radar" />
            </div>

            {/* Center Hologram Shield */}
            <Shield className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_20px_#06b6d4]" />
          </div>

          <div className="text-center mt-4">
            <div className="text-xs font-semibold text-slate-200">Maha Kumbh Sector 4 Digital Twin</div>
            <div className="text-[11px] text-slate-400 font-mono">Spatial Mesh & Telemetry Sync: 100%</div>
          </div>

          <button
            onClick={onNext}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <span>Enter Main Command Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 text-center text-xs text-slate-500 font-mono">
        CROWDGUARD X Intelligence Platform • Connected to Telemetry Hub
      </div>
    </div>
  );
};
