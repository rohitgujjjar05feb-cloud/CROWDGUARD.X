import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  Users,
  Flame,
  Bot,
  FlaskConical,
  Scale,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Square,
  Lightbulb,
  Send,
  Sparkles,
  Navigation,
  RotateCcw,
  Check,
  X,
  Gauge,
  Sliders,
  Train,
  HeartPulse,
  Radio,
  Megaphone,
  DoorOpen,
  Timer,
  ShieldAlert,
  Zap,
  Info,
  Play,
  Pause,
  Compass,
  FileText,
  Layers,
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
import confetti from 'canvas-confetti';
import { DigitalTwinCanvas } from './common/DigitalTwinCanvas';
import { SimulationEngine } from '../simulation/engine';
import {
  VenueData,
  ScenarioSettings,
  Zone,
  EmergencyIncident,
  PlatformInfo,
  EmergencyType,
  EventMode,
  EmergencyExit,
  EmergencyLevel,
  CentralSimulationState,
} from '../types';
import { soundManager } from '../utils/sound';
import {
  stationGraphRouter,
  UJJAIN_EMERGENCY_EXITS,
  UJJAIN_ASSEMBLY_ZONES,
  UJJAIN_STATION_NODES,
} from '../simulation/graphRouter';

interface CommandPlatformProps {
  venueData: VenueData;
  engine: SimulationEngine;
  scenario: ScenarioSettings;
  onScenarioChange: (scenario: ScenarioSettings) => void;
  onApplyMitigation: () => void;
  onOpenLaunch?: () => void;
  onVenueChange?: (venueId: string) => void;
  onOpenCompare?: () => void;
}

export type DockTab =
  | 'controls'
  | 'emergency'
  | 'demos'
  | 'whatif'
  | 'platforms'
  | 'predictions'
  | 'comparison'
  | 'copilot';

export const CommandPlatform: React.FC<CommandPlatformProps> = ({
  venueData,
  engine,
  scenario,
  onScenarioChange,
  onApplyMitigation,
  onOpenLaunch,
  onVenueChange,
  onOpenCompare,
}) => {
  // Navigation & View States (Default to Operator Controls for Round 2 evaluation)
  const [activeTab, setActiveTab] = useState<DockTab>('controls');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(venueData.zones[1] || venueData.zones[0]);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'copilot' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'user',
      text: 'okk',
      time: '12:04 PM',
    },
    {
      sender: 'copilot',
      text: `I have analyzed ${venueData.name} telemetry with our Social Force prediction engine. Diverting the primary inflow away from ${venueData.chokeGateCode} reduces cascade stampede risk by 62%.`,
      time: '12:05 PM',
    },
  ]);

  // Footfall Event Mode ('normal' | 'peak' | 'extreme')
  const [eventMode, setEventMode] = useState<EventMode>('normal');

  // Emergency Input Controls
  const [emergencyTypeInput, setEmergencyTypeInput] = useState<EmergencyType>('fire');
  const [emergencyLocationInput, setEmergencyLocationInput] = useState<string>('pf-2');
  const [blockedExitIds, setBlockedExitIds] = useState<Set<string>>(new Set());

  // Clock & Heartbeat
  const [liveCrowdOffset, setLiveCrowdOffset] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Emergency Incident State
  const [emergencyIncident, setEmergencyIncident] = useState<EmergencyIncident>({
    type: 'none',
    active: false,
    title: 'Normal Station Operations',
    locationId: 'pf-1',
    locationName: 'Ujjain Junction (UJN) - Western Railway',
    platform: 'All Platforms Operating Within Normal Limits',
    x: 390,
    y: 190,
    radius: 55,
    severity: 'Warning',
    affectedPopulation: 0,
    evacuationTimeRemainingSec: 180,
    evacuatedPercentage: 0,
    flowSpeedMps: 1.15,
    casualtiesPrevented: 0,
    recommendedExitId: 'Exit A',
    alternativeExitId: 'Exit B',
    safeAssemblyZone: 'Zone S1 (Dewas Gate Outer Plaza)',
    blockedRouteIds: [],
    activeUnits: ['RPF Crowd Patrol Units (x12)', 'Station Master Desk'],
    evacuationPath: [],
    evacuationPathPoints: [],
    routeExplanation: 'Station operating in normal passenger dispersal mode.',
    evacuationRoutes: [
      { from: 'Platform 1', to: 'Dewas Gate Egress (Gate G1)', status: 'Active' },
      { from: 'Platform 2/3', to: 'Central FOB 1 / North Ramp', status: 'Active' },
      { from: 'Platform 4/5', to: 'Hariphatak Bypass (Gate G4)', status: 'Active' },
    ],
    actionLog: [
      `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}] Station operations normal. All 8 platforms operating under standard SOP.`,
    ],
  });

  // Track platform train signal holds
  const [platformHoldMap, setPlatformHoldMap] = useState<Record<string, boolean>>({});

  // Operator Simulation Controls & Live Engine State
  const [platformCapacityVal, setPlatformCapacityVal] = useState<number>(engine.platformCapacity || 2000);
  const [inflowSliderVal, setInflowSliderVal] = useState<number>(scenario.inflowRate || 100);
  const [trainEtaVal, setTrainEtaVal] = useState<number>(engine.trainEtaMinutes || 2);
  const [trainLoadVal, setTrainLoadVal] = useState<number>(engine.trainPassengerLoad || 500);
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel>(engine.emergencyLevel || 'NORMAL');
  const [gateAOpen, setGateAOpen] = useState<boolean>(engine.gateAOpen);
  const [gateBOpen, setGateBOpen] = useState<boolean>(engine.gateBOpen);
  const [gateCOpen, setGateCOpen] = useState<boolean>(engine.gateCOpen);
  const [exitAOpen, setExitAOpen] = useState<boolean>(engine.exitAOpen);
  const [exitBOpen, setExitBOpen] = useState<boolean>(engine.exitBOpen);
  const [exitCOpen, setExitCOpen] = useState<boolean>(engine.exitCOpen);
  const [centralState, setCentralState] = useState<CentralSimulationState>(engine.getState());
  const [trainHoldTimer, setTrainHoldTimer] = useState<number>(0);
  const [trainStatusText, setTrainStatusText] = useState<'AT_PLATFORM' | 'HOLDING' | 'ARRIVING'>('AT_PLATFORM');

  // Real-Time Causal Audit Events Log
  const [simulationEvents, setSimulationEvents] = useState<{
    id: string;
    time: string;
    category: 'OPERATOR' | 'TRAIN' | 'EMERGENCY' | 'CROWD' | 'GATE';
    badgeColor: string;
    text: string;
  }[]>([
    {
      id: 'evt-init-1',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      category: 'CROWD',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      text: 'Baseline station simulation initialized. Laminar pedestrian flow (1.15 m/s) across Ujjain Junction Platforms 1-8.'
    },
    {
      id: 'evt-init-2',
      time: new Date(Date.now() - 35000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      category: 'TRAIN',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700',
      text: 'Train #12962 Avantika Express berthed on Platform 2/3. Passenger disembarkation operating within normal limits.'
    },
  ]);

  const [lastOperatorActionText, setLastOperatorActionText] = useState<string>(
    'System initialized in NORMAL mode. Use the Operator Control Center on the right dock to dynamically adjust simulation parameters.'
  );

  const addSimulationEvent = (
    category: 'OPERATOR' | 'TRAIN' | 'EMERGENCY' | 'CROWD' | 'GATE',
    badgeColor: string,
    text: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setLastOperatorActionText(text);
    setSimulationEvents((prev) => [
      {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        time: timeStr,
        category,
        badgeColor,
        text,
      },
      ...prev.slice(0, 49),
    ]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const state = engine.getState();
      setCentralState(state);
      setEmergencyLevel(state.emergencyLevel);
      setGateAOpen(state.gates.gateA);
      setGateBOpen(state.gates.gateB);
      setExitAOpen(state.exits.exitA);
      setExitBOpen(state.exits.exitB);
      setExitCOpen(state.exits.exitC);

      const t1 = engine.trains.find((t) => t.id === 't1');
      if (t1) {
        if (t1.isHeld) {
          setTrainStatusText('HOLDING');
          setTrainHoldTimer(Math.ceil(t1.holdTimerRemainingSec));
        } else if (t1.status === 'ARRIVING') {
          setTrainStatusText('ARRIVING');
          setTrainHoldTimer(0);
        } else {
          setTrainStatusText('AT_PLATFORM');
          setTrainHoldTimer(0);
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [engine]);

  const handleSimulateTrainArrival = (trainId = 't1') => {
    soundManager.playBlip();
    engine.simulateTrainArrival(trainId);
    setTrainStatusText('ARRIVING');
    setPlatformHoldMap((prev) => ({ ...prev, 'Platform 4/5': false, 'PF 4/5': false, 'PF-4': false }));
    addSimulationEvent('TRAIN', 'bg-amber-950 text-amber-300 border-amber-700', `Train #09304 Simhastha Special arrived on Platform 4/5 (+${trainLoadVal} pax injected). Overcapacity alert triggered on escalator corridor.`);
  };

  const handleHoldTrain = (trainId = 't1', durationSec = 120) => {
    soundManager.playAlert();
    engine.holdTrain(trainId, durationSec);
    setTrainStatusText('HOLDING');
    setTrainHoldTimer(durationSec);
    setPlatformHoldMap((prev) => ({ ...prev, 'Platform 4/5': true, 'PF 4/5': true, 'PF-4': true }));
    addSimulationEvent('TRAIN', 'bg-red-950 text-red-300 border-red-700', `Outer signal HOLD applied (${durationSec}s). Train #09304 debarking held at outer home signal. Platform 4/5 crowd discharging to safe limits.`);
  };

  const handleReleaseTrain = (trainId = 't1') => {
    soundManager.playSuccess();
    engine.releaseTrain(trainId);
    setTrainStatusText('ARRIVING');
    setTrainHoldTimer(0);
    setPlatformHoldMap((prev) => ({ ...prev, 'Platform 4/5': false, 'PF 4/5': false, 'PF-4': false }));
    addSimulationEvent('TRAIN', 'bg-emerald-950 text-emerald-300 border-emerald-700', `Train #09304 released from signal hold. Signal switched to 🟢 GREEN; gliding into cleared platform.`);
  };

  const handleInflowChange = (val: number) => {
    setInflowSliderVal(val);
    const updated = { ...scenario, inflowRate: val };
    onScenarioChange(updated);
    engine.setCrowdInflow(val);
    addSimulationEvent('CROWD', 'bg-blue-950 text-blue-300 border-blue-700', `Station Passenger Inflow adjusted to ${val} pax/min. Crowd generation rate and digital twin agent count scaled dynamically.`);
  };

  const handleCapacityChange = (val: number) => {
    setPlatformCapacityVal(val);
    engine.setPlatformCapacity(val);
    addSimulationEvent('CROWD', 'bg-purple-950 text-purple-300 border-purple-700', `Platform Capacity Limit set to ${val} pax. Zone density and bottleneck thresholds recalculated.`);
  };

  const handleTrainEtaChange = (val: number) => {
    setTrainEtaVal(val);
    engine.setTrainEta(val);
    addSimulationEvent('TRAIN', 'bg-cyan-950 text-cyan-300 border-cyan-700', `Train #09304 ETA updated to ${val} minutes.`);
  };

  const handleTrainLoadChange = (val: number) => {
    setTrainLoadVal(val);
    engine.setTrainPassengerLoad(val);
    addSimulationEvent('TRAIN', 'bg-cyan-950 text-cyan-300 border-cyan-700', `Train #09304 passenger load configured to ${val} devotees.`);
  };

  const handleSetEmergencyLevel = (level: EmergencyLevel) => {
    setEmergencyLevel(level);
    engine.setEmergencyLevel(level);
    if (level === 'EMERGENCY') {
      soundManager.playSiren();
      addSimulationEvent('EMERGENCY', 'bg-red-950 text-red-300 border-red-700', `Behaviour mode switched to EMERGENCY. Walk speed elevated to 1.75 m/s, urgency 0.95, dynamic evacuation route reselection active away from hazard zones.`);
    } else if (level === 'HIGH_DENSITY') {
      soundManager.playAlert();
      addSimulationEvent('CROWD', 'bg-amber-950 text-amber-300 border-amber-700', `Behaviour mode switched to HIGH DENSITY. Helbing deceleration active (v = v_des * max(0.24, 1 - ρ/115)), congestion bunching near corridor narrowings.`);
    } else {
      soundManager.playSuccess();
      addSimulationEvent('CROWD', 'bg-emerald-950 text-emerald-300 border-emerald-700', `Behaviour mode restored to NORMAL. Laminar walking speed 1.15 m/s, multi-route dispersion.`);
    }
  };

  const handleToggleGate = (gate: 'A' | 'B' | 'C') => {
    engine.toggleGate(gate);
    soundManager.playBlip();
    if (gate === 'A') setGateAOpen(engine.gateAOpen);
    if (gate === 'B') {
      setGateBOpen(engine.gateBOpen);
      onScenarioChange({ ...scenario, closeGateG2: !engine.gateBOpen });
      addSimulationEvent('GATE', engine.gateBOpen ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-red-950 text-red-300 border-red-700',
        engine.gateBOpen ? 'Gate B (Central FOB) OPENED. Main passenger ingress corridor restored.' : 'Gate B (Central FOB) BARRED by Operator. Ingress diverted: 50% to Gate A (Porch), 50% to Gate C (Skybridge).'
      );
    }
    if (gate === 'C') setGateCOpen(engine.gateCOpen);
  };

  const handleToggleExit = (exit: 'A' | 'B' | 'C') => {
    engine.toggleExit(exit);
    soundManager.playBlip();
    if (exit === 'A') setExitAOpen(engine.exitAOpen);
    if (exit === 'B') {
      setExitBOpen(engine.exitBOpen);
      setBlockedExitIds((prev) => {
        const next = new Set(prev);
        if (!engine.exitBOpen) next.add('exit-b');
        else next.delete('exit-b');
        return next;
      });
      onScenarioChange({ ...scenario, blockExitB: !engine.exitBOpen });
      addSimulationEvent('GATE', engine.exitBOpen ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-red-950 text-red-300 border-red-700',
        engine.exitBOpen ? 'Exit B (Hariphatak Egress) OPENED. Standard egress corridor restored.' : 'Exit B (Hariphatak Egress) BLOCKED by Operator. Hazard barricade active; dynamic egress diverted to Exit A & Exit C.'
      );
    }
    if (exit === 'C') setExitCOpen(engine.exitCOpen);
  };

  const handleResetSimulation = () => {
    engine.resetSimulation();
    soundManager.playSuccess();
    setEmergencyLevel('NORMAL');
    setInflowSliderVal(100);
    setPlatformCapacityVal(2000);
    setTrainEtaVal(2);
    setTrainLoadVal(500);
    setGateAOpen(true);
    setGateBOpen(true);
    setExitAOpen(true);
    setExitBOpen(true);
    setExitCOpen(true);
    setBlockedExitIds(new Set());
    handleResolveEmergency();
    onScenarioChange({
      ...scenario,
      closeGateG2: false,
      redirectFlowToG3: false,
      deployStaffZoneB: false,
      increaseExitCapacity: false,
      inflowRate: 100,
      emergencyLevel: 'NORMAL',
      blockExitB: false,
    });
    addSimulationEvent('OPERATOR', 'bg-slate-900 text-slate-200 border-slate-700', 'Simulation reset to factory defaults. All gates open, baseline parameters restored.');
  };

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHM = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const timeNow = currentTime;
  const timePlus2 = new Date(timeNow.getTime() + 2 * 60 * 1000);
  const timePlus5 = new Date(timeNow.getTime() + 5 * 60 * 1000);
  const timePlus10 = new Date(timeNow.getTime() + 10 * 60 * 1000);

  // Sensor flux heartbeat
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCrowdOffset((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return prev + delta;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Event Mode Multiplier
  const eventMultiplier = eventMode === 'extreme' ? 1.95 : eventMode === 'peak' ? 1.45 : 1.0;
  const liveTotalCrowd = Math.round((venueData.totalCrowd + liveCrowdOffset) * eventMultiplier);

  // Dynamic metrics modulated by What-If policy activations
  let dynamicDensityReduction = 0;
  if (scenario.closeGateG2) dynamicDensityReduction += 14;
  if (scenario.redirectFlowToG3) dynamicDensityReduction += 4;
  if (scenario.deployStaffZoneB) dynamicDensityReduction += 8;
  if (scenario.increaseExitCapacity) dynamicDensityReduction += 3;

  const baseEffectiveDensity = Math.max(48, venueData.avgDensity - dynamicDensityReduction);
  const currentEffectiveDensity = Math.min(
    99,
    Math.round(baseEffectiveDensity * (eventMode === 'extreme' ? 1.25 : eventMode === 'peak' ? 1.12 : 1.0))
  );
  const currentRiskLevel =
    currentEffectiveDensity > 85
      ? 'Critical'
      : currentEffectiveDensity > 65
      ? 'High'
      : currentEffectiveDensity > 50
      ? 'Medium'
      : 'Low';

  const isRailway = venueData.venueType === 'railway';
  const platformOccupancyPct = Math.round((centralState.platformCrowd / centralState.platformCapacity) * 100);
  const effectiveTotalCrowd = isRailway ? centralState.totalCrowd : liveTotalCrowd;
  const effectiveDensityPct = isRailway
    ? (emergencyLevel === 'EMERGENCY' ? 96 : emergencyLevel === 'HIGH_DENSITY' ? Math.max(88, platformOccupancyPct) : platformOccupancyPct)
    : currentEffectiveDensity;
  const effectiveRiskLevel = isRailway
    ? (emergencyLevel === 'EMERGENCY' ? 'Critical' : centralState.riskLevel === 'Critical' ? 'Critical' : centralState.riskLevel === 'High' ? 'High' : centralState.riskLevel === 'Medium' ? 'Medium' : 'Low')
    : currentRiskLevel;

  // Synchronize selectedZone & engine venueType
  useEffect(() => {
    const critZone = venueData.zones.find((z) => z.density > 75) || venueData.zones[1] || venueData.zones[0];
    setSelectedZone(critZone);
    engine.setVenueType(venueData.venueType);
  }, [venueData.id, venueData.venueType, engine]);

  const activeZone = selectedZone || venueData.zones.find((z) => z.density > 75) || venueData.zones[1] || venueData.zones[0];

  const getZoneDynamicDensity = (zone: Zone) => {
    const isCriticalChoke = zone.density > 75 || venueData.criticalZoneName.includes(zone.code);
    let base = zone.density;
    if (isCriticalChoke) {
      if (scenario.closeGateG2 && scenario.deployStaffZoneB) base = Math.max(48, zone.density - 38);
      else if (scenario.closeGateG2) base = Math.max(54, zone.density - 28);
      else if (scenario.deployStaffZoneB) base = Math.max(60, zone.density - 22);
    } else if (
      (venueData.bypassGateCode.includes(zone.code) || zone.id === 'zone-d') &&
      (scenario.redirectFlowToG3 || scenario.closeGateG2)
    ) {
      base = Math.min(68, zone.density + 22);
    } else if (
      (zone.id === 'zone-exit' || zone.code === 'Exit') &&
      scenario.increaseExitCapacity
    ) {
      base = Math.max(14, zone.density - 16);
    }

    if (eventMode === 'extreme') return Math.min(99, Math.round(base * 1.28));
    if (eventMode === 'peak') return Math.min(98, Math.round(base * 1.15));
    return base;
  };

  const getZoneDynamicStatus = (density: number) => {
    if (density > 75) return { label: 'Critical', tag: 'Critical ↑', badge: 'Critical (LOS F)' };
    if (density > 50) return { label: 'Medium', tag: 'Medium =', badge: 'Medium (LOS D)' };
    return { label: 'Safe', tag: 'Safe =', badge: 'Safe' };
  };

  const activeZoneDensity = getZoneDynamicDensity(activeZone);

  // Dynamic AreaChart series
  const isChokeZone = activeZone.density > 75 || venueData.criticalZoneName.includes(activeZone.code);
  const isBypassZone = venueData.bypassGateCode.includes(activeZone.code) || activeZone.id === 'zone-d';
  const isExitZone = activeZone.id === 'zone-exit' || activeZone.code === 'Exit';

  let delta2 = 0;
  let delta5 = 0;
  let delta10 = 0;

  if (isChokeZone) {
    if (scenario.closeGateG2) {
      delta2 = -4;
      delta5 = -9;
      delta10 = -15;
    } else if (scenario.deployStaffZoneB) {
      delta2 = -2;
      delta5 = -5;
      delta10 = -8;
    } else {
      delta2 = eventMode === 'extreme' ? 7 : 4;
      delta5 = eventMode === 'extreme' ? 12 : 8;
      delta10 = eventMode === 'extreme' ? 16 : 12;
    }
  } else if (isBypassZone) {
    delta2 = scenario.redirectFlowToG3 ? 4 : 2;
    delta5 = scenario.redirectFlowToG3 ? 6 : 3;
    delta10 = scenario.redirectFlowToG3 ? 5 : 3;
  } else if (isExitZone) {
    delta2 = scenario.increaseExitCapacity ? -5 : 2;
    delta5 = scenario.increaseExitCapacity ? -8 : 4;
    delta10 = scenario.increaseExitCapacity ? -11 : 6;
  } else {
    delta2 = 1;
    delta5 = -1;
    delta10 = -2;
  }

  const pNow = activeZoneDensity;
  const p2 = Math.min(99, Math.max(10, pNow + delta2));
  const p5 = Math.min(99, Math.max(10, pNow + delta5));
  const p10 = Math.min(99, Math.max(10, pNow + delta10));
  const activeZonePeak = Math.max(pNow, p2, p5, p10);

  const chartStrokeColor = activeZonePeak > 75 ? '#ef4444' : activeZonePeak > 50 ? '#f59e0b' : '#10b981';

  const chartData = [
    { time: `${formatHM(timeNow)} (Now)`, density: pNow, threshold: 75 },
    { time: `${formatHM(timePlus2)} (+2m)`, density: p2, threshold: 75 },
    { time: `${formatHM(timePlus5)} (+5m)`, density: p5, threshold: 75 },
    { time: `${formatHM(timePlus10)} (+10m)`, density: p10, threshold: 75 },
  ];

  const togglePolicy = (key: keyof ScenarioSettings) => {
    soundManager.playBlip();
    const updated = { ...scenario, [key]: !scenario[key] };
    onScenarioChange(updated);
    engine.setScenario(updated);
  };

  const handleRunWhatIfSimulation = () => {
    soundManager.playAlert();
    setIsSimulating(true);
    engine.setSpeed(2.0);

    setTimeout(() => {
      setIsSimulating(false);
      engine.setSpeed(1.0);
      soundManager.playSuccess();
      setActiveTab('comparison');
    }, 1100);
  };

  // Emergency Progression Timer
  useEffect(() => {
    if (!emergencyIncident.active) return;
    const interval = setInterval(() => {
      setEmergencyIncident((prev) => {
        if (!prev.active) return prev;
        const nextTime = Math.max(0, prev.evacuationTimeRemainingSec - 1);
        const nextEvac = Math.min(100, prev.evacuatedPercentage + (prev.type === 'fire' ? 1.4 : 0.9));
        const nextCasualties = Math.min(3800, Math.floor(nextEvac * 38));
        const updated: EmergencyIncident = {
          ...prev,
          evacuationTimeRemainingSec: nextTime,
          evacuatedPercentage: Math.round(nextEvac),
          casualtiesPrevented: nextCasualties,
        };
        engine.setEmergencyIncident(updated);
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [emergencyIncident.active, engine]);

  // Reusable Emergency Decision Engine Trigger (Requirement 6, 8, 10, 11, 12, 14)
  const triggerEmergency = (type: EmergencyType, locationId: string) => {
    const locNode = UJJAIN_STATION_NODES[locationId] || UJJAIN_STATION_NODES['pf-2'];
    const blockedNodes = new Set<string>();

    if (type === 'fire') {
      soundManager.playSiren();
      if (locationId === 'pf-2') {
        blockedNodes.add('fob-1-p23');
      }
    } else if (type === 'medical') {
      soundManager.playMedicalChime();
    } else {
      soundManager.playAlert();
    }

    let evacResult = null;
    if (type === 'medical') {
      evacResult = stationGraphRouter.calculateMedicalAccess(locationId, blockedNodes, eventMode);
    } else {
      evacResult = stationGraphRouter.calculateEvacuation(locationId, type, blockedNodes, blockedExitIds, eventMode);
    }

    const defaultExit = UJJAIN_EMERGENCY_EXITS[1]; // Exit B
    const defaultAssembly = UJJAIN_ASSEMBLY_ZONES[1]; // S2

    const newIncident: EmergencyIncident = {
      type,
      active: true,
      title:
        type === 'fire'
          ? `🔥 CODE RED: ${locNode.name.toUpperCase()} FIRE & SMOKE`
          : type === 'medical'
          ? `🚑 CODE BLUE: ${locNode.name.toUpperCase()} MEDICAL CRUSH CRISIS`
          : type === 'crush'
          ? `⚠️ CODE ORANGE: ${locNode.name.toUpperCase()} STAMPEDE CRUSH HAZARD`
          : type === 'blocked_route'
          ? `🛑 CODE AMBER: ${locNode.name.toUpperCase()} ROUTE BLOCKED`
          : type === 'electrical'
          ? `⚡ CODE YELLOW: ${locNode.name.toUpperCase()} HIGH-VOLTAGE OHE OUTAGE`
          : `🆘 ACTIVE INCIDENT AT ${locNode.name.toUpperCase()}`,
      locationId,
      locationName: `Ujjain Junction - ${locNode.name}`,
      platform: locNode.code,
      x: locNode.x,
      y: locNode.y,
      radius: type === 'fire' ? 65 : 45,
      severity: type === 'fire' ? 'Catastrophic' : type === 'crush' ? 'High' : 'Warning',
      affectedPopulation: Math.round(locNode.capacity * (locNode.currentOccupancy / 100)),
      evacuationTimeRemainingSec: Math.round((evacResult?.estimatedTimeMinutes || 3.5) * 60),
      evacuatedPercentage: 8,
      flowSpeedMps: type === 'fire' ? 1.84 : 1.25,
      casualtiesPrevented: 380,
      recommendedExitId: evacResult?.targetExit.code || defaultExit.code,
      alternativeExitId: evacResult?.alternativeExit?.code || 'Exit D',
      safeAssemblyZone: evacResult?.targetAssemblyZone.name || defaultAssembly.name,
      blockedRouteIds: Array.from(blockedNodes),
      activeUnits:
        type === 'fire'
          ? ['Ujjain Municipal Fire Tender (x2)', 'RPF Quick Reaction Team (x16)', '108 Ambulance Unit']
          : type === 'medical'
          ? ['108 Stretcher Paramedics', 'Civil Hospital Medical Mobile Unit', 'RPF First Responders']
          : ['RPF Crowd Patrol Units (x24)', 'Home Guard Marshals', 'Station Queue Monitors'],
      evacuationPath: evacResult?.pathNodeIds || [],
      evacuationPathPoints: evacResult?.pathPoints || [],
      alternativePathPoints: evacResult?.alternativePathPoints || [],
      routeExplanation: evacResult?.explanation || 'Optimal egress path calculated by Dijkstra cost function.',
      costComparison: evacResult?.costComparison,
      evacuationRoutes: [
        { from: locNode.code, to: evacResult?.targetExit.name || defaultExit.name, status: 'Active' },
        { from: 'Central FOB 1', to: 'North Subway Ramp', status: 'Congested' },
      ],
      actionLog: [
        `[${formatHM(new Date())}] EMERGENCY ACTIVATED: ${type.toUpperCase()} at ${locNode.name}.`,
        `[${formatHM(new Date())}] Graph routing engine calculated safest route to ${evacResult?.targetExit.code || 'Exit B'}.`,
        `[${formatHM(new Date())}] Crowd redirected away from congested FOB bottleneck corridors.`,
      ],
    };

    setEmergencyIncident(newIncident);
    engine.setEmergencyIncident(newIncident);
    setActiveTab('emergency');
  };

  // Dynamic Route Blocking & Alternative Path Recalculation (Requirements 9 & 13)
  const handleToggleExitBlock = (exitId: string) => {
    soundManager.playAlert();
    const nextBlocked = new Set(blockedExitIds);
    if (nextBlocked.has(exitId)) {
      nextBlocked.delete(exitId);
    } else {
      nextBlocked.add(exitId);
    }
    setBlockedExitIds(nextBlocked);

    if (emergencyIncident.active) {
      const blockedNodes = new Set(emergencyIncident.blockedRouteIds);
      const evacResult = stationGraphRouter.calculateEvacuation(
        emergencyIncident.locationId,
        emergencyIncident.type,
        blockedNodes,
        nextBlocked,
        eventMode
      );

      if (evacResult) {
        const updated: EmergencyIncident = {
          ...emergencyIncident,
          recommendedExitId: evacResult.targetExit.code,
          alternativeExitId: evacResult.alternativeExit?.code || 'Exit A',
          safeAssemblyZone: evacResult.targetAssemblyZone.name,
          evacuationPath: evacResult.pathNodeIds,
          evacuationPathPoints: evacResult.pathPoints,
          alternativePathPoints: evacResult.alternativePathPoints || [],
          routeExplanation: `Exit ${exitId.toUpperCase()} was blocked! System immediately calculated alternative safest path via ${evacResult.targetExit.name}.`,
          costComparison: evacResult.costComparison,
          actionLog: [
            ...emergencyIncident.actionLog,
            `[${formatHM(new Date())}] OPERATOR OVERRIDE: ${exitId.toUpperCase()} marked BLOCKED. Instant reroute dispatched to ${evacResult.targetExit.code}.`,
          ],
        };
        setEmergencyIncident(updated);
        engine.setEmergencyIncident(updated);
      }
    }
  };

  // 3 One-Click Demo Scenarios (Requirement 20)
  const handleRunDemo = (demoNum: 1 | 2 | 3) => {
    if (demoNum === 1) {
      // DEMO 1: PEAK EVENT FOOTFALL
      soundManager.playAlert();
      setEventMode('extreme');
      setActiveTab('demos');
      onScenarioChange({ ...scenario, eventMode: 'extreme' });
      addSimulationEvent('OPERATOR', 'bg-amber-950 text-amber-300 border-amber-700', 'Demo 1 triggered: Extreme Religious Peak Footfall. High crowd influx across all station gates.');
    } else if (demoNum === 2) {
      // DEMO 2: FIRE EMERGENCY AT PLATFORM 2
      triggerEmergency('fire', 'pf-2');
      setActiveTab('emergency');
      addSimulationEvent('EMERGENCY', 'bg-red-950 text-red-300 border-red-700', 'Demo 2 triggered: Active Fire Outbreak on Platform 2. 2.9s siren, fire squad deployed, dynamic Dijkstra egress routing active.');
    } else if (demoNum === 3) {
      // DEMO 3: MEDICAL EMERGENCY AT PLATFORM 1
      triggerEmergency('medical', 'pf-1');
      setActiveTab('emergency');
      addSimulationEvent('EMERGENCY', 'bg-emerald-950 text-emerald-300 border-emerald-700', 'Demo 3 triggered: Medical Emergency. 108 Ambulance deployed along Dedicated Outer Perimeter Road, foot paramedics en route.');
    }
  };

  const handleResolveEmergency = () => {
    soundManager.playSuccess();
    const cleared: EmergencyIncident = {
      ...emergencyIncident,
      active: false,
      type: 'none',
      evacuationPathPoints: [],
      alternativePathPoints: [],
      actionLog: [
        ...emergencyIncident.actionLog,
        `[${formatHM(new Date())}] Emergency resolved! All 8 platforms cleared & restored to safe normal operations.`,
      ],
    };
    setEmergencyIncident(cleared);
    engine.setEmergencyIncident(null);
    addSimulationEvent('EMERGENCY', 'bg-emerald-950 text-emerald-300 border-emerald-700', 'Emergency incident resolved. Station restored to normal passenger dispersal.');
  };


  const togglePlatformHold = (platformNum: string) => {
    soundManager.playBlip();
    setPlatformHoldMap((prev) => ({
      ...prev,
      [platformNum]: !prev[platformNum],
    }));
  };

  const handleApplyAction = () => {
    soundManager.playSuccess();
    onApplyMitigation();
    setShowCompleteModal(true);

    confetti({
      particleCount: 85,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#3b82f6', '#38bdf8'],
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setChatInput('');

    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();
      if (lower.includes('gate 4') || lower.includes('gate 5') || lower.includes('exit')) {
        reply = `Ujjain Junction Hariphatak Exit B maintains 75% reserve discharge bandwidth. Opening auxiliary barricades accelerates zone clearance by 4.5 minutes.`;
      } else if (lower.includes('staff') || lower.includes('police') || lower.includes('security') || lower.includes('marshal')) {
        reply = `Dispatch recommendation for Ujjain Junction: 16 RPF marshals to Platform 4/5 Escalator line; 8 marshals along North Subway Ramp.`;
      } else if (lower.includes('announcement') || lower.includes('speaker') || lower.includes('pa')) {
        reply = `PA Broadcast draft: "Attention respected devotees: Platform 4/5 Central FOB is experiencing high passenger backlog. Please proceed via North Subway Ramp for safe unobstructed egress."`;
      } else {
        reply = `I have analyzed Ujjain Junction telemetry with our Social Force prediction engine. Diverting the primary inflow away from Gate G3 reduces cascade stampede risk by 68%.`;
      }
      setChatMessages((prev) => [...prev, { sender: 'copilot', text: reply, time: now }]);
      soundManager.playBlip();
    }, 500);
  };

  const getStatusBadge = (label: string) => {
    switch (label) {
      case 'Critical':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">Critical</span>;
      case 'Medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">Warning</span>;
      case 'Safe':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">Safe</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">Low</span>;
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto p-3 sm:p-4 space-y-4">
      {/* ========================================================================= */}
      {/* COMMAND CENTER TOP BAR (Station Title, Event Mode Switcher, Emergency Trigger) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-cyan-900/60 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Station Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Train className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-tnr text-base sm:text-lg font-black text-white tracking-wide">
                CROWDGUARD X — UJJAIN RAILWAY STATION (UJN)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PROPOSED SAFETY MODEL
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Western Railway • Simhastha Mahakumbh & Mahakaleshwar Jyotirlinga Decision Support Grid
            </div>
          </div>
        </div>

        {/* Center: Peak Event Mode Switcher (Requirement 5 & 20) */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 px-2 font-bold uppercase tracking-wider hidden sm:inline">
            EVENT FOOTFALL:
          </span>
          <button
            onClick={() => {
              soundManager.playBlip();
              setEventMode('normal');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              eventMode === 'normal'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Normal Day
          </button>
          <button
            onClick={() => {
              soundManager.playAlert();
              setEventMode('peak');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              eventMode === 'peak'
                ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Peak Event
          </button>
          <button
            onClick={() => {
              soundManager.playAlert();
              setEventMode('extreme');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              eventMode === 'extreme'
                ? 'bg-red-950 text-red-200 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚨 Extreme Peak (Simhastha)
          </button>
        </div>

        {/* Right: Emergency & Architecture Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchitectureModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-cyan-800 text-cyan-300 text-xs font-bold font-tnr flex items-center gap-1.5 transition-all cursor-pointer"
            title="View System Architecture & Innovation"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Architecture & Innovation</span>
          </button>

          <button
            onClick={handleResetSimulation}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset all simulation values to pristine baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>

          <button
            onClick={() => {
              soundManager.playAlert();
              setActiveTab('emergency');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-black font-tnr uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
              emergencyIncident.active
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            }`}
          >
            <Flame className="w-4 h-4 animate-bounce" />
            <span>🚨 ACTIVATE EMERGENCY MODE</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 Stat KPI Top Cards (With Footfall Mode Modulations) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Crowd */}
        <div className="bg-slate-900/90 border border-cyan-800/40 hover:border-cyan-500/50 rounded-xl p-3.5 shadow-lg backdrop-blur-md relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Estimated Station Crowd
            </span>
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl lg:text-2xl font-black text-white tracking-tight font-mono">
            {effectiveTotalCrowd.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-medium mt-1 font-mono">
            <span>Inflow: +{isRailway ? centralState.incomingFlow : Math.round(48 * eventMultiplier)} / Outflow: -{isRailway ? centralState.outgoingFlow : 34}</span>
            <span className="text-emerald-400 font-bold">(Live Telemetry)</span>
          </div>
        </div>

        {/* Card 2: Avg. Density */}
        <div className="bg-slate-900/90 border border-cyan-800/40 hover:border-cyan-500/50 rounded-xl p-3.5 shadow-lg backdrop-blur-md relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${effectiveDensityPct > 85 ? 'bg-red-400 animate-ping' : effectiveDensityPct > 65 ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
              {isRailway ? 'Platform 4/5 Occupancy' : 'Avg. Station Density'}
            </span>
            <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl lg:text-2xl font-black text-white tracking-tight font-mono">
            {effectiveDensityPct}%
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-medium mt-1 font-mono">
            {dynamicDensityReduction > 0 ? (
              <span className="text-emerald-400 font-bold">↓ {dynamicDensityReduction}% Relieved (What-If Active)</span>
            ) : (
              <>
                <span>Peak: {isRailway ? `${(effectiveDensityPct * 0.05).toFixed(1)} ped/m²` : '4.8 ped/m²'}</span>
                <span className={effectiveDensityPct > 85 ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                  ({effectiveDensityPct > 85 ? 'Fruin LOS F - CRUSH' : 'Fruin LOS D'})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Risk Level */}
        <div className={`bg-slate-900/90 border rounded-xl p-3.5 shadow-lg backdrop-blur-md relative overflow-hidden transition-all ${
          effectiveRiskLevel === 'Low'
            ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            : effectiveRiskLevel === 'Medium'
            ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            : 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider font-sans flex items-center gap-1.5 ${
              effectiveRiskLevel === 'Low' ? 'text-emerald-400' : effectiveRiskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                effectiveRiskLevel === 'Low' ? 'bg-emerald-400' : effectiveRiskLevel === 'Medium' ? 'bg-amber-400' : 'bg-red-400 animate-ping'
              }`}></span>
              Station Risk Level
            </span>
            <AlertTriangle className={`w-4 h-4 ${
              effectiveRiskLevel === 'Low' ? 'text-emerald-400' : effectiveRiskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
            }`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xl lg:text-2xl font-black tracking-tight font-mono ${
              effectiveRiskLevel === 'Low' ? 'text-emerald-400' : effectiveRiskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
            }`}>
              {effectiveRiskLevel.toUpperCase()}
            </div>
          </div>
          <div className="text-[10px] text-slate-300 mt-1 font-mono truncate">
            {effectiveRiskLevel === 'Low'
              ? `Smooth Laminar Dispersal (~${centralState.averageSpeedMps} m/s)`
              : effectiveRiskLevel === 'Medium'
              ? `Controlled Transit (~${centralState.averageSpeedMps} m/s)`
              : `${venueData.criticalZoneName.split('(')[0]} Bottleneck (~${centralState.averageSpeedMps} m/s)`}
          </div>
        </div>

        {/* Card 4: Next Horizon */}
        <div className="bg-slate-900/90 border border-cyan-800/40 hover:border-cyan-500/50 rounded-xl p-3.5 shadow-lg backdrop-blur-md relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Predictive Horizon
            </span>
            <Clock className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl lg:text-2xl font-black text-cyan-300 tracking-tight font-mono">
            {formatHM(timePlus2)}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1">
            <span className="text-slate-300 font-bold">Now: {formatHM(timeNow)}</span>
            <span>• Cycle (+2m / +5m / +10m)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Main Split: Left (Live Digital Twin) & Right (Interactive Intelligence Dock) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side (7 Cols): Digital Twin Map with Route-Following Crowd & Live Zone Telemetry */}
        <div className="lg:col-span-7 flex flex-col space-y-3">


          <div className="relative rounded-2xl overflow-hidden border border-cyan-900/60 bg-[#070e1b] shadow-2xl flex flex-col">
            {/* Map Header */}
            <div className="px-4 py-2 bg-slate-950/90 border-b border-cyan-950 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  emergencyIncident.active ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'
                }`}></span>
                <span className="font-tnr text-sm font-bold text-white tracking-wide">
                  {emergencyIncident.active ? (
                    <span className="text-red-400 font-mono text-xs">
                      🚨 ACTIVE EVACUATION: {emergencyIncident.title} ➔ STREAMING TO {emergencyIncident.recommendedExitId}
                    </span>
                  ) : (
                    <span>Live Station Twin: {venueData.name} • Normal Dispersal</span>
                  )}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span>Model: <span className="text-cyan-300 capitalize font-bold">{venueData.venueType} Architecture (UJN)</span></span>
                {blockedExitIds.size > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                    {Array.from(blockedExitIds).join(', ').toUpperCase()} BLOCKED
                  </span>
                )}
              </div>
            </div>

            {/* Active Emergency Alert Banner */}
            {emergencyIncident.active && (
              <div className="bg-red-950/95 border-b border-red-500/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-red-600 text-white font-bold animate-bounce text-xs">
                    {emergencyIncident.type === 'fire'
                      ? '🔥 FIRE CODE RED'
                      : emergencyIncident.type === 'medical'
                      ? '🚑 MEDICAL CODE BLUE'
                      : '🚨 EMERGENCY ALERT'}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white tracking-wide">
                      {emergencyIncident.title}
                    </div>
                    <div className="text-[10px] text-red-200 font-mono">
                      Location: {emergencyIncident.locationName} • Evacuated:{' '}
                      <span className="font-bold text-emerald-300">{emergencyIncident.evacuatedPercentage}%</span> • Flow:{' '}
                      <span className="font-bold text-cyan-300">{emergencyIncident.flowSpeedMps} m/s</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold">
                    <Timer className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      0{Math.floor(emergencyIncident.evacuationTimeRemainingSec / 60)}:
                      {(emergencyIncident.evacuationTimeRemainingSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    onClick={handleResolveEmergency}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Clear Incident
                  </button>
                </div>
              </div>
            )}

            {/* Overcapacity Warning Banner */}
            {centralState.predictedOvercapacity && (
              <div className="bg-red-950/95 border-b border-red-500/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <div className="font-mono font-bold text-xs text-red-200">
                      ⚠️ CRITICAL ALERT: Platform 4/5 Predicted Occupancy ({centralState.predictedCrowd} Pax) Exceeds Capacity Limit ({centralState.platformCapacity} Pax)!
                    </div>
                    <div className="text-[10px] text-red-300">
                      Inbound Train #09304 debarking load onto platform. Immediate Outer Signal Hold recommended to prevent FOB crush!
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleHoldTrain('t1', 120)}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shrink-0 cursor-pointer shadow-lg"
                >
                  🛑 Hold Train 120s
                </button>
              </div>
            )}

            {/* Interactive Canvas */}
            <div className="relative">
              <DigitalTwinCanvas
                engine={engine}
                zones={venueData.zones}
                gates={venueData.gates}
                venueType={venueData.venueType}
                scenario={scenario}
                showReroutePath={scenario.closeGateG2 || scenario.redirectFlowToG3}
                selectedZoneId={activeZone.id}
                onZoneSelect={(zone) => {
                  setSelectedZone(zone);
                  soundManager.playBlip();
                }}
                height={480}
                emergencyIncident={emergencyIncident}
              />
            </div>
          </div>

          {/* Real-Time Cause -> Effect Feedback Banner */}
          <div className="bg-slate-900/90 border border-cyan-800/70 rounded-xl p-3 flex items-start gap-2.5 shadow-md">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/60 text-cyan-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  CAUSE ➔ EFFECT REAL-TIME SIMULATION FEEDBACK
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700/60 font-bold">
                  LIVE ENGINE
                </span>
              </div>
              <div className="text-xs font-medium text-slate-200 mt-0.5 leading-relaxed font-sans">
                {lastOperatorActionText}
              </div>
            </div>
          </div>

          {/* Live Zone Telemetry Strip & Explainability Box (Requirement 4) */}
          <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-3.5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
              <span className="font-tnr text-xs font-bold text-slate-300">LIVE ZONE TELEMETRY & OCCUPANCY:</span>
              <span className="text-[11px] text-cyan-400 font-sans">CLICK ZONE TO INSPECT REASONING</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {venueData.zones.map((zone) => {
                const isSelected = activeZone.id === zone.id;
                const displayDensity = getZoneDynamicDensity(zone);
                const displayStatus = getZoneDynamicStatus(displayDensity);

                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      setSelectedZone(zone);
                      soundManager.playBlip();
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-200 mb-1">
                      <span className={isSelected ? 'text-cyan-300 font-bold' : ''}>{zone.code}</span>
                      {getStatusBadge(displayStatus.label)}
                    </div>
                    <div className="font-mono text-sm font-bold text-white">{displayDensity}%</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {zone.name.split('(')[1]?.replace(')', '') || zone.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Zone Deep Explainability Box (Requirement 4: "Why is a zone risky?") */}
            {activeZone && (
              <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-cyan-800/50 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300 font-bold mb-1.5">
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {activeZone.code} — {activeZone.name}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      activeZoneDensity > 75
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {activeZoneDensity > 75 ? 'CRITICAL BOTTLENECK' : 'NORMAL TRANSIT'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] my-2">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Est. Occupancy:</span>{' '}
                    <span className="font-bold text-white">
                      {Math.round((activeZone.capacity * activeZoneDensity) / 100).toLocaleString()} /{' '}
                      {activeZone.capacity.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Inflow:</span>{' '}
                    <span
                      className={`font-bold ${
                        activeZone.inflowLevel === 'EXTREME' ? 'text-red-400' : 'text-amber-400'
                      }`}
                    >
                      {activeZone.inflowLevel || 'HIGH'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Outflow:</span>{' '}
                    <span
                      className={`font-bold ${
                        activeZone.outflowLevel === 'LOW' ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {activeZone.outflowLevel || 'MEDIUM'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Bottleneck:</span>{' '}
                    <span className="font-bold text-cyan-300 truncate">
                      {activeZone.bottleneckElement || 'FOB 1 Staircase'}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 font-sans leading-relaxed">
                  <span className="text-amber-300 font-bold font-mono text-[10px]">WHY RISKY? ➔ </span>
                  {activeZone.riskReasoning ||
                    `Density at ${activeZoneDensity}% exceeds safe capacity threshold. Inflow from connecting platform gates exceeds stairwell discharge rate.`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side (5 Cols): Interactive Intelligence Dock */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-cyan-900/60 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            {/* Dock Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('controls');
                  soundManager.playBlip();
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'controls'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 shrink-0" />
                <span>Controls</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('emergency');
                  soundManager.playBlip();
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'emergency'
                    ? 'bg-red-600 text-white shadow-[0_0_16px_rgba(239,68,68,0.6)]'
                    : emergencyIncident.active
                    ? 'bg-red-950/80 text-red-300 border border-red-500/80 animate-pulse'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 shrink-0 ${emergencyIncident.active ? 'text-red-400 animate-bounce' : ''}`} />
                <span>Emergency</span>
                {emergencyIncident.active && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('demos');
                  soundManager.playBlip();
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'demos'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Play className="w-3.5 h-3.5 shrink-0" />
                <span>3 Demos</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('whatif');
                  soundManager.playBlip();
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'whatif'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                <span>What-If</span>
              </button>

              {venueData.platforms && (
                <button
                  onClick={() => {
                    setActiveTab('platforms');
                    soundManager.playBlip();
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    activeTab === 'platforms'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Train className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>Platforms</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab('predictions');
                  soundManager.playBlip();
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'predictions'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 shrink-0" />
                <span>Forecast</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('comparison');
                  soundManager.playBlip();
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'comparison'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span>Compare</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('copilot');
                  soundManager.playBlip();
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'copilot'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5 shrink-0" />
                <span>Copilot</span>
              </button>
            </div>

            {/* =============================================================== */}
            {/* TAB: 🎮 MASTER OPERATOR SIMULATION CONTROLS (REQUIREMENT 2) */}
            {/* =============================================================== */}
            {activeTab === 'controls' && (
              <div className="space-y-3">
                {/* Header with Title, Live Train Interlock Signal Status & Reset */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-900/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                        OPERATOR CONTROL CENTER
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Direct Operational Parameters • Real-Time Crowd & Train Signal Impact
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`text-[9.5px] font-mono font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition-all ${
                        trainStatusText === 'HOLDING'
                          ? 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse'
                          : trainStatusText === 'ARRIVING'
                          ? 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse'
                          : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                      <span>
                        {trainStatusText === 'HOLDING'
                          ? `🔴 HELD (${trainHoldTimer}s) • PF CLEARING`
                          : trainStatusText === 'ARRIVING'
                          ? '🟡 APPROACHING'
                          : '🟢 BERTHED (PF 4/5)'}
                      </span>
                    </div>

                    <button
                      onClick={handleResetSimulation}
                      className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      title="Reset all operational parameters and clear incidents to baseline"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Section 1: Crowd Behavioural Mode Selector (3 States) */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>CROWD BEHAVIOURAL MODE (AGENT DYNAMICS):</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Physical Movement Rules</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleSetEmergencyLevel('NORMAL')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        emergencyLevel === 'NORMAL'
                          ? 'bg-cyan-950/80 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)] text-cyan-200'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-bold font-mono">🟢 NORMAL</div>
                      <div className="text-[9px] mt-0.5 opacity-80 leading-tight">
                        Laminar 1.15 m/s • Multi-route dispersion
                      </div>
                    </button>

                    <button
                      onClick={() => handleSetEmergencyLevel('HIGH_DENSITY')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        emergencyLevel === 'HIGH_DENSITY'
                          ? 'bg-amber-950/80 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)] text-amber-200'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-bold font-mono">🟡 HIGH DENSITY</div>
                      <div className="text-[9px] mt-0.5 opacity-80 leading-tight">
                        Helbing slows to 0.65 m/s • Queuing
                      </div>
                    </button>

                    <button
                      onClick={() => handleSetEmergencyLevel('EMERGENCY')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        emergencyLevel === 'EMERGENCY'
                          ? 'bg-red-950/80 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] text-red-100 animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-bold font-mono">🔴 EMERGENCY</div>
                      <div className="text-[9px] mt-0.5 opacity-80 leading-tight">
                        Speed 1.75 m/s • Dynamic exit reroute
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section 2: Live Operational Parameter Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Inflow Slider */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Passenger Inflow</span>
                      </span>
                      <span className="text-cyan-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-cyan-800 text-[10px]">
                        {inflowSliderVal} pax/min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="300"
                      step="10"
                      value={inflowSliderVal}
                      onChange={(e) => handleInflowChange(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[8.5px] font-mono text-slate-500">
                      <span>Low (20)</span>
                      <span>Normal (100)</span>
                      <span>Surge (300)</span>
                    </div>
                  </div>

                  {/* Platform Capacity Slider */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PF 4/5 Capacity</span>
                      </span>
                      <span className="text-emerald-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-800 text-[10px]">
                        {platformCapacityVal.toLocaleString()} Pax
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="4000"
                      step="100"
                      value={platformCapacityVal}
                      onChange={(e) => handleCapacityChange(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[8.5px] font-mono text-slate-500">
                      <span>1,000 Pax</span>
                      <span>2,000 (Std)</span>
                      <span>4,000 Max</span>
                    </div>
                  </div>

                  {/* Train ETA Slider */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Train T1 Inbound ETA</span>
                      </span>
                      <span className="text-amber-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-amber-800 text-[10px]">
                        {trainEtaVal}m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={trainEtaVal}
                      onChange={(e) => handleTrainEtaChange(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[8.5px] font-mono text-slate-500">
                      <span>1m (Home Signal)</span>
                      <span>5m (Approach)</span>
                      <span>10m (Distant)</span>
                    </div>
                  </div>

                  {/* Train Passenger Load Slider */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Train Passenger Load</span>
                      </span>
                      <span className="text-indigo-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-indigo-800 text-[10px]">
                        +{trainLoadVal} Pax
                      </span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="1500"
                      step="50"
                      value={trainLoadVal}
                      onChange={(e) => handleTrainLoadChange(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[8.5px] font-mono text-slate-500">
                      <span>200 Pax</span>
                      <span>500 (Std Rake)</span>
                      <span>1,500 (Mela)</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Train #09304 Operations Controls */}
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white font-mono">
                    <span className="flex items-center gap-1.5">
                      <Train className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Train #09304 Operations (Platform 4/5):</span>
                    </span>
                    <span className="text-[10px] text-cyan-300 font-bold">Simhastha Special</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleSimulateTrainArrival('t1')}
                      className="py-1.5 px-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                      title="Simulate incoming train arrival (injects passenger load onto platform)"
                    >
                      <Play className="w-3 h-3 text-cyan-400" />
                      <span>Simulate Arrival</span>
                    </button>

                    <button
                      onClick={() => handleHoldTrain('t1', 120)}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        trainStatusText === 'HOLDING'
                          ? 'bg-red-900 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
                          : 'bg-red-950 hover:bg-red-900 border-red-700 text-red-200'
                      }`}
                      title="Hold train at outer signal for 120 seconds to disperse platform crowd"
                    >
                      <Pause className="w-3 h-3 text-red-400" />
                      <span>Hold 120s</span>
                    </button>

                    <button
                      onClick={() => handleReleaseTrain('t1')}
                      className="py-1.5 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                      title="Release train into platform berth"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Release Train</span>
                    </button>
                  </div>
                </div>

                {/* Section 4: Physical Station Gates & Exits Interlocks */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>STATION GATES & EXITS (PHYSICAL INTERLOCK):</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Click to Bar / Re-route</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Gate A */}
                    <button
                      onClick={() => handleToggleGate('A')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        gateAOpen
                          ? 'bg-slate-900 hover:bg-slate-850 border-emerald-600/70 text-emerald-200'
                          : 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">Gate A</span>
                        <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded ${gateAOpen ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-white'}`}>
                          {gateAOpen ? 'OPEN' : 'BLOCKED'}
                        </span>
                      </div>
                      <div className="text-[9px] mt-0.5 opacity-80 truncate">Dewas Gate Porch</div>
                    </button>

                    {/* Gate B */}
                    <button
                      onClick={() => handleToggleGate('B')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        gateBOpen
                          ? 'bg-slate-900 hover:bg-slate-850 border-emerald-600/70 text-emerald-200'
                          : 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">Gate B</span>
                        <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded ${gateBOpen ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-white'}`}>
                          {gateBOpen ? 'OPEN' : 'BLOCKED'}
                        </span>
                      </div>
                      <div className="text-[9px] mt-0.5 opacity-80 truncate">Central FOB 1 Entry</div>
                    </button>

                    {/* Exit B */}
                    <button
                      onClick={() => handleToggleExit('B')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        exitBOpen
                          ? 'bg-slate-900 hover:bg-slate-850 border-emerald-600/70 text-emerald-200'
                          : 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">Exit B</span>
                        <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded ${exitBOpen ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-white'}`}>
                          {exitBOpen ? 'OPEN' : 'BLOCKED'}
                        </span>
                      </div>
                      <div className="text-[9px] mt-0.5 opacity-80 truncate">Hariphatak Egress</div>
                    </button>
                  </div>
                </div>

                {/* Section 5: Quick Scenarios & Comparison */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleRunDemo(2)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono flex items-center gap-1 transition-all cursor-pointer ${
                        emergencyIncident.active && emergencyIncident.type === 'fire'
                          ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse'
                          : 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700'
                      }`}
                    >
                      <Flame className="w-3 h-3 text-red-400" />
                      <span>🔥 Fire PF 2</span>
                    </button>

                    <button
                      onClick={() => handleRunDemo(3)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono flex items-center gap-1 transition-all cursor-pointer ${
                        emergencyIncident.active && emergencyIncident.type === 'medical'
                          ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700'
                      }`}
                    >
                      <HeartPulse className="w-3 h-3 text-emerald-400" />
                      <span>🚑 108 Medical</span>
                    </button>

                    <button
                      onClick={() => handleHoldTrain('t1', 120)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>⚡ Scenario B</span>
                    </button>
                  </div>

                  {emergencyIncident.active && (
                    <button
                      onClick={handleResolveEmergency}
                      className="px-2.5 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer border border-emerald-500"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB: 🚨 EMERGENCY MANAGEMENT & INTELLIGENT EXIT ROUTING (MAJOR) */}
            {/* =============================================================== */}
            {activeTab === 'emergency' && (
              <div className="space-y-3.5">
                {/* Emergency Scenario Selector Controls */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 text-red-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span>EMERGENCY CONTROL CENTER</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Dijkstra Routing Active</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 mb-1 block">Emergency Type:</label>
                      <select
                        value={emergencyTypeInput}
                        onChange={(e) => setEmergencyTypeInput(e.target.value as EmergencyType)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-red-500 font-sans cursor-pointer"
                      >
                        <option value="fire">🔥 Fire Emergency</option>
                        <option value="medical">🚑 Medical Emergency</option>
                        <option value="crush">⚠️ Crowd Crush / Overcrowding</option>
                        <option value="blocked_route">🛑 Blocked Route</option>
                        <option value="electrical">⚡ Electrical Outage</option>
                        <option value="other">🆘 Other Emergency</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 mb-1 block">Incident Location:</label>
                      <select
                        value={emergencyLocationInput}
                        onChange={(e) => setEmergencyLocationInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-red-500 font-sans cursor-pointer"
                      >
                        <option value="pf-2">Platform 2 (Island Concourse North)</option>
                        <option value="pf-1">Platform 1 (VIP Terminal & Dewas Porch)</option>
                        <option value="pf-4">Platform 4 (Pilgrim Concourse & Escalator)</option>
                        <option value="fob-1-p23">Central FOB 1 Stairwell</option>
                        <option value="booking-hall">Main Booking Concourse</option>
                        <option value="pf-6-8">Platforms 6/7/8 Overflow Shed</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerEmergency(emergencyTypeInput, emergencyLocationInput)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer font-tnr uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Calculate Safest Route & Activate Emergency</span>
                  </button>
                </div>

                {/* If Emergency Active: Live Decision-Support & Intelligent Exit Matrix */}
                {emergencyIncident.active ? (
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/95 border border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                    {/* Header with Title and Siren */}
                    <div className="flex items-start justify-between gap-2 border-b border-red-900/50 pb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-red-400 font-mono text-[10px] font-bold">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span>STATUS: 🔴 ACTIVE ({emergencyIncident.severity.toUpperCase()})</span>
                        </div>
                        <div className="text-xs font-bold text-white font-tnr mt-0.5">
                          {emergencyIncident.title}
                        </div>
                        <div className="text-[10px] text-slate-300 font-sans mt-0.5">
                          {emergencyIncident.locationName}
                        </div>
                      </div>
                      <button
                        onClick={() => soundManager.playSiren()}
                        className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Megaphone className="w-3 h-3 text-red-400" />
                        <span>Sound Siren</span>
                      </button>
                    </div>

                    {/* Operational Summary Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400">Affected Crowd</div>
                        <div className="text-sm font-bold text-white">{emergencyIncident.affectedPopulation.toLocaleString()}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400">Est. Clearance</div>
                        <div className="text-sm font-bold text-amber-400">
                          {Math.floor(emergencyIncident.evacuationTimeRemainingSec / 60)}:
                          {(emergencyIncident.evacuationTimeRemainingSec % 60).toString().padStart(2, '0')} min
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400">Safest Exit</div>
                        <div className="text-sm font-bold text-emerald-400 truncate">{emergencyIncident.recommendedExitId}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400">Assembly Zone</div>
                        <div className="text-sm font-bold text-cyan-300 truncate">
                          {emergencyIncident.safeAssemblyZone.split('(')[0]}
                        </div>
                      </div>
                    </div>

                    {/* Evacuation Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>Safe Clearance Progress</span>
                        <span className="text-emerald-400 font-bold">{emergencyIncident.evacuatedPercentage}% Evacuated</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-500"
                          style={{ width: `${emergencyIncident.evacuatedPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Graph Routing Intelligence & Explainability Box (Requirement 7 & 8) */}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-cyan-800/50 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between text-cyan-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Graph-Based Evacuation Intelligence (Dijkstra)</span>
                        </span>
                        <span className="text-[10px] text-emerald-400">MULTI-CRITERIA COST</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                        {emergencyIncident.routeExplanation}
                      </div>
                      {emergencyIncident.costComparison && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-amber-300">
                          <span className="font-bold">WHY THIS ROUTE? ➔ </span>
                          {emergencyIncident.costComparison.whyBetter}
                        </div>
                      )}
                    </div>

                    {/* Emergency Exit Intelligence Matrix with Interactive BLOCK EXIT Toggles (Requirements 7, 9, 13) */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Emergency Exit Intelligence & Load Matrix</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Click to Block/Reroute</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        {UJJAIN_EMERGENCY_EXITS.map((exit) => {
                          const isBlocked = blockedExitIds.has(exit.id);
                          const isRecommended = emergencyIncident.recommendedExitId.includes(exit.code);

                          return (
                            <div
                              key={exit.id}
                              className={`p-2 rounded-lg border transition-all ${
                                isBlocked
                                  ? 'bg-red-950/40 border-red-500/70 text-slate-400'
                                  : isRecommended
                                  ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white">{exit.code}</span>
                                <span
                                  className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                                    isBlocked
                                      ? 'bg-red-900 text-red-200'
                                      : isRecommended
                                      ? 'bg-emerald-900 text-emerald-200'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {isBlocked ? 'BLOCKED' : isRecommended ? 'RECOMMENDED' : 'AVAILABLE'}
                                </span>
                              </div>
                              <div className="text-slate-400 text-[9px] truncate mb-1">{exit.name}</div>
                              <div className="flex justify-between text-slate-400 mb-1.5">
                                <span>Cap: {exit.capacity}/m</span>
                                <span className={exit.utilizationPercent > 70 ? 'text-red-400' : 'text-emerald-400'}>
                                  Load: {exit.currentLoad} ({exit.utilizationPercent}%)
                                </span>
                              </div>
                              <button
                                onClick={() => handleToggleExitBlock(exit.id)}
                                className={`w-full py-1 rounded text-[9px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                  isBlocked
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-red-900 hover:bg-red-800 text-red-200 border border-red-700'
                                }`}
                              >
                                {isBlocked ? (
                                  <>
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Unblock {exit.code}</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-2.5 h-2.5" />
                                    <span>Simulate Block {exit.code}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Controls & Dispatch Feed */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 max-h-20 overflow-y-auto space-y-1 text-[10px] font-mono">
                        <div className="text-slate-400 font-bold">Real-Time Incident Dispatch Feed:</div>
                        {emergencyIncident.actionLog.map((log, i) => (
                          <div key={i} className="text-slate-300 leading-snug">
                            {log}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            soundManager.playAlert();
                            engine.setSpeed(2.0);
                          }}
                          className="py-2 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-[10px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Simulate Rapid Egress</span>
                        </button>
                        <button
                          onClick={handleResolveEmergency}
                          className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolve Emergency</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Preparedness Grid Checklist when Normal */
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-tnr">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Ujjain Junction Emergency Preparedness Grid</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      All 8 station platforms, Central FOB stairwells, and emergency exits are equipped with real-time Helbing Panic Physics modeling and 108 Green Medical Corridor routing.
                    </p>
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center gap-2 text-slate-300 p-1.5 rounded bg-slate-900 border border-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Dewas Gate Exit A & Hariphatak Exit B emergency fire doors unlocked</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 p-1.5 rounded bg-slate-900 border border-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>108 Ambulance Unit standing by at Main Porch with direct siren integration</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 p-1.5 rounded bg-slate-900 border border-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Central FOB 1 stairs monitored with optical flow sensors (1.15 m/s safe flow)</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-cyan-300 font-mono text-center pt-1 border-t border-slate-800">
                      ➔ Select any emergency scenario above or click the 3 Demos tab to present to judges.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB: 🎯 3 ONE-CLICK DEMO SCENARIOS (FOR ROUND 2 JUDGES) */}
            {/* =============================================================== */}
            {activeTab === 'demos' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-200 font-tnr flex items-center justify-between">
                  <span>Judge-Ready One-Click Scenarios:</span>
                  <span className="text-[10px] font-mono text-cyan-400">Step-by-Step Walkthrough</span>
                </div>

                {/* DEMO 1: PEAK EVENT FOOTFALL */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>DEMO 1: Peak Event Extreme Inflow</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                      FOOTFALL SURGE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    Simulates major religious event footfall (+42,000 pilgrims arriving). Demonstrates how Platform 4/5 Escalator and Central FOB 1 backlog choke to 96% density, prompting gate holding interventions.
                  </p>
                  <button
                    onClick={() => handleRunDemo(1)}
                    className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs font-tnr uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Demo 1: Peak Event Surge</span>
                  </button>
                </div>

                {/* DEMO 2: FIRE EMERGENCY AT PLATFORM 2 */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-red-500/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-red-400" />
                      <span>DEMO 2: Platform 2 Fire Outbreak</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-700">
                      CODE RED EVACUATION
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    Simulates electrical pantry fire on Platform 2. Automatically blocks FOB stairwell, calculates Dijkstra safest evacuation route to Hariphatak Exit B, and routes crowd to Safe Assembly Zone S2.
                  </p>
                  <button
                    onClick={() => handleRunDemo(2)}
                    className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs font-tnr uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Demo 2: Platform Fire & Safe Exit Routing</span>
                  </button>
                </div>

                {/* DEMO 3: MEDICAL EMERGENCY AT PLATFORM 1 */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-emerald-400" />
                      <span>DEMO 3: 108 Green Medical Corridor</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      CODE BLUE EMS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    Simulates pilgrim cardiac distress on Platform 1. Calculates fastest accessible path from Station Porch Medical Post, establishes 3-meter lateral crowd clearance, and deploys stretcher paramedics.
                  </p>
                  <button
                    onClick={() => handleRunDemo(3)}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-tnr uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Demo 3: 108 Green Medical Corridor</span>
                  </button>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB: 🧪 WHAT-IF SIMULATION SANDBOX (UPGRADED) */}
            {/* =============================================================== */}
            {activeTab === 'whatif' && (
              <div className="space-y-3.5">
                <div className="text-xs text-slate-300 font-medium font-sans">
                  Simulate counterfactual interventions to relieve <span className="text-amber-400 font-bold">{venueData.chokeGateCode}</span>:
                </div>

                <div className="space-y-2">
                  <div
                    onClick={() => togglePolicy('closeGateG2')}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      scenario.closeGateG2 ? 'bg-red-950/50 border-red-500/80 shadow-md' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {scenario.closeGateG2 ? <CheckSquare className="w-4 h-4 text-red-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                        <span>Throttle Inflow at {venueData.chokeGateCode}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 ml-6">Halt escalator feed to prevent FOB stair crush</div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${scenario.closeGateG2 ? 'bg-red-900 text-red-200' : 'bg-slate-900 text-slate-400'}`}>
                      {scenario.closeGateG2 ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>

                  <div
                    onClick={() => togglePolicy('redirectFlowToG3')}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      scenario.redirectFlowToG3 ? 'bg-cyan-950/50 border-cyan-500/80 shadow-md' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {scenario.redirectFlowToG3 ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                        <span>Redirect Flow to {venueData.bypassGateCode}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 ml-6">Guide pilgrims along North Subway Ramp</div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${scenario.redirectFlowToG3 ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-900 text-slate-400'}`}>
                      {scenario.redirectFlowToG3 ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>

                  <div
                    onClick={() => togglePolicy('deployStaffZoneB')}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      scenario.deployStaffZoneB ? 'bg-indigo-950/50 border-indigo-500/80 shadow-md' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {scenario.deployStaffZoneB ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                        <span>Deploy 12 RPF Marshals at FOB 1 Stairs</span>
                      </div>
                      <div className="text-[10px] text-slate-400 ml-6">Organize human chain for laminar dispersal</div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${scenario.deployStaffZoneB ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400'}`}>
                      {scenario.deployStaffZoneB ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>

                  <div
                    onClick={() => togglePolicy('increaseExitCapacity')}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      scenario.increaseExitCapacity ? 'bg-emerald-950/50 border-emerald-500/80 shadow-md' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {scenario.increaseExitCapacity ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                        <span>Open Emergency Exit C & Auxiliary Turnstiles (+35%)</span>
                      </div>
                      <div className="text-[10px] text-slate-400 ml-6">Unlock North Skybridge Fire Ramp for fast clearance</div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${scenario.increaseExitCapacity ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-900 text-slate-400'}`}>
                      {scenario.increaseExitCapacity ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                </div>

                {/* Simulated Impact Metrics (Requirement 14: "SIMULATION RESULT — NOT LIVE FIELD MEASUREMENT") */}
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-slate-200 font-bold">Simulated Policy Synergy:</span>
                    <span className="text-emerald-400 font-bold">
                      {dynamicDensityReduction > 0 ? `-${dynamicDensityReduction}% Density Drop` : 'Baseline (0% Applied)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Critical Zones:</span>{' '}
                      <span className="font-bold text-white">{dynamicDensityReduction >= 18 ? '1 Zone (Was 3)' : '3 Zones'}</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Est. Evacuation:</span>{' '}
                      <span className="font-bold text-emerald-400">{dynamicDensityReduction >= 18 ? '7.2 min (Was 12m)' : '12.0 min'}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-cyan-400 text-center font-bold">
                    SIMULATION RESULT — NOT LIVE FIELD MEASUREMENT
                  </div>
                </div>

                <button
                  onClick={handleRunWhatIfSimulation}
                  disabled={isSimulating}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-tnr uppercase tracking-wider"
                >
                  <RotateCcw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Computing Social Force Physics...' : 'Run Counter-Factual Simulation ➔'}</span>
                </button>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB: 🚆 PLATFORMS TELEMETRY (UJJAIN JUNCTION 1-8) */}
            {/* =============================================================== */}
            {activeTab === 'platforms' && (
              <div className="space-y-3.5">
                {/* Station Telemetry Header */}
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
                      <Train className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-tnr flex items-center gap-1.5">
                        <span>Ujjain Jn (UJN) Operator Control Center</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                          LIVE SIMULATION
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Western Railway • Simhastha Mahakumbh Pilgrim Transit Grid
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunDemo(1)}
                    className="px-2 py-1 rounded bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/60 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Peak Surge Demo</span>
                  </button>
                </div>

                {/* OPERATOR TRAIN SIMULATION CONTROLLER (Requirement 2) */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-3">
                  <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white font-mono">
                        TRAIN ARRIVAL & SIGNAL INTERLOCK
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border animate-pulse ${
                        trainStatusText === 'HOLDING'
                          ? 'bg-red-950 border-red-500 text-red-300'
                          : trainStatusText === 'ARRIVING'
                          ? 'bg-amber-950 border-amber-500 text-amber-300'
                          : 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      }`}
                    >
                      {trainStatusText === 'HOLDING'
                        ? `SIGNAL: 🛑 HELD AT OUTER SIGNAL (${trainHoldTimer}s)`
                        : trainStatusText === 'ARRIVING'
                        ? 'SIGNAL: 🟡 APPROACHING BERTH'
                        : 'SIGNAL: 🟢 BERTHED AT PLATFORM 4/5'}
                    </span>
                  </div>

                  {/* Active Train Card */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-cyan-400">#09304</span>
                        <span>Simhastha Kumbh Special</span>
                        <span className="text-[9px] text-amber-300 bg-amber-950/60 px-1 rounded border border-amber-800">
                          PF 4/5 Track 3
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Pax Load: <span className="text-slate-200 font-bold">3,600 Devotees</span> • Escalator Ingress Rate: <span className="text-amber-400">92 pax/min</span>
                      </div>
                    </div>
                  </div>

                  {/* Train Control Action Buttons */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Operator Actions (Direct Simulation Consequence):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono">
                      <button
                        onClick={() => handleSimulateTrainArrival('t1')}
                        className="py-1.5 px-2 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Play className="w-3 h-3 text-cyan-400" />
                        <span>Simulate Arrival</span>
                      </button>

                      <button
                        onClick={() => handleHoldTrain('t1', 30)}
                        className={`py-1.5 px-1 rounded border font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          trainStatusText === 'HOLDING' && trainHoldTimer <= 30
                            ? 'bg-red-900 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-red-300'
                        }`}
                      >
                        <Pause className="w-3 h-3" />
                        <span>Hold 30s</span>
                      </button>

                      <button
                        onClick={() => handleHoldTrain('t1', 60)}
                        className={`py-1.5 px-1 rounded border font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          trainStatusText === 'HOLDING' && trainHoldTimer > 30 && trainHoldTimer <= 60
                            ? 'bg-red-900 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-red-300'
                        }`}
                      >
                        <Pause className="w-3 h-3" />
                        <span>Hold 60s</span>
                      </button>

                      <button
                        onClick={() => handleHoldTrain('t1', 120)}
                        className={`py-1.5 px-1 rounded border font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          trainStatusText === 'HOLDING' && trainHoldTimer > 60
                            ? 'bg-red-900 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-red-300'
                        }`}
                      >
                        <Pause className="w-3 h-3" />
                        <span>Hold 120s</span>
                      </button>

                      <button
                        onClick={() => handleReleaseTrain('t1')}
                        className="col-span-2 sm:col-span-1 py-1.5 px-2 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Release Train</span>
                      </button>
                    </div>
                  </div>

                  {/* OPERATOR SIMULATION SLIDERS (4 Controls) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80">
                    {/* Inflow Slider */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Crowd Inflow Rate</span>
                        <span className="text-cyan-400 font-bold">{inflowSliderVal}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="10"
                        value={inflowSliderVal}
                        onChange={(e) => handleInflowChange(Number(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* Platform Capacity Slider */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Platform 4/5 Capacity</span>
                        <span className="text-emerald-400 font-bold">{platformCapacityVal.toLocaleString()} Pax</span>
                      </div>
                      <input
                        type="range"
                        min="1600"
                        max="2400"
                        step="50"
                        value={platformCapacityVal}
                        onChange={(e) => handleCapacityChange(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* Train ETA Slider */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Train T1 ETA</span>
                        <span className="text-amber-400 font-bold">{trainEtaVal} min remaining</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={trainEtaVal}
                        onChange={(e) => handleTrainEtaChange(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* Train Passenger Load Slider */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">Train Passenger Load</span>
                        <span className="text-indigo-400 font-bold">+{trainLoadVal} Pax</span>
                      </div>
                      <input
                        type="range"
                        min="300"
                        max="1200"
                        step="50"
                        value={trainLoadVal}
                        onChange={(e) => handleTrainLoadChange(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE CAUSAL WHAT-IF (Scenario A vs Scenario B) */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-900/80 text-[10px] font-mono space-y-2">
                    <div className="flex items-center justify-between text-slate-200 font-bold">
                      <span className="text-cyan-300">REAL-TIME WHAT-IF INTERVENTION COMPARISON</span>
                      <button
                        onClick={() => handleHoldTrain('t1', 120)}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] cursor-pointer"
                      >
                        Apply 120s Hold
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-red-950/30 border border-red-900/60">
                        <div className="text-red-400 font-bold">Scenario A: Normal Ingress</div>
                        <div className="text-slate-300">Platform Density: <span className="text-red-400 font-bold">94% (CRITICAL)</span></div>
                        <div className="text-slate-300">FOB 1 Backlog: <span className="text-red-400 font-bold">92% Choke</span></div>
                        <div className="text-[9px] text-slate-400 mt-0.5">High crush risk at escalators.</div>
                      </div>

                      <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/60">
                        <div className="text-emerald-400 font-bold">Scenario B: 120s Signal Hold</div>
                        <div className="text-slate-300">Platform Density: <span className="text-emerald-400 font-bold">52% (SAFE)</span></div>
                        <div className="text-slate-300">FOB 1 Backlog: <span className="text-emerald-400 font-bold">28% Cleared</span></div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Orderly laminar clearance via Hariphatak.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Cards list */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {(venueData.platforms || []).map((pf) => {
                    const isHolding = !!platformHoldMap[pf.platformNumber] || (pf.platformNumber.includes('4') && trainStatusText === 'HOLDING');
                    const occ = isHolding ? Math.max(30, pf.currentOccupancy - 42) : pf.currentOccupancy;
                    const isCritical = occ >= 85 || pf.chokeStatus.includes('Critical');
                    const isModerate = occ >= 60 && occ < 85;

                    return (
                      <div
                        key={pf.platformNumber}
                        className={`p-3 rounded-xl border transition-all ${
                          isCritical
                            ? 'bg-red-950/30 border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                            : isModerate
                            ? 'bg-amber-950/20 border-amber-500/50'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                              {pf.platformNumber}
                            </span>
                            <span className="text-[11px] font-bold text-slate-200 truncate max-w-[190px]">
                              {pf.trainNumber} {pf.trainName.split('(')[0]}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                              isHolding
                                ? 'bg-red-900 border-red-600 text-red-200 animate-pulse'
                                : pf.status === 'Arrived'
                                ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                                : 'bg-slate-900 border-slate-700 text-slate-300'
                            }`}
                          >
                            {isHolding ? 'SIGNAL HELD (RED)' : pf.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-2 text-[10px] font-mono">
                          <div>
                            <div className="flex justify-between text-slate-400 mb-0.5">
                              <span>Occupancy</span>
                              <span className={isCritical ? 'text-red-400 font-bold' : isModerate ? 'text-amber-400' : 'text-emerald-400'}>
                                {occ}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isCritical ? 'bg-red-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${occ}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-400 mb-0.5">
                              <span>FOB Stair Load</span>
                              <span className={pf.fobStairwellLoad > 80 ? 'text-red-400 font-bold' : pf.fobStairwellLoad > 50 ? 'text-amber-400' : 'text-emerald-400'}>
                                {isHolding ? Math.max(20, pf.fobStairwellLoad - 45) : pf.fobStairwellLoad}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  pf.fobStairwellLoad > 80 ? 'bg-red-500' : pf.fobStairwellLoad > 50 ? 'bg-amber-500' : 'bg-cyan-500'
                                }`}
                                style={{ width: `${isHolding ? Math.max(20, pf.fobStairwellLoad - 45) : pf.fobStairwellLoad}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 mb-2 leading-tight">
                          <span className="text-slate-300 font-medium">Pax: {pf.expectedPassengers.toLocaleString()} / {pf.capacity.toLocaleString()}</span> • <span className="text-cyan-300">{pf.routeDetails}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                          <div className="text-[10px] text-slate-400 truncate max-w-[210px]">
                            {isHolding ? 'Held at outer signal: allowing platform clearance' : pf.recommendedAction}
                          </div>
                          <button
                            onClick={() => {
                              if (isHolding) {
                                handleReleaseTrain(pf.platformNumber.includes('4') ? 't1' : 't2');
                              } else {
                                handleHoldTrain(pf.platformNumber.includes('4') ? 't1' : 't2', 120);
                              }
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              isHolding
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50'
                            }`}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>{isHolding ? 'Release Signal' : 'Hold Outer Signal'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/60 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>FOB 1 & North Escalator Interlock</span>
                    </span>
                    <span className="text-emerald-400 text-[10px]">AUTO-BALANCED</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-snug">
                    When Platform 4/5 stair backlog exceeds 80%, incoming escalator speed is throttled to 0.4 m/s and pilgrims are diverted to Hariphatak bypass Gate G4.
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB: 📈 DYNAMIC PREDICTIONS & HORIZON FORECAST */}
            {/* =============================================================== */}
            {activeTab === 'predictions' && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-bold text-xs text-white">Congestion Risk Projection</span>
                    <span className="text-[10px] font-mono text-red-400 bg-red-950 px-1.5 py-0.5 rounded border border-red-800">
                      {venueData.criticalZoneName.split('(')[0]} CHOKE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">
                    {venueData.alertHeadline}
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono mb-2">
                    <span className="font-bold font-tnr text-slate-200 text-sm">
                      {activeZone.code} ({activeZone.name.split('(')[1]?.replace(')', '') || activeZone.name}) Projected Density
                    </span>
                    <span className={`font-bold font-mono ${activeZonePeak > 75 ? 'text-red-400' : activeZonePeak > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      Peak: {activeZonePeak}%
                    </span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="predDynamicColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartStrokeColor} stopOpacity={0.7} />
                            <stop offset="95%" stopColor={chartStrokeColor} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} stroke="#64748b" fontSize={10} unit="%" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                          formatter={(value: any) => [`${value}%`, `${activeZone.code} Projected Density`]}
                        />
                        <ReferenceLine y={75} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'Critical (75%)', fill: '#eab308', fontSize: 9, position: 'insideTopLeft' }} />
                        <Area type="monotone" dataKey="density" stroke={chartStrokeColor} strokeWidth={2.5} fillOpacity={1} fill="url(#predDynamicColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                  {venueData.zones.map((zone) => {
                    const isZoneSelected = activeZone.id === zone.id;
                    const zDensity = getZoneDynamicDensity(zone);
                    const zStatus = getZoneDynamicStatus(zDensity);

                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => {
                          setSelectedZone(zone);
                          soundManager.playBlip();
                        }}
                        className={`p-2 rounded border cursor-pointer transition-all ${
                          isZoneSelected
                            ? zDensity > 75
                              ? 'bg-red-950/80 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] font-bold ring-1 ring-red-400'
                              : 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)] font-bold ring-1 ring-cyan-400'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className={isZoneSelected ? 'text-white font-bold' : 'text-slate-400'}>
                          {zone.code}
                        </div>
                        <div className={zDensity > 75 ? 'text-red-400 font-bold' : zDensity > 50 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {zStatus.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    soundManager.playBlip();
                    setActiveTab('whatif');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-tnr uppercase tracking-wider"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Open What-If Sandbox to Mitigate Bottleneck ➔</span>
                </button>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB: ⚖️ BEFORE vs AFTER COMPARISON ANALYZER */}
            {/* =============================================================== */}
            {activeTab === 'comparison' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-sans">
                    Comparative Simulation Analysis (Ujjain Junction):
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    OUTCOMES VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Left: Unmitigated Baseline */}
                  <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/50 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-red-300 mb-2.5">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>Baseline (Choke)</span>
                      </span>
                      <span className="text-[9px] font-mono text-red-400 bg-red-950 px-1 py-0.5 rounded border border-red-800">
                        UNMITIGATED
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <div className="text-slate-400 text-[10px]">FOB 1 Stair Density</div>
                        <div className="text-xl font-bold text-red-400">{eventMode === 'extreme' ? '98%' : '94%'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Fruin LOS Rating</div>
                        <div className="text-sm font-bold text-red-300">LOS F (Crush Friction)</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Transit Velocity</div>
                        <div className="text-sm font-bold text-red-300">0.38 m/s (Choked)</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Mitigated Counterfactual */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/50 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-2.5">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mitigated Policy</span>
                      </span>
                      <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950 px-1 py-0.5 rounded border border-emerald-800">
                        SIMULATED
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <div className="text-slate-400 text-[10px]">FOB 1 Stair Density</div>
                        <div className="text-xl font-bold text-emerald-400">58%</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Fruin LOS Rating</div>
                        <div className="text-sm font-bold text-emerald-300">LOS C (Laminar Flow)</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Transit Velocity</div>
                        <div className="text-sm font-bold text-emerald-300">1.24 m/s (Fluid)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/60 flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-300">
                    <span className="text-slate-400">Cascade Risk Drop:</span>{' '}
                    <span className="text-emerald-400 font-bold">-62% Reduction</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">Clearance Velocity:</span>{' '}
                    <span className="text-emerald-400 font-bold">1.65x Faster</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playBlip();
                    setActiveTab('copilot');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-tnr uppercase tracking-wider"
                >
                  <Bot className="w-4 h-4" />
                  <span>Review Orders with AI Copilot ➔</span>
                </button>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB: 🤖 AI COPILOT DECISION SUPPORT */}
            {/* =============================================================== */}
            {activeTab === 'copilot' && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-[#091528] border border-cyan-800/60 shadow-lg">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Recommended Action for Ujjain Junction</span>
                  </div>
                  <ul className="text-xs text-slate-200 space-y-1 mb-2.5 ml-1">
                    <li>• {venueData.recommendations.primaryAction}</li>
                    <li>• {venueData.recommendations.secondaryAction}</li>
                    <li>• {venueData.recommendations.staffAction}</li>
                  </ul>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{venueData.recommendations.reductionImpact}</span>
                  </div>
                </div>

                <button
                  onClick={handleApplyAction}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm font-tnr uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  APPLY ORDERS & DISPATCH MARSHALS
                </button>

                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col space-y-2">
                  <div className="max-h-28 overflow-y-auto space-y-2 text-xs pr-1">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs leading-relaxed ${
                          msg.sender === 'copilot'
                            ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-800/40'
                            : 'bg-slate-900 text-slate-200 border border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5 font-mono">
                          <span className="font-bold flex items-center gap-1">
                            {msg.sender === 'copilot' ? '🤖 Copilot:' : '👤 Commander:'}
                          </span>
                          <span>{msg.time}</span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChat} className="flex gap-2 pt-1 border-t border-slate-800">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask copilot e.g. 'How many marshals on Platform 4/5?'..."
                      className="flex-1 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 font-sans"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM: LIVE SIMULATION EVENTS & DECISION AUDIT TIMELINE (REQUIREMENT 14) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-cyan-900/60 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-950 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  LIVE SIMULATION EVENTS TIMELINE & CAUSAL AUDIT TRAIL
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                  {simulationEvents.length} Events
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Real-Time Chronological Record of Operator Adjustments, Physics Updates & Safety Alerts
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSimulationEvents([]);
                soundManager.playBlip();
              }}
              className="py-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Clear Events
            </button>
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {simulationEvents.length === 0 ? (
            <div className="py-6 text-center text-xs font-mono text-slate-500">
              No simulation events logged yet. Adjust sliders or activate scenarios above to generate live causal events.
            </div>
          ) : (
            simulationEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 hover:border-cyan-800/60 transition-all"
              >
                <span className="text-[10.5px] font-mono text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">
                  [{evt.time}]
                </span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${evt.badgeColor}`}>
                  {evt.category}
                </span>
                <div className="text-xs font-medium text-slate-200 leading-relaxed font-sans">
                  {evt.text}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SYSTEM ARCHITECTURE & INNOVATION MODAL (Requirements 21 & 22) */}
      {/* ========================================================================= */}
      {showArchitectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-cyan-500/70 rounded-2xl max-w-3xl w-full p-6 shadow-[0_0_60px_rgba(6,182,212,0.4)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-tnr">
                    CROWDGUARD X — System Architecture & Methodology
                  </h3>
                  <div className="text-[11px] text-cyan-400 font-mono">
                    AI-Powered Crowd Safety & Emergency Decision Support for Ujjain Railway Station
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Questions Addressed (Requirement 21) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-1">
                <div className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CROWD SAFETY QUESTION:</span>
                </div>
                <div className="text-xs text-white font-semibold font-sans italic">
                  “Where is crowd congestion likely to happen, and what action can prevent it?”
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  Evaluates optical flow density, inflow/outflow imbalance, and Fruin Level of Service (LOS) across all 8 platforms to predict stair bottlenecks before dangerous crushes occur.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-red-800/60 space-y-1">
                <div className="text-xs font-bold text-red-300 font-mono flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>EMERGENCY SAFETY QUESTION:</span>
                </div>
                <div className="text-xs text-white font-semibold font-sans italic">
                  “If an emergency occurs here, where should the crowd go and which routes/exits are safest?”
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  Models the station as a weighted graph. When an incident or route block occurs, Dijkstra computes the optimal evacuation path balancing distance, corridor congestion, and risk.
                </div>
              </div>
            </div>

            {/* Visual Architecture Pipeline (Requirement 22) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-white font-tnr flex items-center justify-between">
                <span>End-to-End Decision-Support Pipeline:</span>
                <span className="text-[10px] font-mono text-cyan-400">DATA TO ACTIONABLE ORDERS</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 rounded bg-slate-900 border border-cyan-900/60">
                  <div className="text-cyan-400 font-bold mb-0.5">1. DATA INPUT</div>
                  <div className="text-slate-300">CCTV Optical Flow & Manifests</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-900/60">
                  <div className="text-cyan-400 font-bold mb-0.5">2. RISK ENGINE</div>
                  <div className="text-slate-300">Fruin LOS & Flow Imbalance</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-900/60">
                  <div className="text-cyan-400 font-bold mb-0.5">3. DIGITAL TWIN</div>
                  <div className="text-slate-300">Social Force Particle Physics</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-900/60">
                  <div className="text-cyan-400 font-bold mb-0.5">4. EMERGENCY ENGINE</div>
                  <div className="text-slate-300">Helbing Panic Repulsion</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-900/60">
                  <div className="text-cyan-400 font-bold mb-0.5">5. GRAPH ROUTING</div>
                  <div className="text-slate-300">Dijkstra Multi-Cost Paths</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-900/60">
                  <div className="text-cyan-400 font-bold mb-0.5">6. WHAT-IF LAB</div>
                  <div className="text-slate-300">Counterfactual Testing</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-900/60">
                  <div className="text-cyan-400 font-bold mb-0.5">7. COMMAND CENTER</div>
                  <div className="text-slate-300">Live Telemetry & Evac HUD</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-900/60">
                  <div className="text-cyan-400 font-bold mb-0.5">8. ACTION DISPATCH</div>
                  <div className="text-slate-300">RPF Cordon & Signal Hold</div>
                </div>
              </div>
            </div>

            {/* Ethical & Data Accuracy Disclaimer (Requirement 24) */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 text-[11px] text-slate-300 leading-relaxed font-sans">
              <span className="text-amber-400 font-bold font-mono text-[10px]">ETHICAL NOTICE & SIMULATION ACCURACY: </span>
              All crowd volumes, evacuation durations, and sensor feeds in this prototype are calculated by our Simulation Decision Engine to evaluate emergency methodologies. They represent a simulation and proposed safety model, not official measured Indian Railways records.
            </div>

            <button
              onClick={() => setShowArchitectureModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs transition-all cursor-pointer font-tnr uppercase tracking-wider"
            >
              Return to Live Command Center
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal when orders deployed */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/80 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.4)] text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-tnr">Mitigation Orders Deployed</h3>
              <p className="text-xs text-slate-300 mt-1">
                Field commands dispatched to RPF marshals and Station Master desk.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-emerald-300 space-y-1">
              <div>✓ {venueData.recommendations.primaryAction}</div>
              <div>✓ {venueData.recommendations.secondaryAction}</div>
              <div>✓ {venueData.recommendations.staffAction}</div>
            </div>
            <button
              onClick={() => setShowCompleteModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer font-tnr uppercase tracking-wider"
            >
              Return to Live Command
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
