import React, { useState } from 'react';
import {
  FlaskConical,
  ArrowRight,
  Play,
  RotateCcw,
  CheckSquare,
  Square,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { DigitalTwinCanvas } from '../common/DigitalTwinCanvas';
import { SimulationEngine } from '../../simulation/engine';
import { VenueData, ScreenId, ScenarioSettings } from '../../types';

interface Screen6WhatIfProps {
  venueData: VenueData;
  engine: SimulationEngine;
  scenario: ScenarioSettings;
  onScenarioChange: (scenario: ScenarioSettings) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen6WhatIf: React.FC<Screen6WhatIfProps> = ({
  venueData,
  engine,
  scenario,
  onScenarioChange,
  onNavigate,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);

  const toggleSetting = (key: keyof ScenarioSettings) => {
    const updated = {
      ...scenario,
      [key]: !scenario[key],
    };
    onScenarioChange(updated);
    engine.setScenario(updated);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    // Fast forward simulation speed
    engine.setSpeed(2.0);
    setTimeout(() => {
      setIsSimulating(false);
      engine.setSpeed(1.0);
      onNavigate(7); // Advance to Before vs After
    }, 1200);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Screen Title Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-full">
            6. What-If Scenario
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Interactive Incident Sandbox & Counter-factual Modeling
          </span>
        </div>
        <div className="text-xs font-mono text-cyan-300">
          Venue: {venueData.name}
        </div>
      </div>

      {/* Main Grid: Scenario Settings on Left + Scenario Preview Canvas on Right (matching image screen 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Scenario Settings */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-cyan-900/50 rounded-xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span>Scenario Settings</span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700/50">
                ACTIVE EXPERIMENT
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-5">
              Select intervention policies to test virtual mitigation of the predicted Zone B bottleneck before issuing physical orders.
            </p>

            {/* Checkbox Options (matching image screen 6) */}
            <div className="space-y-3">
              {/* Option 1: Close Gate G2 */}
              <div
                onClick={() => toggleSetting('closeGateG2')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                  scenario.closeGateG2
                    ? 'bg-cyan-950/50 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5">
                  {scenario.closeGateG2 ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Close Gate G2</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Halt incoming crowd at Gate G2 to stop pressure on the Zone B bottleneck.
                  </div>
                </div>
              </div>

              {/* Option 2: Redirect flow to G3 */}
              <div
                onClick={() => toggleSetting('redirectFlowToG3')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                  scenario.redirectFlowToG3
                    ? 'bg-cyan-950/50 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5">
                  {scenario.redirectFlowToG3 ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Redirect flow to G3</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Activate electronic signboards & staff to divert pilgrims via East Bypass Corridor (Gate G3).
                  </div>
                </div>
              </div>

              {/* Option 3: Increase exit capacity */}
              <div
                onClick={() => toggleSetting('increaseExitCapacity')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                  scenario.increaseExitCapacity
                    ? 'bg-cyan-950/50 border-cyan-400/80'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5">
                  {scenario.increaseExitCapacity ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Increase exit capacity</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Open auxiliary barricades at South Pier exit corridors (+35% discharge rate).
                  </div>
                </div>
              </div>

              {/* Option 4: Emergency evacuation */}
              <div
                onClick={() => toggleSetting('emergencyEvacuation')}
                className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                  scenario.emergencyEvacuation
                    ? 'bg-red-950/50 border-red-500/80'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5">
                  {scenario.emergencyEvacuation ? (
                    <CheckSquare className="w-4 h-4 text-red-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Emergency evacuation</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Order full sector clearance and open all emergency perimeter gates.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Run Simulation → (matching image screen 6) */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing Agent Physics...</span>
                </>
              ) : (
                <>
                  <span>Run Simulation →</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Scenario Preview Canvas (matching image screen 6) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-cyan-900/50 rounded-xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Scenario Preview</span>
              {scenario.closeGateG2 && (
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                  DIVERSION ROUTE ACTIVE
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Live Pedestrian Vector Routing
            </div>
          </div>

          <DigitalTwinCanvas
            engine={engine}
            zones={venueData.zones}
            gates={venueData.gates}
            scenario={scenario}
            showReroutePath={true}
            height={460}
          />
        </div>
      </div>
    </div>
  );
};
