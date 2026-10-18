import React, { useState, useMemo, useEffect } from 'react';
import { Header, ViewMode } from './components/Header';
import { Screen1Launch } from './components/screens/Screen1Launch';
import { CommandPlatform } from './components/CommandPlatform';
import { BeforeAfterAnalyzer } from './components/BeforeAfterAnalyzer';
import { StoryboardView } from './components/StoryboardView';
import { SimulationEngine } from './simulation/engine';
import { VENUES } from './data/venues';
import { ScenarioSettings, VenueData } from './types';
import { soundManager } from './utils/sound';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('platform');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('ujjain-junction');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scenario settings for What-If sandbox
  const [scenario, setScenario] = useState<ScenarioSettings>({
    closeGateG2: false,
    redirectFlowToG3: false,
    increaseExitCapacity: false,
    emergencyEvacuation: false,
    inflowRate: 100,
    deployStaffZoneB: false,
  });

  // Persistent simulation physics engine
  const engine = useMemo(() => new SimulationEngine(800, 540, 280), []);

  // Venue telemetry state
  const baseVenue = VENUES[selectedVenueId] || VENUES['kashi-temple'];
  const [venueData, setVenueData] = useState<VenueData>(baseVenue);

  // Sync when venue selector changes
  useEffect(() => {
    const v = VENUES[selectedVenueId] || VENUES['kashi-temple'];
    setVenueData({ ...v });
    setScenario({
      closeGateG2: false,
      redirectFlowToG3: false,
      increaseExitCapacity: false,
      emergencyEvacuation: false,
      inflowRate: 100,
      deployStaffZoneB: false,
    });
    engine.initAgents();
    engine.setScenario({
      closeGateG2: false,
      redirectFlowToG3: false,
      increaseExitCapacity: false,
      emergencyEvacuation: false,
      inflowRate: 100,
      deployStaffZoneB: false,
    });
  }, [selectedVenueId, engine]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (next) soundManager.playBlip();
  };

  const handleApplyMitigation = () => {
    const appliedScenario: ScenarioSettings = {
      ...scenario,
      closeGateG2: true,
      redirectFlowToG3: true,
      deployStaffZoneB: true,
    };
    setScenario(appliedScenario);
    engine.setScenario(appliedScenario);

    // Update venue state to reflected mitigated metrics
    setVenueData((prev) => ({
      ...prev,
      avgDensity: 57,
      riskLevel: 'Low',
      zones: prev.zones.map((z) => {
        if (z.id === 'zone-b') {
          return { ...z, density: 57, status: 'Medium', trend: 'down' };
        }
        if (z.id === 'zone-d') {
          return { ...z, density: 48, status: 'Medium', trend: 'stable' };
        }
        return z;
      }),
      gates: prev.gates.map((g) => {
        if (g.id === 'gate-2') {
          return { ...g, isOpen: false, status: 'Closed', isAlert: false };
        }
        if (g.id === 'gate-3') {
          return { ...g, status: 'Redirected', flowRate: 740 };
        }
        return g;
      }),
    }));
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans select-none">
      {/* Great Launch Screen */}
      {viewMode === 'launch' ? (
        <Screen1Launch
          onLaunchComplete={() => setViewMode('platform')}
          selectedVenue={selectedVenueId}
          onVenueChange={setSelectedVenueId}
        />
      ) : (
        <>
          {/* Top Header bar */}
          <Header
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedVenue={selectedVenueId}
            onVenueChange={setSelectedVenueId}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-[#070d1a]">
            {viewMode === 'platform' && (
              <CommandPlatform
                venueData={venueData}
                engine={engine}
                scenario={scenario}
                onScenarioChange={setScenario}
                onApplyMitigation={handleApplyMitigation}
                onOpenLaunch={() => setViewMode('launch')}
                onVenueChange={setSelectedVenueId}
                onOpenCompare={() => setViewMode('analyzer')}
              />
            )}

            {viewMode === 'analyzer' && (
              <BeforeAfterAnalyzer
                venueData={venueData}
                engine={engine}
                scenario={scenario}
                onApplyMitigation={handleApplyMitigation}
                onBackToPlatform={() => setViewMode('platform')}
              />
            )}

            {viewMode === 'storyboard' && (
              <StoryboardView
                venueData={venueData}
                scenario={scenario}
                onApplyMitigation={handleApplyMitigation}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
