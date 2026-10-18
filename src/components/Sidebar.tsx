import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  Cpu,
  FlaskConical,
  AlertTriangle,
  FileText,
  Settings,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { ScreenId } from '../types';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate }) => {
  const menuItems = [
    { id: 3 as ScreenId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 4 as ScreenId, label: 'Live Map', icon: MapPin },
    { id: 5 as ScreenId, label: 'Predictions', icon: TrendingUp },
    { id: 6 as ScreenId, label: 'What-If Lab', icon: FlaskConical },
    { id: 7 as ScreenId, label: 'Simulation', icon: Cpu },
    { id: 8 as ScreenId, label: 'Decision Copilot', icon: Bot },
    { id: 9 as ScreenId, label: 'Risk Response', icon: AlertTriangle },
  ];

  const secondaryItems = [
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-16 md:w-56 bg-[#070e1b] border-r border-cyan-950/60 flex flex-col justify-between py-4 shrink-0 transition-all">
      <div className="space-y-1 px-2 md:px-3">
        <div className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider px-3 mb-2 hidden md:block">
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="hidden md:inline truncate">{item.label}</span>
              {item.id === 5 && (
                <span className="hidden md:inline-flex ml-auto text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-mono">
                  ALERT
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary items & Status */}
      <div className="px-2 md:px-3 pt-4 border-t border-slate-900 space-y-1">
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => alert(`${item.label} module ready. Use presentation flow for hackathon demonstration.`)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500" />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}

        <div className="hidden md:block mt-4 p-2.5 rounded-lg bg-gradient-to-b from-slate-900/90 to-cyan-950/30 border border-cyan-900/30">
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Twin V2.4</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Social Force Pedestrian Engine active. 42k telemetry nodes.
          </div>
        </div>
      </div>
    </aside>
  );
};
