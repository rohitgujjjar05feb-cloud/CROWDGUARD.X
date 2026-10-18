import {
  CrowdAgent,
  ScenarioSettings,
  EmergencyIncident,
  VenueType,
  TrainSimulationData,
  TrainSimulationState,
  EmergencyLevel,
  CentralSimulationState,
} from '../types';

export interface PathPoint {
  x: number;
  y: number;
}

// Multi-exit comprehensive navigation network
// Exit A: (180, 515), Exit B: (420, 515), Exit C: (620, 515)
export const ROUTE_WAYPOINTS: Record<string, PathPoint[]> = {
  // Routes from Gate A (West Ingress: x 160, y 35)
  gateA_exitA: [
    { x: 160, y: 35 },
    { x: 160, y: 110 },
    { x: 160, y: 190 },
    { x: 170, y: 270 },
    { x: 180, y: 360 },
    { x: 180, y: 440 },
    { x: 180, y: 515 },
  ],
  gateA_exitB: [
    { x: 160, y: 35 },
    { x: 160, y: 110 },
    { x: 160, y: 190 },
    { x: 200, y: 260 },
    { x: 270, y: 330 },
    { x: 350, y: 400 },
    { x: 420, y: 460 },
    { x: 420, y: 515 },
  ],
  gateA_exitC: [
    { x: 160, y: 35 },
    { x: 160, y: 110 },
    { x: 200, y: 220 },
    { x: 290, y: 310 },
    { x: 410, y: 370 },
    { x: 520, y: 420 },
    { x: 620, y: 460 },
    { x: 620, y: 515 },
  ],

  // Routes from Gate B (Central Main Ingress: x 410, y 35)
  gateB_exitB: [
    { x: 410, y: 35 },
    { x: 410, y: 95 },
    { x: 410, y: 160 },
    { x: 410, y: 220 },
    { x: 410, y: 290 },
    { x: 410, y: 370 },
    { x: 420, y: 450 },
    { x: 420, y: 515 },
  ],
  gateB_exitA: [
    { x: 410, y: 35 },
    { x: 410, y: 80 },
    { x: 330, y: 80 },
    { x: 240, y: 150 },
    { x: 180, y: 260 },
    { x: 180, y: 360 },
    { x: 180, y: 440 },
    { x: 180, y: 515 },
  ],
  gateB_exitC: [
    { x: 410, y: 35 },
    { x: 410, y: 80 },
    { x: 490, y: 80 },
    { x: 560, y: 120 },
    { x: 620, y: 200 },
    { x: 620, y: 320 },
    { x: 620, y: 420 },
    { x: 620, y: 515 },
  ],

  // Routes from Gate C (East Skybridge Ingress: x 620, y 45)
  gateC_exitC: [
    { x: 620, y: 45 },
    { x: 620, y: 130 },
    { x: 620, y: 220 },
    { x: 620, y: 310 },
    { x: 620, y: 390 },
    { x: 620, y: 450 },
    { x: 620, y: 515 },
  ],
  gateC_exitB: [
    { x: 620, y: 45 },
    { x: 620, y: 130 },
    { x: 620, y: 220 },
    { x: 570, y: 310 },
    { x: 500, y: 390 },
    { x: 440, y: 450 },
    { x: 420, y: 515 },
  ],
  gateC_exitA: [
    { x: 620, y: 45 },
    { x: 620, y: 130 },
    { x: 520, y: 220 },
    { x: 380, y: 290 },
    { x: 260, y: 350 },
    { x: 180, y: 430 },
    { x: 180, y: 515 },
  ],

  // Routes from Platform 4/5 (Track 3) after Train Deboarding
  platform_exitB: [
    { x: 520, y: 270 },
    { x: 450, y: 270 },
    { x: 410, y: 290 },
    { x: 410, y: 370 },
    { x: 420, y: 450 },
    { x: 420, y: 515 },
  ],
  platform_exitC: [
    { x: 560, y: 270 },
    { x: 620, y: 290 },
    { x: 620, y: 370 },
    { x: 620, y: 450 },
    { x: 620, y: 515 },
  ],
  platform_exitA: [
    { x: 500, y: 270 },
    { x: 410, y: 230 },
    { x: 300, y: 230 },
    { x: 220, y: 320 },
    { x: 180, y: 420 },
    { x: 180, y: 515 },
  ],

  // Backwards compatibility legacy keys
  route1: [
    { x: 160, y: 35 },
    { x: 160, y: 110 },
    { x: 160, y: 190 },
    { x: 190, y: 260 },
    { x: 260, y: 330 },
    { x: 340, y: 400 },
    { x: 420, y: 470 },
    { x: 420, y: 520 },
  ],
  route2: [
    { x: 410, y: 35 },
    { x: 410, y: 95 },
    { x: 410, y: 160 },
    { x: 410, y: 220 },
    { x: 410, y: 290 },
    { x: 410, y: 370 },
    { x: 420, y: 450 },
    { x: 420, y: 520 },
  ],
  route3: [
    { x: 620, y: 45 },
    { x: 620, y: 130 },
    { x: 620, y: 220 },
    { x: 620, y: 310 },
    { x: 600, y: 390 },
    { x: 520, y: 440 },
    { x: 440, y: 480 },
    { x: 440, y: 520 },
  ],
  rerouteG2toG3: [
    { x: 410, y: 35 },
    { x: 410, y: 80 },
    { x: 470, y: 80 },
    { x: 550, y: 80 },
    { x: 620, y: 100 },
    { x: 620, y: 180 },
    { x: 620, y: 270 },
    { x: 620, y: 350 },
    { x: 600, y: 400 },
    { x: 520, y: 440 },
    { x: 440, y: 480 },
    { x: 440, y: 520 },
  ],
};

export class SimulationEngine {
  agents: CrowdAgent[] = [];
  maxAgents: number = 320;
  baseMaxAgents: number = 320;
  width: number = 800;
  height: number = 540;
  isRunning: boolean = true;
  simulationSpeed: number = 1.0;
  venueType: VenueType = 'railway';
  emergencyIncident: EmergencyIncident | null = null;
  lastUpdateTime: number = Date.now();

  // =========================================================================
  // CENTRAL OPERATIONAL PARAMETERS (Controlled by Dashboard)
  // =========================================================================
  emergencyLevel: EmergencyLevel = 'NORMAL';
  inflowRate: number = 100; // 50% to 200%
  platformCapacity: number = 2000; // 1600 to 2400
  gateAOpen: boolean = true;
  gateBOpen: boolean = true;
  gateCOpen: boolean = true;
  exitAOpen: boolean = true;
  exitBOpen: boolean = true;
  exitCOpen: boolean = true;
  trainEtaMinutes: number = 2;
  trainPassengerLoad: number = 500;

  // Mathematical Telemetry Quantities
  simulatedPlatformCrowd: number = 1350;
  simulatedConcourseCrowd: number = 750;
  simulatedTotalCrowd: number = 2100;
  incomingFlow: number = 48; // pax/min
  outgoingFlow: number = 34; // pax/min
  netFlow: number = 14;
  predictedCrowd: number = 2200;
  predictedOvercapacity: boolean = false;
  averageSpeedMps: number = 1.15;
  riskLevel: 'Safe' | 'Medium' | 'High' | 'Critical' = 'Medium';
  lastZoneDensities: Record<string, number> = { 'zone-a': 35, 'zone-b': 82, 'zone-c': 55, 'zone-d': 88, exit: 65 };

  // Bottleneck queue counts at exits
  exitQueueCounts = {
    exitA: 0,
    exitB: 0,
    exitC: 0,
  };

  trains: TrainSimulationData[] = [
    {
      id: 't1',
      trainNumber: '#09304',
      trainName: 'Simhastha Kumbh Special',
      platform: 'Platform 4/5',
      assignedTrack: 3,
      status: 'APPROACHING',
      expectedPassengers: 500,
      currentPassengersOnboard: 500,
      holdTimerRemainingSec: 0,
      totalHoldSec: 0,
      trackPositionPercent: 35, // Approaching
      isHeld: false,
    },
    {
      id: 't2',
      trainNumber: '#12962',
      trainName: 'Avantika Superfast Express',
      platform: 'Platform 2/3',
      assignedTrack: 1,
      status: 'AT_PLATFORM',
      expectedPassengers: 420,
      currentPassengersOnboard: 0,
      holdTimerRemainingSec: 0,
      totalHoldSec: 0,
      trackPositionPercent: 100,
      isHeld: false,
    },
  ];

  scenario: ScenarioSettings = {
    closeGateG2: false,
    redirectFlowToG3: false,
    increaseExitCapacity: false,
    emergencyEvacuation: false,
    inflowRate: 100,
    deployStaffZoneB: false,
    gateAOpen: true,
    gateBOpen: true,
    exitAOpen: true,
    exitBOpen: true,
    exitCOpen: true,
  };

  constructor(width = 800, height = 540, agentCount = 320) {
    this.width = width;
    this.height = height;
    this.baseMaxAgents = agentCount;
    this.maxAgents = agentCount;
    this.initAgents();
  }

  // =========================================================================
  // ROUTE SELECTION & MATHEMATICAL COST EVALUATION (Requirement 2 & 3)
  // =========================================================================
  selectOptimalRoute(startGate: 'A' | 'B' | 'C' | 'PF', currentX = 410): { routeKey: string; destinationExit: 'A' | 'B' | 'C' } {
    // Determine accessible exits
    const candidateExits: { exit: 'A' | 'B' | 'C'; targetX: number; cost: number }[] = [
      { exit: 'A', targetX: 180, cost: 0 },
      { exit: 'B', targetX: 420, cost: 0 },
      { exit: 'C', targetX: 620, cost: 0 },
    ];

    // Compute routeCost = distance + densityPenalty + riskPenalty + closedPenalty
    candidateExits.forEach((cand) => {
      let isClosed = false;
      let queueCount = 0;
      if (cand.exit === 'A') {
        isClosed = !this.exitAOpen;
        queueCount = this.exitQueueCounts.exitA;
      } else if (cand.exit === 'B') {
        isClosed = !this.exitBOpen;
        queueCount = this.exitQueueCounts.exitB;
      } else if (cand.exit === 'C') {
        isClosed = !this.exitCOpen;
        queueCount = this.exitQueueCounts.exitC;
      }

      if (isClosed) {
        cand.cost += 99999; // Closed route eliminated
        return;
      }

      // Distance penalty
      cand.cost += Math.abs(currentX - cand.targetX);

      // Queue / Bottleneck density penalty
      cand.cost += queueCount * 4.5;

      // Risk penalty in emergency (Exit B is central bottleneck, higher penalty in panic)
      if (this.emergencyLevel === 'EMERGENCY') {
        if (cand.exit === 'B') cand.cost += 85;
      }
    });

    // Sort to pick lowest cost
    candidateExits.sort((a, b) => a.cost - b.cost);
    const chosenExit = candidateExits[0]?.cost < 90000 ? candidateExits[0].exit : 'C';

    // Map startGate + chosenExit to waypoint route
    if (startGate === 'A') {
      return { routeKey: `gateA_exit${chosenExit}`, destinationExit: chosenExit };
    }
    if (startGate === 'B') {
      if (!this.gateBOpen) {
        // Gate B closed -> divert to Gate A or C
        return Math.random() < 0.5
          ? { routeKey: `gateA_exit${chosenExit}`, destinationExit: chosenExit }
          : { routeKey: `gateC_exit${chosenExit}`, destinationExit: chosenExit };
      }
      return { routeKey: `gateB_exit${chosenExit}`, destinationExit: chosenExit };
    }
    if (startGate === 'C') {
      return { routeKey: `gateC_exit${chosenExit}`, destinationExit: chosenExit };
    }
    // Platform start
    return { routeKey: `platform_exit${chosenExit}`, destinationExit: chosenExit };
  }

  // =========================================================================
  // OPERATIONAL CONTROL SETTERS (Requirement 6)
  // =========================================================================
  setEmergencyLevel(level: EmergencyLevel) {
    this.emergencyLevel = level;
    this.scenario.emergencyLevel = level;

    // Direct, visible impact on agents
    this.agents.forEach((agent) => {
      if (level === 'EMERGENCY') {
        agent.behaviourState = 'EMERGENCY';
        agent.urgency = 0.95;
        // Re-evaluate exit preference based on cost
        const opt = this.selectOptimalRoute('B', agent.x);
        agent.preferredExit = opt.destinationExit;
      } else if (level === 'HIGH_DENSITY') {
        agent.behaviourState = 'CAUTION';
        agent.urgency = 0.60;
      } else {
        agent.behaviourState = 'NORMAL';
        agent.urgency = 0.20;
      }
    });
  }

  setCrowdInflow(ratePercent: number) {
    this.inflowRate = ratePercent;
    this.scenario.inflowRate = ratePercent;
    const target = Math.round(this.baseMaxAgents * (ratePercent / 100));
    this.maxAgents = Math.max(120, Math.min(480, target));

    this.incomingFlow = Math.round(48 * (ratePercent / 100));
    this.netFlow = this.incomingFlow - this.outgoingFlow;

    if (this.agents.length > this.maxAgents) {
      this.agents = this.agents.slice(0, this.maxAgents);
    } else {
      while (this.agents.length < this.maxAgents) {
        this.agents.push(this.createAgent(this.agents.length, true));
      }
    }
  }

  setPlatformCapacity(cap: number) {
    this.platformCapacity = cap;
    this.scenario.platformCapacity = cap;
  }

  setTrainEta(etaMinutes: number) {
    this.trainEtaMinutes = etaMinutes;
    this.scenario.trainEtaMinutes = etaMinutes;
    const t = this.trains.find((tr) => tr.id === 't1');
    if (t) {
      t.trackPositionPercent = Math.max(10, Math.min(90, Math.round((5 - etaMinutes) * 20)));
    }
  }

  setTrainPassengerLoad(load: number) {
    this.trainPassengerLoad = load;
    this.scenario.trainPassengerLoad = load;
    const t = this.trains.find((tr) => tr.id === 't1');
    if (t) {
      t.expectedPassengers = load;
      t.currentPassengersOnboard = load;
    }
  }

  toggleGate(gate: 'A' | 'B' | 'C', forceState?: boolean) {
    if (gate === 'A') {
      this.gateAOpen = forceState !== undefined ? forceState : !this.gateAOpen;
      this.scenario.gateAOpen = this.gateAOpen;
    } else if (gate === 'B') {
      this.gateBOpen = forceState !== undefined ? forceState : !this.gateBOpen;
      this.scenario.gateBOpen = this.gateBOpen;
      this.scenario.closeGateG2 = !this.gateBOpen;
    } else if (gate === 'C') {
      this.gateCOpen = forceState !== undefined ? forceState : !this.gateCOpen;
    }

    // Dynamic rerouting of agents affected by gate closure (NO TELEPORTING)
    if (!this.gateBOpen) {
      this.agents.forEach((agent) => {
        if (agent.route[0]?.startsWith('gateB_') && agent.y < 95) {
          // Smoothly turn toward Gate A or Gate C
          const opt = this.selectOptimalRoute(agent.x < 410 ? 'A' : 'C', agent.x);
          agent.route = [opt.routeKey];
          agent.currentRouteIndex = Math.min(2, agent.currentRouteIndex);
          agent.isRerouted = true;
        }
      });
    }
  }

  toggleExit(exit: 'A' | 'B' | 'C', forceState?: boolean) {
    if (exit === 'A') {
      this.exitAOpen = forceState !== undefined ? forceState : !this.exitAOpen;
      this.scenario.exitAOpen = this.exitAOpen;
    } else if (exit === 'B') {
      this.exitBOpen = forceState !== undefined ? forceState : !this.exitBOpen;
      this.scenario.exitBOpen = this.exitBOpen;
      this.scenario.blockExitB = !this.exitBOpen;
    } else if (exit === 'C') {
      this.exitCOpen = forceState !== undefined ? forceState : !this.exitCOpen;
      this.scenario.exitCOpen = this.exitCOpen;
    }

    // Dynamic rerouting of agents toward remaining open exits (NO TELEPORTING)
    const closedExit = exit;
    const isNowClosed = (closedExit === 'A' && !this.exitAOpen) ||
                        (closedExit === 'B' && !this.exitBOpen) ||
                        (closedExit === 'C' && !this.exitCOpen);

    if (isNowClosed) {
      this.agents.forEach((agent) => {
        if (agent.preferredExit === closedExit || agent.route[0]?.endsWith(`exit${closedExit}`)) {
          const opt = this.selectOptimalRoute('PF', agent.x);
          agent.preferredExit = opt.destinationExit;
          agent.route = [opt.routeKey];
          // Keep current progression along the corridor without jumping
          agent.currentRouteIndex = Math.min(agent.currentRouteIndex, 4);
          agent.isRerouted = true;
        }
      });
    }
  }

  // =========================================================================
  // TRAIN ARRIVAL & HOLD SIMULATION (Requirement 7, 8, 9, 11)
  // =========================================================================
  simulateTrainArrival(trainId = 't1') {
    const t = this.trains.find((tr) => tr.id === trainId);
    if (!t) return;
    t.isHeld = false;
    t.status = 'ARRIVING';
    t.trackPositionPercent = 60;
    t.holdTimerRemainingSec = 0;

    // Immediately trigger passenger influx sequence
    setTimeout(() => {
      t.status = 'AT_PLATFORM';
      t.trackPositionPercent = 100;
      this.injectTrainPassengers(this.trainPassengerLoad);
    }, 600);
  }

  holdTrain(arg1: number | string = 120, arg2?: string | number) {
    let durationSec = 120;
    let trainId = 't1';
    if (typeof arg1 === 'number') {
      durationSec = arg1;
      if (typeof arg2 === 'string') trainId = arg2;
    } else if (typeof arg1 === 'string') {
      trainId = arg1;
      if (typeof arg2 === 'number') durationSec = arg2;
    }
    const t = this.trains.find((tr) => tr.id === trainId);
    if (!t) return;
    t.isHeld = true;
    t.status = 'HOLDING';
    t.holdTimerRemainingSec = durationSec;
    t.totalHoldSec = durationSec;
    t.trackPositionPercent = 25; // Parked outside at outer home signal
  }

  releaseTrain(trainId = 't1') {
    const t = this.trains.find((tr) => tr.id === trainId);
    if (!t) return;
    t.isHeld = false;
    t.status = 'ARRIVING';
    t.holdTimerRemainingSec = 0;
  }

  injectTrainPassengers(load: number) {
    // Real passenger load added to platform crowd
    this.simulatedPlatformCrowd += load;
    this.simulatedTotalCrowd += load;

    // Spawn representative passenger agents physically exiting onto Platform 4/5 island
    const newAgentsCount = Math.min(35, Math.round(load / 15));
    for (let k = 0; k < newAgentsCount; k++) {
      const id = this.agents.length + k;
      const opt = this.selectOptimalRoute('PF', 500 + Math.random() * 200);
      const waypoints = ROUTE_WAYPOINTS[opt.routeKey] || ROUTE_WAYPOINTS.platform_exitB;
      const agent: CrowdAgent = {
        id,
        x: 480 + Math.random() * 220,
        y: 260 + Math.random() * 30,
        targetX: waypoints[1]?.x || 420,
        targetY: waypoints[1]?.y || 450,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.8,
        speed: 1.05 + Math.random() * 0.35,
        desiredSpeed: 1.15,
        zone: 'zoneD',
        route: [opt.routeKey],
        currentRouteIndex: 1,
        preferredExit: opt.destinationExit,
        behaviourState: this.emergencyLevel === 'EMERGENCY' ? 'EMERGENCY' : 'CAUTION',
        urgency: 0.65,
        reactionFactor: 0.9,
        radius: 3.5,
        laneOffset: (Math.random() - 0.5) * 20,
      };
      this.agents.push(agent);
    }
  }

  resetSimulation() {
    this.emergencyLevel = 'NORMAL';
    this.inflowRate = 100;
    this.platformCapacity = 2000;
    this.gateAOpen = true;
    this.gateBOpen = true;
    this.gateCOpen = true;
    this.exitAOpen = true;
    this.exitBOpen = true;
    this.exitCOpen = true;
    this.trainEtaMinutes = 2;
    this.trainPassengerLoad = 500;
    this.simulatedPlatformCrowd = 1350;
    this.simulatedConcourseCrowd = 750;
    this.simulatedTotalCrowd = 2100;
    this.incomingFlow = 48;
    this.outgoingFlow = 34;
    this.netFlow = 14;
    this.emergencyIncident = null;

    const t1 = this.trains.find((tr) => tr.id === 't1');
    if (t1) {
      t1.isHeld = false;
      t1.status = 'APPROACHING';
      t1.trackPositionPercent = 35;
      t1.holdTimerRemainingSec = 0;
      t1.expectedPassengers = 500;
      t1.currentPassengersOnboard = 500;
    }

    this.scenario = {
      closeGateG2: false,
      redirectFlowToG3: false,
      increaseExitCapacity: false,
      emergencyEvacuation: false,
      inflowRate: 100,
      deployStaffZoneB: false,
      gateAOpen: true,
      gateBOpen: true,
      exitAOpen: true,
      exitBOpen: true,
      exitCOpen: true,
    };

    this.initAgents();
  }

  // =========================================================================
  // AGENT FACTORY
  // =========================================================================
  initAgents() {
    this.agents = [];
    for (let i = 0; i < this.maxAgents; i++) {
      this.agents.push(this.createAgent(i, true));
    }
  }

  createAgent(id: number, randomStart = false): CrowdAgent {
    const rand = Math.random();
    let startGate: 'A' | 'B' | 'C' | 'PF' = 'B';

    // Distribute entries based on gate availability
    if (this.gateBOpen && rand < 0.45) {
      startGate = 'B';
    } else if (this.gateAOpen && rand < 0.75) {
      startGate = 'A';
    } else if (this.gateCOpen) {
      startGate = 'C';
    } else {
      startGate = this.gateAOpen ? 'A' : 'C';
    }

    const startX = startGate === 'A' ? 160 : startGate === 'B' ? 410 : 620;
    const { routeKey, destinationExit } = this.selectOptimalRoute(startGate, startX);
    const waypoints = ROUTE_WAYPOINTS[routeKey] || ROUTE_WAYPOINTS.gateB_exitB;

    const baseSpread = this.emergencyLevel === 'HIGH_DENSITY' ? 14 : 24;
    const laneOffset = (Math.random() - 0.5) * baseSpread;
    let startIndex = 0;
    let x = waypoints[0].x;
    let y = waypoints[0].y;

    if (randomStart) {
      startIndex = Math.floor(Math.random() * Math.max(1, waypoints.length - 2));
      const ptA = waypoints[startIndex];
      const ptB = waypoints[startIndex + 1] || ptA;
      const t = Math.random();
      x = ptA.x + (ptB.x - ptA.x) * t;
      y = ptA.y + (ptB.y - ptA.y) * t;
      startIndex += 1;
    } else {
      x = waypoints[0].x + laneOffset;
      y = waypoints[0].y - 8 - Math.random() * 20;
      startIndex = 0;
    }

    const urgency = this.emergencyLevel === 'EMERGENCY' ? 0.95 : this.emergencyLevel === 'HIGH_DENSITY' ? 0.60 : 0.20;
    const desiredSpeed = 1.05 * (1 + urgency * 0.70);

    return {
      id,
      x,
      y,
      targetX: x,
      targetY: y,
      vx: 0,
      vy: 1.0,
      speed: desiredSpeed,
      desiredSpeed,
      zone: 'zoneB',
      route: [routeKey],
      currentRouteIndex: startIndex,
      preferredExit: destinationExit,
      laneOffset,
      behaviourState: this.emergencyLevel === 'EMERGENCY' ? 'EMERGENCY' : this.emergencyLevel === 'HIGH_DENSITY' ? 'CAUTION' : 'NORMAL',
      urgency,
      reactionFactor: 0.85 + Math.random() * 0.3,
      radius: 3.5,
    };
  }

  // =========================================================================
  // UPDATE TICK LOOP (60 FPS Physical & Mathematical Telemetry)
  // =========================================================================
  update(): { zoneDensities: Record<string, number>; avgFlowSpeed: number } {
    if (!this.isRunning) {
      return {
        zoneDensities: { 'zone-a': 24, 'zone-b': 81, 'zone-c': 54, 'zone-d': 32, exit: 18 },
        avgFlowSpeed: 0.6,
      };
    }

    const now = Date.now();
    const dt = Math.min(0.1, (now - (this.lastUpdateTime || now)) / 1000);
    this.lastUpdateTime = now;

    // 1. Advance Train state machine & Outer Signal Holding
    const t1 = this.trains.find((tr) => tr.id === 't1');
    if (t1) {
      if (t1.isHeld) {
        t1.status = 'HOLDING';
        t1.trackPositionPercent = 25; // Parked at outer home signal
        if (t1.holdTimerRemainingSec > 0) {
          t1.holdTimerRemainingSec = Math.max(0, t1.holdTimerRemainingSec - dt);
          if (t1.holdTimerRemainingSec === 0) {
            t1.isHeld = false;
            t1.status = 'ARRIVING';
          }
        }
        // Platform clearance during train hold
        this.simulatedPlatformCrowd = Math.max(980, this.simulatedPlatformCrowd - Math.round(dt * 35));
      } else if (t1.status === 'ARRIVING') {
        t1.trackPositionPercent = Math.min(100, t1.trackPositionPercent + dt * 35);
        if (t1.trackPositionPercent >= 100) {
          t1.status = 'AT_PLATFORM';
        }
      } else if (t1.status === 'APPROACHING') {
        t1.trackPositionPercent = Math.min(50, t1.trackPositionPercent + dt * 4);
      }
    }

    // 2. Count Exit Bottlenecks
    this.exitQueueCounts = { exitA: 0, exitB: 0, exitC: 0 };
    for (let k = 0; k < this.agents.length; k++) {
      const a = this.agents[k];
      if (a.y > 450) {
        if (a.x < 280) this.exitQueueCounts.exitA++;
        else if (a.x < 520) this.exitQueueCounts.exitB++;
        else this.exitQueueCounts.exitC++;
      }
    }

    let totalSpeed = 0;
    const zoneCounts: Record<string, number> = {
      'zone-a': 0,
      'zone-b': 0,
      'zone-c': 0,
      'zone-d': 0,
      exit: 0,
    };

    const count = this.agents.length;

    for (let i = 0; i < count; i++) {
      const agent = this.agents[i];
      const routeKey = agent.route[0] || 'gateB_exitB';
      const waypoints = ROUTE_WAYPOINTS[routeKey] || ROUTE_WAYPOINTS.gateB_exitB;

      // Reached exit turnstile -> clear and respawn
      if (agent.currentRouteIndex >= waypoints.length) {
        this.agents[i] = this.createAgent(agent.id, false);
        continue;
      }

      // Dynamic closed-exit reassessment (NO TELEPORTING)
      if (
        (agent.preferredExit === 'A' && !this.exitAOpen) ||
        (agent.preferredExit === 'B' && !this.exitBOpen) ||
        (agent.preferredExit === 'C' && !this.exitCOpen)
      ) {
        const opt = this.selectOptimalRoute('PF', agent.x);
        agent.preferredExit = opt.destinationExit;
        agent.route = [opt.routeKey];
        agent.currentRouteIndex = Math.min(agent.currentRouteIndex, 4);
        agent.isRerouted = true;
      }

      const targetPt = waypoints[agent.currentRouteIndex];
      const prevPt = waypoints[Math.max(0, agent.currentRouteIndex - 1)];

      // Perpendicular lane displacement
      const segDx = targetPt.x - prevPt.x;
      const segDy = targetPt.y - prevPt.y;
      const segLen = Math.hypot(segDx, segDy) || 1;
      const perpX = (-segDy / segLen) * (agent.laneOffset ?? 0);
      const perpY = (segDx / segLen) * (agent.laneOffset ?? 0);

      const targetX = targetPt.x + perpX;
      const targetY = targetPt.y + perpY;

      const dx = targetX - agent.x;
      const dy = targetY - agent.y;
      const dist = Math.hypot(dx, dy);

      // Advance waypoint once close enough
      const hitRadius = agent.y > 440 ? 24 : 18;
      if (dist < hitRadius) {
        agent.currentRouteIndex++;
        if (agent.currentRouteIndex >= waypoints.length) {
          this.agents[i] = this.createAgent(agent.id, false);
          continue;
        }
      }

      // Zone identification
      const inZoneB = agent.x > 340 && agent.x < 480 && agent.y > 130 && agent.y < 280;
      if (inZoneB) zoneCounts['zone-b']++;
      else if (agent.x < 280 && agent.y < 250) zoneCounts['zone-a']++;
      else if (agent.x > 470 && agent.y > 220 && agent.y < 360) zoneCounts['zone-d']++;
      else if (agent.y > 450) zoneCounts['exit']++;
      else zoneCounts['zone-c']++;

      // ==============================================================
      // SPEED-DENSITY-BOTTLENECK MATHEMATICS (Requirement 2 & 4)
      // ==============================================================
      let baseV = agent.desiredSpeed || 1.15;

      // 1. Behavior State Urgency
      if (this.emergencyLevel === 'EMERGENCY' || this.emergencyIncident?.active) {
        agent.behaviourState = 'EMERGENCY';
        agent.urgency = 0.95;
        baseV *= 1.65;
      } else if (this.emergencyLevel === 'HIGH_DENSITY' || inZoneB) {
        agent.behaviourState = 'CAUTION';
        agent.urgency = 0.60;
        baseV *= 0.85;
      } else {
        agent.behaviourState = 'NORMAL';
        agent.urgency = 0.20;
      }

      // 2. Local Helbing density deceleration: v = v0 * max(0.24, 1 - rho/115)
      const localDensity = inZoneB ? 88 : agent.y > 450 ? 75 : 45;
      const densityDecel = Math.max(0.24, 1.0 - localDensity / 115);
      baseV *= densityDecel;

      // 3. Exit bottleneck queue deceleration (accumulation before narrow exit turnstiles)
      if (agent.y > 450) {
        const exitQ = agent.x < 280 ? this.exitQueueCounts.exitA :
                      agent.x < 520 ? this.exitQueueCounts.exitB : this.exitQueueCounts.exitC;
        if (exitQ > 15) {
          const bottleneckFactor = Math.max(0.20, 15 / exitQ);
          baseV *= bottleneckFactor;
        }
      }

      let targetSpeed = baseV * this.simulationSpeed;

      // ==============================================================
      // HAZARD / FIRE PANIC REPULSION & MEDICAL PARTING
      // ==============================================================
      if (this.emergencyIncident?.active && this.emergencyIncident.type === 'fire') {
        const fireX = this.emergencyIncident.x || 390;
        const fireY = this.emergencyIncident.y || 190;
        const fdx = agent.x - fireX;
        const fdy = agent.y - fireY;
        const fdist = Math.hypot(fdx, fdy) || 1;
        const dangerRadius = (this.emergencyIncident.radius || 60) + 70;

        if (fdist < dangerRadius) {
          const push = Math.min(5.0, ((dangerRadius - fdist) / dangerRadius) * 6.0);
          agent.vx += (fdx / fdist) * push;
          agent.vy += (fdy / fdist) * push;
        }

        // Divert approaching Route 2 crowd onto safe bypass
        if (agent.route[0]?.includes('gateB') && agent.y < fireY + 40) {
          const opt = this.selectOptimalRoute('PF', agent.x);
          agent.route = [opt.routeKey];
          agent.currentRouteIndex = agent.y < 85 ? 1 : 4;
          agent.isRerouted = true;
        }
      } else if (this.emergencyIncident?.active && this.emergencyIncident.type === 'medical') {
        // 108 Green Medical Corridor lateral clearance along central corridor
        if (agent.x > 385 && agent.x < 435 && agent.y > 65 && agent.y < 285) {
          const lateralOffset = agent.x - 410;
          const sign = lateralOffset >= 0 ? 1 : -1;
          agent.vx += sign * 1.5;
        }
      }

      // Normalized direction vector
      const nx = dist > 0 ? dx / dist : 0;
      const ny = dist > 0 ? dy / dist : 1;

      // Smooth steering physics
      const steerFactor = 0.22;
      agent.vx = agent.vx * (1 - steerFactor) + (nx * targetSpeed) * steerFactor;
      agent.vy = agent.vy * (1 - steerFactor) + (ny * targetSpeed) * steerFactor;

      // 2D Social Force: Personal space repulsion between nearby pedestrians
      for (let j = Math.max(0, i - 8); j < Math.min(count, i + 8); j++) {
        if (i === j) continue;
        const other = this.agents[j];
        const sepX = agent.x - other.x;
        const sepY = agent.y - other.y;
        const distSq = sepX * sepX + sepY * sepY;
        if (distSq < 100 && distSq > 0.01) {
          const sepDist = Math.sqrt(distSq);
          const repel = (10 - sepDist) * 0.045;
          agent.vx += (sepX / sepDist) * repel;
          agent.vy += (sepY / sepDist) * repel;
        }
      }

      agent.x += agent.vx;
      agent.y += agent.vy;

      totalSpeed += Math.hypot(agent.vx, agent.vy);
    }

    // ==============================================================
    // MATHEMATICAL TELEMETRY CALCULATIONS (Requirement 2)
    // ==============================================================
    const total = this.agents.length || 1;

    // Platform 4/5 (Zone D) occupancy & density
    let zoneDDensity = 58;
    if (t1?.isHeld) {
      zoneDDensity = Math.max(38, Math.min(54, Math.round((zoneCounts['zone-d'] / (total * 0.25)) * 30) + 16));
    } else if (t1?.status === 'AT_PLATFORM') {
      zoneDDensity = Math.min(98, Math.max(88, Math.round((zoneCounts['zone-d'] / (total * 0.25)) * 62) + 38));
    } else {
      zoneDDensity = Math.min(74, Math.round((zoneCounts['zone-d'] / (total * 0.25)) * 42) + 20);
    }

    const exitDensity = (!this.exitAOpen || !this.exitBOpen)
      ? Math.min(96, Math.max(78, Math.round((zoneCounts['exit'] / (total * 0.2)) * 45) + 30))
      : Math.min(76, Math.max(38, Math.round((zoneCounts['exit'] / (total * 0.2)) * 28) + 16));

    const zoneDensities = {
      'zone-a': Math.min(95, Math.round((zoneCounts['zone-a'] / (total * 0.25)) * 40) + 15),
      'zone-b': !this.gateBOpen ? 45 : Math.min(96, Math.max(76, Math.round((zoneCounts['zone-b'] / (total * 0.35)) * 65) + 32)),
      'zone-c': Math.min(85, Math.round((zoneCounts['zone-c'] / (total * 0.25)) * 45) + 24),
      'zone-d': zoneDDensity,
      exit: exitDensity,
    };
    this.lastZoneDensities = zoneDensities;

    // Capacity Utilization & Predicted Crowd
    const utilization = (this.simulatedPlatformCrowd / this.platformCapacity) * 100;
    const isTrainDue = t1 && !t1.isHeld && (t1.status === 'APPROACHING' || t1.status === 'ARRIVING');
    this.predictedCrowd = this.simulatedPlatformCrowd + (isTrainDue ? this.trainPassengerLoad : 0) - (this.outgoingFlow * this.trainEtaMinutes);
    this.predictedOvercapacity = this.predictedCrowd > this.platformCapacity;

    if (utilization >= 92 || this.emergencyLevel === 'EMERGENCY') {
      this.riskLevel = 'Critical';
    } else if (utilization >= 75 || this.emergencyLevel === 'HIGH_DENSITY') {
      this.riskLevel = 'High';
    } else if (utilization >= 55) {
      this.riskLevel = 'Medium';
    } else {
      this.riskLevel = 'Safe';
    }

    this.averageSpeedMps = Number((totalSpeed / total).toFixed(2));
    return { zoneDensities, avgFlowSpeed: this.averageSpeedMps };
  }

  // Single Source of Truth Central State
  getState(): CentralSimulationState {
    const t1 = this.trains.find((tr) => tr.id === 't1') || this.trains[0];
    return {
      emergencyLevel: this.emergencyLevel,
      inflowRate: this.inflowRate,
      platformCapacity: this.platformCapacity,
      totalCrowd: this.simulatedTotalCrowd,
      platformCrowd: this.simulatedPlatformCrowd,
      concourseCrowd: this.simulatedConcourseCrowd,
      zoneDensities: this.lastZoneDensities,
      incomingFlow: this.incomingFlow,
      outgoingFlow: this.outgoingFlow,
      netFlow: this.netFlow,
      predictedCrowd: this.predictedCrowd,
      predictedOvercapacity: this.predictedOvercapacity,
      averageSpeedMps: this.averageSpeedMps,
      riskLevel: this.riskLevel,
      gates: {
        gateA: this.gateAOpen,
        gateB: this.gateBOpen,
        gateC: this.gateCOpen,
      },
      exits: {
        exitA: this.exitAOpen,
        exitB: this.exitBOpen,
        exitC: this.exitCOpen,
      },
      train: {
        id: t1.id,
        number: t1.trainNumber,
        name: t1.trainName,
        platform: t1.platform,
        status: t1.status,
        etaMinutes: this.trainEtaMinutes,
        passengerLoad: this.trainPassengerLoad,
        isHeld: t1.isHeld,
        holdTimerSec: Math.ceil(t1.holdTimerRemainingSec),
        trackPositionPercent: t1.trackPositionPercent,
      },
    };
  }

  // Compatibility helpers
  setVenueType(type: VenueType) {
    this.venueType = type;
  }

  setSpeed(speed: number) {
    this.simulationSpeed = speed;
  }

  setScenario(newScenario: ScenarioSettings) {
    this.scenario = { ...newScenario };
    if (newScenario.emergencyLevel) {
      this.setEmergencyLevel(newScenario.emergencyLevel);
    }
  }

  setEmergencyIncident(incident: EmergencyIncident | null) {
    this.emergencyIncident = incident;
  }

  setInflowRate(ratePercent: number) {
    this.setCrowdInflow(ratePercent);
  }
}
