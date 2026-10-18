export type ScreenId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type VenueType = 'temple' | 'riverside' | 'railway' | 'stadium' | 'festival';

export interface Zone {
  id: string;
  name: string;
  code: string;
  density: number; // 0 to 100%
  status: 'Low' | 'Medium' | 'High' | 'Critical' | 'Safe';
  trend: 'up' | 'stable' | 'down';
  capacity: number;
  currentCount: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  inflowLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  outflowLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  flowImbalance?: string;
  bottleneckElement?: string;
  riskReasoning?: string;
}

export interface Gate {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  isOpen: boolean;
  isAlert?: boolean;
  status: 'Normal' | 'Congested' | 'Closed' | 'Redirected';
  flowRate: number; // people per minute
  targetZoneId: string;
}

export type TrainSimulationState =
  | 'SCHEDULED'
  | 'APPROACHING'
  | 'ARRIVING'
  | 'AT_PLATFORM'
  | 'HOLDING'
  | 'BOARDING'
  | 'DEPARTING';

export interface TrainSimulationData {
  id: string;
  trainNumber: string;
  trainName: string;
  platform: string;
  assignedTrack: number; // 1 or 3
  status: TrainSimulationState;
  expectedPassengers: number;
  currentPassengersOnboard: number;
  holdTimerRemainingSec: number;
  totalHoldSec: number;
  trackPositionPercent: number; // 0 (outer signal) to 100 (stopped at platform)
  isHeld: boolean;
}

export interface CrowdAgent {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  speed: number;
  desiredSpeed?: number;
  zone: string;
  route: string[];
  currentRouteIndex: number;
  color?: string;
  isRerouted?: boolean;
  laneOffset?: number;
  isEvacuating?: boolean;
  evacWaypoints?: { x: number; y: number }[];
  behaviourState?: 'NORMAL' | 'CAUTION' | 'EMERGENCY';
  urgency?: number;
  reactionFactor?: number;
  preferredExit?: string;
  radius?: number;
}

export interface VenueData {
  id: string;
  name: string;
  tagline: string;
  venueType: VenueType;
  categoryName: string;
  totalCrowd: number;
  avgDensity: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  nextPredictionTime: string;
  alertHeadline: string;
  criticalZoneName: string;
  chokeGateCode: string;
  bypassGateCode: string;
  zones: Zone[];
  gates: Gate[];
  predictionSeries: {
    time: string;
    density: number;
    threshold: number;
    predictedCount: number;
  }[];
  divertedGates: string[];
  recommendations: {
    primaryAction: string;
    secondaryAction: string;
    staffAction: string;
    reductionImpact: string;
  };
  platforms?: PlatformInfo[];
  emergencyExits?: EmergencyExit[];
  assemblyZones?: AssemblyZone[];
  eventMode?: EventMode;
}

export type EventMode = 'normal' | 'peak' | 'extreme';

export type EmergencyType =
  | 'none'
  | 'fire'
  | 'medical'
  | 'crush'
  | 'blocked_route'
  | 'electrical'
  | 'other'
  | 'train_surge';

export interface StationNode {
  id: string;
  name: string;
  code: string;
  type:
    | 'platform'
    | 'gate'
    | 'exit'
    | 'fob'
    | 'corridor'
    | 'waiting'
    | 'booking'
    | 'medical'
    | 'assembly'
    | 'parking';
  x: number;
  y: number;
  capacity: number;
  currentOccupancy: number;
  risk: 'Safe' | 'Warning' | 'High Risk' | 'Critical';
  isBlocked?: boolean;
  isEmergencyOrigin?: boolean;
}

export interface StationEdge {
  id: string;
  source: string;
  target: string;
  distanceMeters: number;
  capacity: number; // persons per min
  currentCongestion: number; // 0-100%
  isBlocked: boolean;
  riskPenalty: number;
  pathPoints: { x: number; y: number }[];
}

export interface EmergencyExit {
  id: string;
  name: string;
  code: string;
  capacity: number; // persons / min
  currentLoad: number;
  utilizationPercent: number;
  distanceMeters: number;
  status: 'Available' | 'Overloaded' | 'Blocked' | 'Recommended';
  isBlocked: boolean;
  evacuationContributionPercent: number;
  assemblyZoneId: string;
  assemblyZoneName: string;
  x: number;
  y: number;
}

export interface AssemblyZone {
  id: string;
  name: string;
  code: string;
  capacity: number;
  currentCrowd: number;
  distanceMeters: number;
  x: number;
  y: number;
}

export interface EvacuationPathResult {
  pathNodeIds: string[];
  pathPoints: { x: number; y: number }[];
  totalDistanceMeters: number;
  estimatedTimeMinutes: number;
  overallCongestionPercent: number;
  routeRisk: 'Low' | 'Medium' | 'High';
  targetExit: EmergencyExit;
  targetAssemblyZone: AssemblyZone;
  explanation: string;
  alternativeExit?: EmergencyExit;
  alternativePathPoints?: { x: number; y: number }[];
  costComparison: {
    recommendedCost: number;
    nearestExitName: string;
    nearestExitCost: number;
    whyBetter: string;
  };
}

export interface EmergencyIncident {
  type: EmergencyType;
  active: boolean;
  title: string;
  locationId: string;
  locationName: string;
  platform: string;
  x: number;
  y: number;
  radius: number;
  severity: 'Warning' | 'High' | 'Catastrophic';
  affectedPopulation: number;
  evacuationTimeRemainingSec: number;
  evacuatedPercentage: number;
  flowSpeedMps: number;
  casualtiesPrevented: number;
  recommendedExitId: string;
  alternativeExitId: string;
  safeAssemblyZone: string;
  blockedRouteIds: string[];
  activeUnits: string[];
  evacuationPath: string[];
  evacuationPathPoints: { x: number; y: number }[];
  alternativePathPoints?: { x: number; y: number }[];
  routeExplanation: string;
  costComparison?: {
    recommendedCost: number;
    nearestExitName: string;
    nearestExitCost: number;
    whyBetter: string;
  };
  evacuationRoutes: { from: string; to: string; status: 'Active' | 'Congested' | 'Cleared' | 'Blocked' }[];
  actionLog: string[];
}

export interface PlatformInfo {
  platformNumber: string;
  name: string;
  trainNumber: string;
  trainName: string;
  arrivalTime: string;
  status: 'On Time' | 'Arrived' | 'Delayed' | 'Holding Outer Signal';
  expectedPassengers: number;
  capacity: number;
  currentOccupancy: number; // percentage
  chokeStatus: 'Normal' | 'Moderate' | 'Critical FOB Backlog';
  fobStairwellLoad: number; // percentage
  recommendedAction: string;
  routeDetails: string;
}

export type EmergencyLevel = 'NORMAL' | 'HIGH_DENSITY' | 'EMERGENCY';

export interface CentralSimulationState {
  emergencyLevel: EmergencyLevel;
  inflowRate: number;
  platformCapacity: number;
  totalCrowd: number;
  platformCrowd: number;
  concourseCrowd: number;
  zoneDensities: Record<string, number>;
  incomingFlow: number;
  outgoingFlow: number;
  netFlow: number;
  predictedCrowd: number;
  predictedOvercapacity: boolean;
  averageSpeedMps: number;
  riskLevel: 'Safe' | 'Medium' | 'High' | 'Critical';
  gates: {
    gateA: boolean;
    gateB: boolean;
    gateC: boolean;
  };
  exits: {
    exitA: boolean;
    exitB: boolean;
    exitC: boolean;
  };
  train: {
    id: string;
    number: string;
    name: string;
    platform: string;
    status: TrainSimulationState;
    etaMinutes: number;
    passengerLoad: number;
    isHeld: boolean;
    holdTimerSec: number;
    trackPositionPercent: number;
  };
}

export interface ScenarioSettings {
  closeGateG2: boolean;
  redirectFlowToG3: boolean;
  increaseExitCapacity: boolean;
  emergencyEvacuation: boolean;
  inflowRate: number; // percentage (e.g. 100% is normal)
  deployStaffZoneB: boolean;
  emergencyType?: EmergencyType;
  emergencyActive?: boolean;
  activePlatformHold?: string | null;
  blockExitB?: boolean;
  openEmergencyExitC?: boolean;
  eventMode?: EventMode;
  platformCapacity?: number;
  trainState?: TrainSimulationState;
  holdTrainPF4?: boolean;
  emergencyLevel?: EmergencyLevel;
  trainEtaMinutes?: number;
  trainPassengerLoad?: number;
  gateAOpen?: boolean;
  gateBOpen?: boolean;
  exitAOpen?: boolean;
  exitBOpen?: boolean;
  exitCOpen?: boolean;
}

export interface SimulationResultMetrics {
  before: {
    zoneBDensity: number;
    criticalZonesCount: number;
    maxOccupancy: number;
    avgCongestion: number;
    exitUtilization: number;
    affectedPeople: number;
    evacuationTimeMinutes: number;
    bottleneckRisk: string;
    flowSpeed: string;
    avgSpeedMps: number;
  };
  after: {
    zoneBDensity: number;
    criticalZonesCount: number;
    maxOccupancy: number;
    avgCongestion: number;
    exitUtilization: number;
    affectedPeople: number;
    evacuationTimeMinutes: number;
    bottleneckRisk: string;
    flowSpeed: string;
    avgSpeedMps: number;
  };
  improvements: {
    congestionReduction: number;
    flowIncrease: number;
    riskTransition: string;
    saferRoute: string;
    evacuationTimeSavedMinutes: number;
  };
}

export interface CopilotMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: string[];
}
