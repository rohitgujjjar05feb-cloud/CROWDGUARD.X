import React, { useEffect, useRef, useState } from 'react';
import { SimulationEngine } from '../../simulation/engine';
import { Gate, ScenarioSettings, Zone, VenueType, EmergencyIncident, TrainSimulationData } from '../../types';
import { Flame, Navigation, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface DigitalTwinCanvasProps {
  engine: SimulationEngine;
  zones: Zone[];
  gates: Gate[];
  venueType?: VenueType;
  scenario?: ScenarioSettings;
  showHeatmap?: boolean;
  showVectors?: boolean;
  showReroutePath?: boolean;
  isBeforeAfterMode?: boolean;
  isAfterView?: boolean;
  onZoneSelect?: (zone: Zone) => void;
  selectedZoneId?: string;
  className?: string;
  height?: number;
  emergencyIncident?: EmergencyIncident | null;
}

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  engine,
  zones,
  gates,
  venueType = 'riverside',
  scenario,
  showHeatmap: initialShowHeatmap = true,
  showVectors: initialShowVectors = false,
  showReroutePath = false,
  isBeforeAfterMode = false,
  isAfterView = false,
  onZoneSelect,
  selectedZoneId,
  className = '',
  height = 540,
  emergencyIncident,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(initialShowHeatmap);
  const [showVectors, setShowVectors] = useState(initialShowVectors);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewAngle3D, setViewAngle3D] = useState(false);

  useEffect(() => {
    setShowHeatmap(initialShowHeatmap);
  }, [initialShowHeatmap]);

  useEffect(() => {
    setShowVectors(initialShowVectors);
  }, [initialShowVectors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Step engine physics
      const { zoneDensities } = engine.update();

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      if (viewAngle3D) {
        // Perspective transform for isometric feel
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(zoomLevel, zoomLevel * 0.85);
        ctx.rotate(-0.06);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      } else if (zoomLevel !== 1) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // 1. Draw Architectural Venue Blueprint & Defined Paved Roads
      drawVenueBlueprint(ctx, canvas.width, canvas.height, venueType, engine);

      // 2. Draw Zones boundaries & labels
      drawZones(ctx, zones, zoneDensities, selectedZoneId);

      // 3. Draw Thermal Heatmap if enabled
      if (showHeatmap) {
        drawHeatmap(ctx, isAfterView, venueType);
      }

      // 4. Draw Flow Wayfinding & Reroute paths
      const isRerouting = isAfterView || (scenario?.closeGateG2 ?? false) || (scenario?.redirectFlowToG3 ?? false) || (engine && (!engine.gateBOpen || !engine.exitBOpen || engine.emergencyLevel === 'EMERGENCY'));
      drawRerouteFlow(ctx, isRerouting, venueType, engine, emergencyIncident);

      // 5. Draw 12 Safety Marshals if deployed
      const isMarshalsActive = isAfterView || (scenario?.deployStaffZoneB ?? false);
      drawMarshals(ctx, isMarshalsActive, venueType);

      // 6. Draw Expanded Exit Capacity if active
      const isExitActive = isAfterView || (scenario?.increaseExitCapacity ?? false);
      drawExpandedExit(ctx, isExitActive);

      // 7. Draw Crowd Agents (walking pedestrians strictly following roads)
      drawAgents(ctx, engine, isAfterView, scenario, venueType);

      // 8. Draw Gates & Alert badges
      drawGates(ctx, gates, scenario, isAfterView, engine, venueType);

      // 9. Draw Emergency Visuals (Fire/Smoke, 108 Medical Stretcher Team & Green Corridor)
      if (emergencyIncident?.active) {
        drawEmergencyIncident(ctx, emergencyIncident, venueType);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine, zones, gates, venueType, scenario, showHeatmap, showVectors, showReroutePath, isAfterView, zoomLevel, viewAngle3D, selectedZoneId, emergencyIncident]);

  // Canvas click handler for zone selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onZoneSelect) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check hit zone
    const clickedZone = zones.find(
      (z) =>
        clickX >= z.x &&
        clickX <= z.x + z.width &&
        clickY >= z.y &&
        clickY <= z.y + z.height
    );

    if (clickedZone) {
      onZoneSelect(clickedZone);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-cyan-900/40 bg-[#070d18] shadow-2xl ${className}`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        onClick={handleCanvasClick}
        className="w-full h-full object-cover cursor-crosshair block"
      />

      {/* Floating Canvas Controls (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 shadow-xl">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer ${
            showHeatmap ? 'bg-cyan-500/25 text-cyan-300 font-medium border border-cyan-500/40' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Heatmap"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Heatmap</span>
        </button>
        <button
          onClick={() => setShowVectors(!showVectors)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer ${
            showVectors ? 'bg-cyan-500/25 text-cyan-300 font-medium border border-cyan-500/40' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Flow Vectors"
        >
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vectors</span>
        </button>
        <button
          onClick={() => setViewAngle3D(!viewAngle3D)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer ${
            viewAngle3D ? 'bg-indigo-500/25 text-indigo-300 font-medium border border-indigo-500/40' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle 2.5D Isometric Angle"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
          <span>{viewAngle3D ? '3D View' : '2D View'}</span>
        </button>
      </div>

      {/* Navigation & Zoom Controls (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-900/80 shadow-2xl">
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
          className="w-7 h-7 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
          className="w-7 h-7 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => {
            setZoomLevel(1);
            setViewAngle3D(false);
          }}
          className="w-7 h-7 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 flex items-center justify-center text-xs transition-all cursor-pointer"
          title="Reset Orientation"
        >
          🧭
        </button>
      </div>

      {/* Crowd Density Color Legend (Top Right) */}
      <div className="absolute top-3 right-3 z-20 bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700/60 text-xs shadow-2xl">
        <div className="text-xs font-bold text-white mb-2 tracking-wide font-tnr">Crowd Density</div>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
            <span className="text-slate-200 font-medium">Very High</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
            <span className="text-slate-200">High</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#eab308]"></span>
            <span className="text-slate-300">Medium</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <span className="text-slate-300">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Canvas Drawing Helper Functions Tailored by Venue Type
function drawVenueBlueprint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  venueType: VenueType,
  engine?: SimulationEngine
) {
  // Base dark background
  ctx.fillStyle = '#070d18';
  ctx.fillRect(0, 0, w, h);

  // Subtle coordinate grid
  ctx.strokeStyle = 'rgba(30, 58, 95, 0.15)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Draw Paved Road Corridors that strictly match the simulation waypoints
  drawPavedRoads(ctx, w, h);

  // Draw Specific Architectural Blueprint according to VenueType
  if (venueType === 'temple') {
    drawTempleBlueprint(ctx, w, h);
  } else if (venueType === 'riverside') {
    drawRiversideDetails(ctx, w, h);
  } else if (venueType === 'railway') {
    drawRailwayBlueprint(ctx, w, h, engine);
  } else if (venueType === 'stadium') {
    drawStadiumBlueprint(ctx, w, h);
  } else if (venueType === 'festival') {
    drawFestivalBlueprint(ctx, w, h);
  }
}

// Draw Paved Thoroughfares exactly on the movement corridors
function drawPavedRoads(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const now = Date.now();
  const chevOffset = -(now * 0.04) % 24;

  // 1. ROUTE 1 ROAD (North Ingress Gate G1 -> Zone A Approach -> Central Corridors -> Exit)
  // Outer Sandstone Bed
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.lineWidth = 36;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(160, 30);
  ctx.lineTo(160, 110);
  ctx.lineTo(160, 190);
  ctx.lineTo(190, 260);
  ctx.lineTo(260, 330);
  ctx.lineTo(340, 400);
  ctx.lineTo(420, 470);
  ctx.lineTo(420, 520);
  ctx.stroke();

  // Route 1 Paved Sandstone Flagstone Surface
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 32;
  ctx.stroke();

  // Route 1 Curbs
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Route 1 Directional Flow Centerline
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = chevOffset;
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. ROUTE 2 ROAD (Central Sacred Corridor - Gate G2 North Gopuram to Ganga Ghat Exit G4)
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.lineWidth = 44;
  ctx.beginPath();
  ctx.moveTo(410, 30);
  ctx.lineTo(410, 520);
  ctx.stroke();

  // Route 2 Varanasi Sandstone Heritage Flagstone Surface
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 40;
  ctx.stroke();

  // Route 2 Ornate Golden Corridor Curbs
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Route 2 Animated Flow Chevrons (devotees streaming south towards Ganga Ghat)
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.lineDashOffset = chevOffset;
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. ROUTE 3 ROAD (East Bypass - Gate G3 to South Ganga Ghat Exit G4)
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.lineWidth = 36;
  ctx.beginPath();
  ctx.moveTo(620, 40);
  ctx.lineTo(620, 350);
  ctx.lineTo(600, 390);
  ctx.lineTo(520, 440);
  ctx.lineTo(440, 480);
  ctx.lineTo(440, 520);
  ctx.stroke();

  // Route 3 Flagstone Surface
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 32;
  ctx.stroke();

  // Route 3 Curbs
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Route 3 Dashed Centerline
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = chevOffset;
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. BYPASS CONNECTOR AVENUE (Diverting from Gate G2 to Gate G3)
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.lineWidth = 32;
  ctx.beginPath();
  ctx.moveTo(410, 80);
  ctx.lineTo(620, 80);
  ctx.stroke();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 28;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

// 0. Heritage Temple Architectural Blueprint (Kashi Vishwanath Corridor & Sanctum)
function drawTempleBlueprint(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Sacred Golden Temple Courtyard (Mandir Parikrama Complex - West Flank x: 215 to 365, y: 125 to 285)
  // Devotees walk unobstructed down the Sacred Avenue at x: 410 facing the Mandir Mandapa!
  ctx.fillStyle = 'rgba(35, 22, 10, 0.85)';
  ctx.fillRect(215, 125, 150, 160);
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.strokeRect(215, 125, 150, 160);

  // Outer Temple Boundary with traditional Vedic dashed perimeter
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(205, 115, 170, 180);
  ctx.setLineDash([]);

  // Central Golden Sanctum (Garbhagriha Inner Shrine)
  ctx.fillStyle = 'rgba(50, 28, 8, 0.95)';
  ctx.fillRect(235, 145, 110, 120);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(235, 145, 110, 120);

  // Inner Sanctum Golden Dome / Shikhara Spire with Sacred Luster
  const domeGrad = ctx.createRadialGradient(290, 205, 4, 290, 205, 42);
  domeGrad.addColorStop(0, '#fef08a');
  domeGrad.addColorStop(0.4, '#eab308');
  domeGrad.addColorStop(1, '#713f12');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.arc(290, 205, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Holy Kalash & Trishul Emblem at center of Sanctum Spire
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(290, 205, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eastern Darshan Mandapa Portal (Opening facing the Sacred Avenue at x: 410)
  ctx.fillStyle = 'rgba(180, 83, 9, 0.9)';
  ctx.fillRect(345, 185, 26, 40);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(345, 185, 26, 40);

  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('DARSHAN', 346, 202);
  ctx.fillText('PORTAL ➔', 346, 213);

  // Clear Temple Labels INSIDE Sanctum Courtyard (Completely free from pedestrian traffic)
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 10px serif';
  ctx.fillText('🛕 SHRI KASHI VISHWANATH', 222, 140);
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.fillText('GOLDEN SANCTUM (GARBHAGRIHA)', 224, 276);

  // North Gopuram Gateway across Gate G2 (Devotees walk directly under this gateway arch)
  ctx.fillStyle = 'rgba(180, 83, 9, 0.9)';
  ctx.fillRect(355, 35, 110, 32);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(355, 35, 110, 32);
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('🏛 NORTH GOPURAM GATEWAY', 360, 55);

  // Queue Holding Stanchions on East Flank (Zone C / Holding Area)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1.5;
  for (let y = 140; y <= 270; y += 22) {
    ctx.beginPath();
    ctx.moveTo(560, y);
    ctx.lineTo(680, y);
    ctx.stroke();
  }

  // Holy Ganga Ghat stairs at the bottom edge (Egress to Holy Ganges)
  const riverGrad = ctx.createLinearGradient(0, 475, 0, h);
  riverGrad.addColorStop(0, 'rgba(15, 76, 129, 0.65)');
  riverGrad.addColorStop(0.4, 'rgba(2, 44, 84, 0.9)');
  riverGrad.addColorStop(1, 'rgba(1, 28, 56, 0.98)');
  ctx.fillStyle = riverGrad;
  ctx.fillRect(0, 480, w, h - 480);

  // Water Surface Waves
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 480);
  ctx.lineTo(w, 480);
  ctx.stroke();

  // Stone Ghat Steps
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1.2;
  for (let gy = 486; gy < h; gy += 14) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  ctx.fillStyle = '#7dd3fc';
  ctx.font = 'bold 9.5px sans-serif';
  ctx.fillText('🌊 HOLY GANGA RIVER CORRIDOR • MANIKARNIKA & DASHASHWAMEDH GHAT EGRESS', 140, 518);
}

// 1. Riverside Architectural Details (Maha Kumbh)
function drawRiversideDetails(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Holy River Sangam at the bottom
  const riverGrad = ctx.createLinearGradient(0, 440, 0, h);
  riverGrad.addColorStop(0, 'rgba(12, 74, 110, 0.55)');
  riverGrad.addColorStop(1, 'rgba(3, 105, 161, 0.85)');
  ctx.fillStyle = riverGrad;
  ctx.beginPath();
  ctx.moveTo(0, 450);
  ctx.bezierCurveTo(240, 435, 480, 465, w, 455);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Ghat stone steps
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 435 + i * 8);
    ctx.bezierCurveTo(240, 420 + i * 8, 480, 450 + i * 8, w, 440 + i * 8);
    ctx.stroke();
  }

  // Central Sacred Sanctum (Zone B compound)
  ctx.fillStyle = 'rgba(23, 37, 84, 0.85)';
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  ctx.fillRect(350, 160, 120, 100);
  ctx.strokeRect(350, 160, 120, 100);

  // Inner Sanctum Golden Spire
  ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.fillRect(390, 190, 40, 40);
  ctx.strokeStyle = '#fbbf24';
  ctx.strokeRect(390, 190, 40, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('SANCTUM', 391, 214);

  // Sector camps / pilgrim service tents
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.fillRect(100, 110, 45, 60);
  ctx.fillRect(205, 290, 45, 40);
  ctx.fillRect(530, 240, 70, 50);
}

// 2. Railway Station Blueprint (Ujjain Junction Railway Station - UJN)
function drawRailwayBlueprint(ctx: CanvasRenderingContext2D, w: number, h: number, engine?: SimulationEngine) {
  // 0. Dedicated Outer Perimeter Emergency Access Road (Completely Isolated from Tracks & Platforms)
  ctx.save();
  // Asphalt Pavement
  ctx.fillStyle = '#1e293b';
  // Horizontal perimeter run across top of station
  ctx.fillRect(10, 8, 318, 20);
  // Vertical branch turning south directly into 108 Rapid Response Base
  ctx.fillRect(310, 8, 24, 76);

  // Yellow Barrier Curbs
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  // Outer curb
  ctx.moveTo(10, 8);
  ctx.lineTo(334, 8);
  ctx.lineTo(334, 84);
  ctx.stroke();
  // Inner curb
  ctx.beginPath();
  ctx.moveTo(10, 28);
  ctx.lineTo(310, 28);
  ctx.lineTo(310, 84);
  ctx.stroke();

  // White Dashed Center Guide Line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(12, 18);
  ctx.lineTo(322, 18);
  ctx.lineTo(322, 82);
  ctx.stroke();
  ctx.setLineDash([]);

  // Stenciled Road Inscription
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 7.5px monospace';
  ctx.fillText('🚑 108 AMBULANCE ONLY • DEDICATED PERIMETER ROAD (TRACK ISOLATED)', 16, 21);

  // 108 Ambulance Parking Bay Stencil
  ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.fillRect(308, 76, 28, 20);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(308, 76, 28, 20);
  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 6.5px sans-serif';
  ctx.fillText('108 BAY', 310, 88);
  ctx.restore();

  // A. Classic Indian Railways Station Signboard (Top Left)
  ctx.fillStyle = '#facc15'; // IR Official Yellow
  ctx.fillRect(75, 42, 240, 32);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(75, 42, 240, 32);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('उज्जैन जंक्शन • UJJAIN JN (UJN)', 82, 57);
  ctx.font = 'bold 7.5px monospace';
  ctx.fillText('WESTERN RAILWAY • SIMHASTHA MAHAKAL HUB • PF 1-8', 82, 69);

  // B. Main Heritage Station Concourse & Dewas Gate Porch (Zone A - Platform 1)
  ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.8;
  ctx.fillRect(75, 78, 240, 75);
  ctx.strokeRect(75, 78, 240, 75);

  // Station Master & RPF Control Room
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(80, 84, 110, 30);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 84, 110, 30);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('STATION MASTER & RPF', 85, 98);
  ctx.fillText('COMMUNITY CONTROL (UJN)', 85, 108);

  // 108 Emergency Medical Post
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(195, 84, 115, 30);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1;
  ctx.strokeRect(195, 84, 115, 30);
  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('🚑 108 MEDICAL FIRST AID', 200, 98);
  ctx.fillText('RAPID RESPONSE BASE', 200, 108);

  // Platform 1 Surface (Main City Side)
  ctx.fillStyle = 'rgba(51, 65, 85, 0.9)';
  ctx.fillRect(75, 155, 240, 35);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.strokeRect(75, 155, 240, 35);

  // Platform 1 Yellow Tactile Safety Line
  ctx.fillStyle = '#facc15';
  ctx.fillRect(75, 187, 240, 3);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('PLATFORM 1 • VIP PORCH & DEWAS GATE INGRESS', 82, 172);

  // C. Railway Track Beds with Sleepers & Twin Steel Rails
  const trackY = [198, 242, 298, 358];
  trackY.forEach((ty, idx) => {
    // Dark Ballast Bed
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(50, ty - 9, w - 100, 18);

    // Sleepers (Ties)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let sx = 55; sx < w - 55; sx += 11) {
      ctx.beginPath();
      ctx.moveTo(sx, ty - 8);
      ctx.lineTo(sx, ty + 8);
      ctx.stroke();
    }

    // Steel Rails (Top & Bottom)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(50, ty - 4);
    ctx.lineTo(w - 50, ty - 4);
    ctx.moveTo(50, ty + 4);
    ctx.lineTo(w - 50, ty + 4);
    ctx.stroke();

    // Overhead Catenary (OHE) Wire Posts
    for (let ox = 110; ox < w - 100; ox += 160) {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(ox, ty - 12, 3, 24);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(ox - 6, ty - 12);
      ctx.lineTo(ox + 8, ty - 12);
      ctx.stroke();
    }
  });

  // D. Train on Track 1 (y: 198): #12962 Avantika Superfast Express
  // Locomotive WAP-7 (Front)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(70, 192, 45, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('WAP-7', 76, 201);
  // Passenger Coaches (Dark Blue with Windows)
  for (let c = 0; c < 4; c++) {
    const coachX = 120 + c * 52;
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(coachX, 192, 48, 12);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(coachX, 192, 48, 12);
    // Yellow stripe & coach windows
    ctx.fillStyle = '#fde047';
    ctx.fillRect(coachX, 197, 48, 1.5);
    ctx.fillStyle = '#fef08a';
    for (let wx = coachX + 4; wx < coachX + 44; wx += 8) {
      ctx.fillRect(wx, 194, 5, 3);
    }
  }

  // E. Platform 2 & 3 Island Platform (y: 209 to 239)
  ctx.fillStyle = 'rgba(51, 65, 85, 0.92)';
  ctx.fillRect(110, 209, 250, 30);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.strokeRect(110, 209, 250, 30);
  // Yellow safety edge lines
  ctx.fillStyle = '#facc15';
  ctx.fillRect(110, 209, 250, 2.5);
  ctx.fillRect(110, 236.5, 250, 2.5);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('PF 2/3 ISLAND • #12962 AVANTIKA EXPRESS (ARRIVED)', 118, 224);

  // F. Platform 4 & 5 Pilgrimage Island Platform (Critical Choke Zone D) (y: 253 to 295)
  ctx.fillStyle = 'rgba(71, 85, 105, 0.95)';
  ctx.fillRect(470, 253, 275, 42);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(470, 253, 275, 42);
  // Yellow safety edge lines
  ctx.fillStyle = '#facc15';
  ctx.fillRect(470, 253, 275, 2.5);
  ctx.fillRect(470, 292.5, 275, 2.5);

  const t1 = engine?.trains?.find((t: TrainSimulationData) => t.id === 't1');
  const isHeld = t1?.isHeld;
  const isArriving = t1?.status === 'ARRIVING';
  const holdRemaining = Math.ceil(t1?.holdTimerRemainingSec || 0);

  // Position of Train 1 coaches on Track 3
  // When at platform: 480
  // When held: 690 (outer home signal)
  let t1BaseX = 480;
  if (isHeld) {
    t1BaseX = 690;
  } else if (isArriving) {
    const pct = (t1?.trackPositionPercent || 50) / 100;
    t1BaseX = 690 - (690 - 480) * pct;
  }

  // Draw Train on Track 3: #09304 Simhastha Special (Saffron Rake)
  for (let sc = 0; sc < 5; sc++) {
    const sCoachX = t1BaseX + sc * 50;
    if (sCoachX > w + 40) continue;
    ctx.fillStyle = '#c2410c'; // Saffron
    ctx.fillRect(sCoachX, 292, 46, 12);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(sCoachX, 292, 46, 12);
    ctx.fillStyle = '#fef3c7';
    for (let sw = sCoachX + 4; sw < sCoachX + 42; sw += 8) {
      ctx.fillRect(sw, 294, 5, 3);
    }
  }

  // Railway Home Signal Pole for Track 3
  const signalX = 458;
  const signalY = 290;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(signalX, signalY - 14, 8, 22);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.strokeRect(signalX, signalY - 14, 8, 22);

  if (isHeld) {
    // Red Signal Light
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(signalX + 4, signalY - 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Platform Vacating Banner
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText('✅ PF 4/5 PLATFORM VACATING • INGRESS HELD AT OUTER SIGNAL', 478, 272);
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#fdba74';
    ctx.fillText(`🛑 TRAIN #09304 HELD AT OUTER SIGNAL (${holdRemaining}s REMAINING) • ESCALATOR CLEARED`, 478, 285);
  } else if (isArriving) {
    // Amber Signal Light
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(signalX + 4, signalY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText('⚡ PF 4/5 APPROACHING • TRAIN GLIDING TO BERTH', 478, 272);
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('#09304 SPEED CONTROLLED • PREPARING ESCALATOR QUEUES', 478, 285);
  } else {
    // Green Signal Light
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(signalX + 4, signalY + 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText('⚠ PF 4/5 PILGRIMAGE TERMINAL • ESCALATOR INGRESS CHOKE', 478, 272);
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('#09304 SIMHASTHA KUBH MELA SPECIAL (3,600 DEVOTEES DEBARKING)', 478, 285);
  }

  // G. Platforms 6, 7 & 8 Shed (Hariphatak Transit Compound) (y: 368 to 415)
  ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
  ctx.fillRect(240, 368, 320, 36);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.strokeRect(240, 368, 320, 36);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('PLATFORMS 6/7/8 • HARIPHATAK OVERFLOW SHEDS & EGRESS RAMP', 248, 386);

  // H. Central Foot-Overbridge 1 (FOB 1) (x: 375 to 435, y: 80 to 420)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(375, 80, 60, 340);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(375, 80, 60, 340);

  // Steel Girder Cross-Bracing on FOB 1
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.2;
  for (let fy = 85; fy < 415; fy += 28) {
    ctx.beginPath();
    ctx.moveTo(375, fy);
    ctx.lineTo(435, fy + 24);
    ctx.moveTo(435, fy);
    ctx.lineTo(375, fy + 24);
    ctx.stroke();
  }

  // FOB 1 Header Pill
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(375, 80, 60, 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('FOB 1 (CENTRAL)', 378, 93);

  // Staircase Descending Arrows into PF 1, PF 2/3, PF 4/5
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 7.5px monospace';
  ctx.fillText('➔ PF 1', 382, 160);
  ctx.fillText('➔ PF 2/3', 382, 222);
  ctx.fillText('➔ PF 4/5', 382, 275);
  ctx.fillText('➔ PF 6-8', 382, 380);

  // I. North Foot-Overbridge 2 (Escalator Bay Skybridge) (x: 550 to 595, y: 80 to 240)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(550, 80, 45, 160);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(550, 80, 45, 160);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(550, 80, 45, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 7.5px sans-serif';
  ctx.fillText('FOB 2 (ESCALATOR)', 552, 91);

  // J. Emergency Exits A, B, C, D (Intelligent Exit Nodes)
  // EXIT A: Dewas Gate Main Porch & Drop-off (x: 110, y: 16)
  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.fillRect(110, 16, 95, 22);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(110, 16, 95, 22);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillText('🚪 EXIT A (DEWAS PORCH)', 114, 30);

  // EXIT B: Hariphatak Road Bypass Emergency Egress (x: 615, y: 460)
  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.fillRect(615, 460, 125, 22);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(615, 460, 125, 22);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillText('🚪 EXIT B (HARIPHATAK EGRESS)', 619, 474);

  // EXIT C: North Skybridge Emergency Fire Ramp (x: 625, y: 36)
  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.fillRect(625, 36, 125, 22);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(625, 36, 125, 22);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillText('🚪 EXIT C (SKYBRIDGE RAMP)', 629, 50);

  // EXIT D: Subway Auxiliary Egress Gate G5 (x: 270, y: 465)
  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.fillRect(270, 465, 115, 22);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(270, 465, 115, 22);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 8.5px sans-serif';
  ctx.fillText('🚪 EXIT D (SUBWAY AUX EGRESS)', 274, 479);

  // K. Safe Assembly Zones S1 & S2
  // Safe Assembly Zone S1 (Dewas Gate Outer Plaza)
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.arc(65, 27, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('ZONE S1', 47, 24);
  ctx.fillText('DEWAS PLAZA', 38, 33);

  // Safe Assembly Zone S2 (Hariphatak Mela Ground)
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.arc(740, 500, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('ZONE S2', 722, 497);
  ctx.fillText('MELA GROUND', 712, 506);

  // L. VIP Forecourt & Parking / Drop-off Area
  ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
  ctx.fillRect(15, 80, 55, 95);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.strokeRect(15, 80, 55, 95);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 7px sans-serif';
  ctx.fillText('PARKING &', 18, 98);
  ctx.fillText('DROP-OFF', 18, 108);
  ctx.fillText('FORECOURT', 18, 118);

  // M. Simulation Disclaimer Banner on canvas
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(15, h - 22, 430, 16);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(15, h - 22, 430, 16);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 7.5px monospace';
  ctx.fillText('ℹ SIMULATION / PROPOSED SAFETY MODEL • NOT OFFICIAL MEASURED RAILWAY DATA', 20, h - 11);
}

// 3. Sports Stadium Blueprint (Oval pitch, tiered stands, turnstiles)
function drawStadiumBlueprint(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2 + 10;

  // Outer Stadium Ring
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 330, 210, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Playing field
  ctx.fillStyle = 'rgba(6, 78, 59, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 140, 90, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 4. Music Festival Blueprint (Main Stage, Sound Towers, Mosh Pit)
function drawFestivalBlueprint(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Main Stage
  ctx.fillStyle = 'rgba(30, 27, 75, 0.95)';
  ctx.fillRect(290, 50, 240, 70);
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(290, 50, 240, 70);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('⚡ HORIZON MAIN STAGE ⚡', 335, 75);

  // Front barrier
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(410, 120, 100, 0, Math.PI);
  ctx.stroke();
}

function drawZones(
  ctx: CanvasRenderingContext2D,
  zones: Zone[],
  zoneDensities: Record<string, number>,
  selectedZoneId?: string
) {
  zones.forEach((zone) => {
    const isSelected = selectedZoneId === zone.id;
    const currentDensity = zoneDensities[zone.id] ?? zone.density;

    const isCritical = currentDensity > 75;
    const isMedium = currentDensity > 50;

    const accentColor = isSelected
      ? '#38bdf8'
      : isCritical
      ? '#ef4444'
      : isMedium
      ? '#f59e0b'
      : '#10b981';

    // 1. Subtle, translucent zone ambient tint
    ctx.fillStyle = isCritical
      ? 'rgba(239, 68, 68, 0.05)'
      : isSelected
      ? 'rgba(56, 189, 248, 0.06)'
      : 'rgba(15, 23, 42, 0.15)';
    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

    // 2. Ultra-fine perimeter line
    ctx.strokeStyle = isCritical
      ? 'rgba(239, 68, 68, 0.35)'
      : isSelected
      ? 'rgba(56, 189, 248, 0.5)'
      : 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

    // 3. High-Tech Corner Brackets (L-accents on the 4 corners)
    const arm = 14;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = isSelected ? 2.5 : 1.8;
    ctx.beginPath();
    // Top-Left Corner
    ctx.moveTo(zone.x, zone.y + arm);
    ctx.lineTo(zone.x, zone.y);
    ctx.lineTo(zone.x + arm, zone.y);
    // Top-Right Corner
    ctx.moveTo(zone.x + zone.width - arm, zone.y);
    ctx.lineTo(zone.x + zone.width, zone.y);
    ctx.lineTo(zone.x + zone.width, zone.y + arm);
    // Bottom-Right Corner
    ctx.moveTo(zone.x + zone.width, zone.y + zone.height - arm);
    ctx.lineTo(zone.x + zone.width, zone.y + zone.height);
    ctx.lineTo(zone.x + zone.width - arm, zone.y + zone.height);
    // Bottom-Left Corner
    ctx.moveTo(zone.x + arm, zone.y + zone.height);
    ctx.lineTo(zone.x, zone.y + zone.height);
    ctx.lineTo(zone.x, zone.y + zone.height - arm);
    ctx.stroke();

    // 4. Sleek Minimalist Glass Pill Telemetry Badge
    const badgeW = 90;
    const badgeH = 20;
    const badgeX = zone.x + 8;
    const badgeY = zone.y + 8;

    ctx.fillStyle = 'rgba(10, 15, 30, 0.88)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glowing status dot
    ctx.beginPath();
    ctx.arc(badgeX + 11, badgeY + 10, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    // Zone code and density
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText(`${zone.code} • ${currentDensity}%`, badgeX + 22, badgeY + 14);
  });
}

function drawHeatmap(ctx: CanvasRenderingContext2D, isAfterView: boolean, venueType: VenueType) {
  let criticalCenter = { x: 410, y: 220 }; // Temple: Zone B Sanctum
  let secondaryCenter = { x: 250, y: 320 }; // Zone C
  let mildCenter = { x: 590, y: 240 }; // Zone D

  if (venueType === 'stadium') {
    criticalCenter = { x: 275, y: 335 }; // Zone C (Main Tier-1 Pavilion)
    secondaryCenter = { x: 410, y: 190 }; // Zone B
    mildCenter = { x: 190, y: 130 }; // Zone A
  } else if (venueType === 'railway') {
    criticalCenter = { x: 590, y: 290 }; // Zone D (Platform 4/5 Escalator Bay)
    secondaryCenter = { x: 275, y: 335 }; // Zone C
    mildCenter = { x: 190, y: 120 }; // Zone A
  } else if (venueType === 'riverside' || venueType === 'festival') {
    criticalCenter = { x: 190, y: 130 }; // Zone A (Front Stage / Sangam Shoreline)
    secondaryCenter = { x: 410, y: 190 }; // Zone B
    mildCenter = { x: 590, y: 270 }; // Zone D
  }

  const densityCenters = isAfterView
    ? [
        { x: criticalCenter.x, y: criticalCenter.y, radius: 75, intensity: 0.38, color: 'rgba(34, 197, 94, ' },
        { x: secondaryCenter.x, y: secondaryCenter.y, radius: 80, intensity: 0.42, color: 'rgba(234, 179, 8, ' },
        { x: mildCenter.x, y: mildCenter.y, radius: 70, intensity: 0.32, color: 'rgba(56, 189, 248, ' },
      ]
    : [
        { x: criticalCenter.x, y: criticalCenter.y, radius: 135, intensity: 0.90, color: 'rgba(239, 68, 68, ' }, // Severe hotspot
        { x: secondaryCenter.x, y: secondaryCenter.y, radius: 80, intensity: 0.65, color: 'rgba(249, 115, 22, ' },
        { x: mildCenter.x, y: mildCenter.y, radius: 70, intensity: 0.40, color: 'rgba(234, 179, 8, ' },
      ];

  densityCenters.forEach((spot) => {
    const radGrad = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.radius);
    radGrad.addColorStop(0, spot.color + `${spot.intensity})`);
    radGrad.addColorStop(0.5, spot.color + `${spot.intensity * 0.45})`);
    radGrad.addColorStop(1, spot.color + '0)');

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawRerouteFlow(
  ctx: CanvasRenderingContext2D,
  isRerouting: boolean,
  venueType: VenueType = 'temple',
  engine?: SimulationEngine,
  emergencyIncident?: EmergencyIncident | null
) {
  const now = Date.now();
  const dashOffset = -(now * 0.035) % 24;

  // Road Route Labels directly on road surface (Only for Temple)
  if (venueType === 'temple') {
    ctx.font = 'bold 9px sans-serif';

    // Route 1 Label
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.fillText('ROUTE 1: NORTH INGRESS ➔', 90, 70);

    // Route 2 Label
    ctx.fillStyle = isRerouting ? 'rgba(239, 68, 68, 0.95)' : 'rgba(245, 158, 11, 0.9)';
    ctx.fillText(isRerouting ? '✕ ROUTE 2: CHOKE (HALTED)' : 'ROUTE 2: MAIN CORRIDOR ➔', 340, 60);

    // Route 3 Label
    ctx.fillStyle = isRerouting ? 'rgba(34, 197, 94, 0.95)' : 'rgba(56, 189, 248, 0.85)';
    ctx.fillText('ROUTE 3: EAST BYPASS ➔', 635, 120);

    // Route 4 Label (Exit)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.fillText('ROUTE 4: SOUTH EGRESS ➔', 435, 460);
  }

  // Live Railway Dynamic Wayfinding & Barriers
  if (venueType === 'railway' && engine) {
    // 1. GATE B BLOCKED DIVERSION
    if (!engine.gateBOpen) {
      // Red Cross Barricade at Gate B
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(390, 36);
      ctx.lineTo(430, 44);
      ctx.moveTo(430, 36);
      ctx.lineTo(390, 44);
      ctx.stroke();

      // Glowing Diversion Flow Line Left to Gate A (Dewas Gate)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(400, 52);
      ctx.lineTo(280, 52);
      ctx.lineTo(165, 42);
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = dashOffset;
      ctx.beginPath();
      ctx.moveTo(400, 52);
      ctx.lineTo(280, 52);
      ctx.lineTo(165, 42);
      ctx.stroke();

      // Glowing Diversion Flow Line Right to Gate C (East Skybridge)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(420, 52);
      ctx.lineTo(520, 52);
      ctx.lineTo(615, 46);
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(420, 52);
      ctx.lineTo(520, 52);
      ctx.lineTo(615, 46);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating Route Guidance Pill
      ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
      ctx.fillRect(250, 60, 300, 20);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(250, 60, 300, 20);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ INGRESS SPLIT: 50% ➔ GATE A (PORCH) | 50% ➔ GATE C (RAMP)', 256, 73);
      ctx.restore();
    }

    // 2. EXIT B BLOCKED DIVERSION
    if (!engine.exitBOpen) {
      // Red Cross Barricade at Exit B
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(400, 510);
      ctx.lineTo(440, 520);
      ctx.moveTo(440, 510);
      ctx.lineTo(400, 520);
      ctx.stroke();

      // Glowing Diversion Corridor Left to Exit A
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(395, 490);
      ctx.lineTo(270, 490);
      ctx.lineTo(185, 512);
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = dashOffset;
      ctx.beginPath();
      ctx.moveTo(395, 490);
      ctx.lineTo(270, 490);
      ctx.lineTo(185, 512);
      ctx.stroke();

      // Glowing Diversion Corridor Right to Exit C
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(435, 490);
      ctx.lineTo(530, 490);
      ctx.lineTo(615, 512);
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(435, 490);
      ctx.lineTo(530, 490);
      ctx.lineTo(615, 512);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating Egress Guidance Pill
      ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
      ctx.fillRect(250, 460, 300, 20);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(250, 460, 300, 20);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('⚡ EGRESS DIVERTED: EXIT B BLOCKED ➔ USE EXIT A OR EXIT C', 256, 473);
      ctx.restore();
    }

    // 3. EMERGENCY EVACUATION VECTORS
    if (engine.emergencyLevel === 'EMERGENCY') {
      ctx.save();
      // Glowing green chevrons pointing devotees to exits
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = dashOffset;
      // Corridor to Exit A
      ctx.beginPath();
      ctx.moveTo(375, 120);
      ctx.lineTo(180, 50);
      ctx.stroke();
      // Corridor to Exit C
      ctx.beginPath();
      ctx.moveTo(435, 120);
      ctx.lineTo(630, 50);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    return;
  }

  if (isRerouting) {
    let haltX = 410;
    let haltY = 80;
    let haltText = '✕ GATE G2 HALTED (CHOKE)';
    let bypassText = '⚡ SAFE DIVERTED PASSAGE (BYPASS G3) ➔➔';
    let pathStart = { x: 410, y: 80 };
    let pathMid = { x: 620, y: 80 };
    let pathTurn = { x: 620, y: 350 };
    let pathEnd = { x: 440, y: 480 };
    let badgeX = 455;
    let badgeY = 105;

    if (venueType === 'stadium') {
      haltX = 560;
      haltY = 150;
      haltText = '✕ GATE G3 HALTED (PAVILION)';
      bypassText = '⚡ DIVERSION TO GATE G2 (NORTH RAMP) ➔➔';
      pathStart = { x: 560, y: 150 };
      pathMid = { x: 400, y: 80 };
      pathTurn = { x: 200, y: 150 };
      pathEnd = { x: 440, y: 480 };
      badgeX = 220;
      badgeY = 95;
    } else if (venueType === 'railway') {
      haltX = 560;
      haltY = 150;
      haltText = '✕ GATE G3 HALTED (ESCALATORS)';
      bypassText = '⚡ DIVERSION VIA GATE G1 (SUBWAY) ➔➔';
      pathStart = { x: 560, y: 150 };
      pathMid = { x: 350, y: 80 };
      pathTurn = { x: 180, y: 120 };
      pathEnd = { x: 440, y: 480 };
      badgeX = 200;
      badgeY = 95;
    } else if (venueType === 'riverside' || venueType === 'festival') {
      haltX = 180;
      haltY = 60;
      haltText = '✕ GATE G1 HALTED (SURGE PIT)';
      bypassText = '⚡ DIVERSION TO GATE G3 (PONTOON/LAWN) ➔➔';
      pathStart = { x: 180, y: 60 };
      pathMid = { x: 400, y: 80 };
      pathTurn = { x: 560, y: 150 };
      pathEnd = { x: 440, y: 480 };
      badgeX = 260;
      badgeY = 95;
    }

    // 1. Red Halt Barrier at choked gate
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(haltX - 20, haltY - 5);
    ctx.lineTo(haltX + 20, haltY + 5);
    ctx.moveTo(haltX + 20, haltY - 5);
    ctx.lineTo(haltX - 20, haltY + 5);
    ctx.stroke();

    // Red warning pill
    ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
    ctx.fillRect(haltX - 85, haltY + 10, 175, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(haltText, haltX - 75, haltY + 23);

    // 2. Glowing Safe Diversion Corridor
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pathStart.x, pathStart.y);
    ctx.lineTo(pathMid.x, pathMid.y);
    ctx.lineTo(pathTurn.x, pathTurn.y);
    ctx.lineTo(pathEnd.x, pathEnd.y);
    ctx.stroke();

    // Animated dashed green vector line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = dashOffset;
    ctx.beginPath();
    ctx.moveTo(pathStart.x, pathStart.y);
    ctx.lineTo(pathMid.x, pathMid.y);
    ctx.lineTo(pathTurn.x, pathTurn.y);
    ctx.lineTo(pathEnd.x, pathEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Prominent Route Guidance Badge
    ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
    ctx.fillRect(badgeX, badgeY, 260, 22);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(badgeX, badgeY, 260, 22);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(bypassText, badgeX + 6, badgeY + 15);
  }
}

function drawMarshals(ctx: CanvasRenderingContext2D, isDeployed: boolean, venueType: VenueType = 'temple') {
  if (!isDeployed) return;

  const now = Date.now();
  let marshalPositions = [
    // West Flank of Zone B Sanctum Corridor
    { x: 375, y: 140, id: 1 },
    { x: 375, y: 168, id: 2 },
    { x: 375, y: 196, id: 3 },
    { x: 375, y: 224, id: 4 },
    { x: 375, y: 252, id: 5 },
    { x: 375, y: 280, id: 6 },
    // East Flank of Zone B Sanctum Corridor
    { x: 445, y: 140, id: 7 },
    { x: 445, y: 168, id: 8 },
    { x: 445, y: 196, id: 9 },
    { x: 445, y: 224, id: 10 },
    { x: 445, y: 252, id: 11 },
    { x: 445, y: 280, id: 12 },
  ];
  let ropeWest = { x1: 375, y1: 135, x2: 375, y2: 285 };
  let ropeEast = { x1: 445, y1: 135, x2: 445, y2: 285 };
  let pillX = 310;
  let pillY = 116;
  let pillText = '🛡 12 MARSHALS • ZONE B LAMINAR FLOW ACTIVE';

  if (venueType === 'stadium') {
    marshalPositions = [
      { x: 215, y: 290, id: 1 }, { x: 215, y: 310, id: 2 }, { x: 215, y: 330, id: 3 },
      { x: 215, y: 350, id: 4 }, { x: 215, y: 370, id: 5 }, { x: 215, y: 388, id: 6 },
      { x: 335, y: 290, id: 7 }, { x: 335, y: 310, id: 8 }, { x: 335, y: 330, id: 9 },
      { x: 335, y: 350, id: 10 }, { x: 335, y: 370, id: 11 }, { x: 335, y: 388, id: 12 },
    ];
    ropeWest = { x1: 215, y1: 285, x2: 215, y2: 395 };
    ropeEast = { x1: 335, y1: 285, x2: 335, y2: 395 };
    pillX = 180;
    pillY = 262;
    pillText = '🛡 12 MARSHALS • ZONE C CONCOURSE RELIEF ACTIVE';
  } else if (venueType === 'railway') {
    marshalPositions = [
      { x: 530, y: 245, id: 1 }, { x: 530, y: 265, id: 2 }, { x: 530, y: 285, id: 3 },
      { x: 530, y: 305, id: 4 }, { x: 530, y: 325, id: 5 }, { x: 530, y: 345, id: 6 },
      { x: 650, y: 245, id: 7 }, { x: 650, y: 265, id: 8 }, { x: 650, y: 285, id: 9 },
      { x: 650, y: 305, id: 10 }, { x: 650, y: 325, id: 11 }, { x: 650, y: 345, id: 12 },
    ];
    ropeWest = { x1: 530, y1: 240, x2: 530, y2: 350 };
    ropeEast = { x1: 650, y1: 240, x2: 650, y2: 350 };
    pillX = 490;
    pillY = 220;
    pillText = '🛡 12 MARSHALS • ZONE D FOB DISCHARGE ACTIVE';
  } else if (venueType === 'riverside' || venueType === 'festival') {
    marshalPositions = [
      { x: 130, y: 90, id: 1 }, { x: 130, y: 110, id: 2 }, { x: 130, y: 130, id: 3 },
      { x: 130, y: 150, id: 4 }, { x: 130, y: 170, id: 5 }, { x: 130, y: 188, id: 6 },
      { x: 250, y: 90, id: 7 }, { x: 250, y: 110, id: 8 }, { x: 250, y: 130, id: 9 },
      { x: 250, y: 150, id: 10 }, { x: 250, y: 170, id: 11 }, { x: 250, y: 188, id: 12 },
    ];
    ropeWest = { x1: 130, y1: 85, x2: 130, y2: 195 };
    ropeEast = { x1: 250, y1: 85, x2: 250, y2: 195 };
    pillX = 110;
    pillY = 66;
    pillText = '🛡 12 MARSHALS • ZONE A BARRIER RELIEF ACTIVE';
  }

  // Draw guiding stanchion queue ropes connecting marshals
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  // West queue boundary
  ctx.beginPath();
  ctx.moveTo(ropeWest.x1, ropeWest.y1);
  ctx.lineTo(ropeWest.x2, ropeWest.y2);
  ctx.stroke();
  // East queue boundary
  ctx.beginPath();
  ctx.moveTo(ropeEast.x1, ropeEast.y1);
  ctx.lineTo(ropeEast.x2, ropeEast.y2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw each of the 12 Marshals
  marshalPositions.forEach((m) => {
    ctx.save();
    ctx.translate(m.x, m.y);

    // High-vis pulsing aura around each marshal
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.005 + m.id);
    ctx.beginPath();
    ctx.arc(0, 0, 7.5 + pulse * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(234, 179, 8, ${0.15 + pulse * 0.15})`;
    ctx.fill();

    // Body / Fluorescent Neon Safety Vest
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.8, 3.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15'; // Fluorescent neon yellow
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Reflective Silver Stripe across shoulders
    ctx.beginPath();
    ctx.moveTo(-3.2, 0);
    ctx.lineTo(3.2, 0);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Security Cap
    ctx.beginPath();
    ctx.arc(0, -1, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a'; // Deep security navy
    ctx.fill();

    // Glowing Orange Traffic Baton in hand pointing forward
    const batonGlow = 0.6 + 0.4 * Math.sin(now * 0.008 + m.id);
    ctx.beginPath();
    const batonDir = m.x < 410 ? 1 : -1;
    ctx.moveTo(batonDir * 4, 1);
    ctx.lineTo(batonDir * 9, 3);
    ctx.strokeStyle = `rgba(249, 115, 22, ${batonGlow})`;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.restore();
  });

  // Floating Status Pill in Bottleneck Zone
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(pillX, pillY, 245, 20);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pillX, pillY, 245, 20);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText(pillText, pillX + 6, pillY + 14);
}

function drawExpandedExit(ctx: CanvasRenderingContext2D, isExpanded: boolean) {
  if (!isExpanded) return;

  const now = Date.now();
  const dashOffset = -(now * 0.04) % 20;

  // 1. Expanded road bed at bottom exit (y: 450 to 535)
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.lineWidth = 55;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(420, 460);
  ctx.lineTo(420, 535);
  ctx.stroke();

  // 2. Auxiliary egress channel arrows
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = dashOffset;
  // Left auxiliary channel
  ctx.beginPath();
  ctx.moveTo(390, 465);
  ctx.lineTo(390, 535);
  ctx.stroke();
  // Right auxiliary channel
  ctx.beginPath();
  ctx.moveTo(450, 465);
  ctx.lineTo(450, 535);
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. Dual Auxiliary Turnstiles open
  // Left Aux Gate
  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.fillRect(355, 492, 45, 18);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.strokeRect(355, 492, 45, 18);
  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('AUX 4A ✔', 360, 504);

  // Right Aux Gate
  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.fillRect(440, 492, 45, 18);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.strokeRect(440, 492, 45, 18);
  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('AUX 4B ✔', 445, 504);

  // 4. Prominent Exit Booster Banner
  ctx.fillStyle = 'rgba(6, 78, 59, 0.95)';
  ctx.fillRect(320, 440, 200, 20);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(320, 440, 200, 20);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('⚡ +35% EGRESS BOOST • RAPID DISCHARGE', 326, 454);
}

function drawAgents(
  ctx: CanvasRenderingContext2D,
  engine: SimulationEngine,
  isAfterView: boolean,
  scenario?: ScenarioSettings,
  venueType: VenueType = 'temple'
) {
  const now = Date.now();

  const DEVOTEE_PALETTE = [
    '#ea580c', // Saffron / Kesari
    '#d97706', // Turmeric Ochre
    '#f59e0b', // Marigold Yellow
    '#f8fafc', // Pristine White Kurta / Dhoti
    '#dc2626', // Crimson Maroon
    '#0284c7', // Sky Blue
    '#059669', // Emerald Green
    '#7c3aed', // Royal Purple
    '#f43f5e', // Rose Coral
    '#f1f5f9', // Cotton White
    '#b45309', // Earthy Brown
  ];

  const SCARF_PALETTE = [
    '#fef08a', '#fde047', '#fed7aa', '#fbcfe8', '#cbd5e1', '#bbf7d0', '#fed7aa'
  ];

  const SKIN_PALETTE = [
    '#fed7aa', '#fcd34d', '#fde047', '#d97706', '#b45309', '#fef3c7'
  ];

  const HAIR_PALETTE = [
    '#0f172a', '#1e293b', '#334155', '#1c1917', '#292524'
  ];

  engine.agents.forEach((agent) => {
    const baseClothes = DEVOTEE_PALETTE[agent.id % DEVOTEE_PALETTE.length];
    const scarfColor = SCARF_PALETTE[agent.id % SCARF_PALETTE.length];
    const skinColor = SKIN_PALETTE[agent.id % SKIN_PALETTE.length];
    const hairColor = HAIR_PALETTE[agent.id % HAIR_PALETTE.length];

    let inCriticalZone = false;
    if (venueType === 'stadium') {
      // Zone C (Tier-1 Pavilion): x 180-370, y 260-400
      inCriticalZone = agent.x > 180 && agent.x < 370 && agent.y > 260 && agent.y < 400;
    } else if (venueType === 'railway') {
      // Zone D (Platform 4/5 Escalator Bay): x 500-680, y 220-360
      inCriticalZone = agent.x > 500 && agent.x < 680 && agent.y > 220 && agent.y < 360;
    } else if (venueType === 'riverside' || venueType === 'festival') {
      // Zone A (Shoreline / Front Stage Pit): x 100-280, y 60-200
      inCriticalZone = agent.x > 100 && agent.x < 280 && agent.y > 60 && agent.y < 200;
    } else {
      // Temple Zone B Sanctum Corridor: x 370-455, y 130-280
      inCriticalZone = agent.x > 370 && agent.x < 455 && agent.y > 130 && agent.y < 280;
    }

    const isMitigated = isAfterView || (scenario?.deployStaffZoneB ?? false) || (scenario?.closeGateG2 ?? false) || (scenario?.redirectFlowToG3 ?? false);

    let clothesColor = baseClothes;
    let alertGlow: string | null = null;

    const bState = agent.behaviourState || (engine.emergencyLevel === 'EMERGENCY' ? 'EMERGENCY' : engine.emergencyLevel === 'HIGH_DENSITY' ? 'CAUTION' : 'NORMAL');

    if (bState === 'EMERGENCY') {
      // Visibly distinct EMERGENCY MODE: pulsing crimson beacon aura
      alertGlow = `rgba(239, 68, 68, ${0.55 + 0.35 * Math.sin(now * 0.01 + agent.id)})`;
      clothesColor = '#ef4444';
    } else if (bState === 'CAUTION') {
      // Visibly distinct HIGH DENSITY MODE: amber bottleneck crowding aura
      alertGlow = `rgba(245, 158, 11, ${0.4 + 0.25 * Math.sin(now * 0.007 + agent.id)})`;
      clothesColor = '#f59e0b';
    } else if (agent.isRerouted || (isAfterView && agent.x > 500)) {
      alertGlow = 'rgba(6, 182, 212, 0.45)'; // Cyan safe diversion guide
    } else if (inCriticalZone) {
      if (isMitigated) {
        alertGlow = 'rgba(16, 185, 129, 0.35)'; // Controlled laminar flow
      } else {
        alertGlow = `rgba(239, 68, 68, ${0.45 + 0.3 * Math.sin(now * 0.008 + agent.id)})`; // Severe choke warning pulse
        clothesColor = '#ef4444'; // Red tinted in bottleneck
      }
    }

    // Direction angle from velocity
    const angle = Math.atan2(agent.vy || 0.01, agent.vx || 0.01);
    
    // Natural human stride frequency (adapted to density deceleration or emergency sprint)
    const walkSpeed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
    const strideFreq = bState === 'EMERGENCY' ? 0.020 : bState === 'CAUTION' ? 0.008 : 0.012;
    const strideAmp = bState === 'CAUTION' ? 1.5 : 2.6;
    const stride = Math.sin(now * strideFreq * (walkSpeed > 0.1 ? agent.speed : 0.2) + agent.id * 1.5) * strideAmp;

    ctx.save();
    ctx.translate(agent.x, agent.y);
    ctx.rotate(angle);

    // 0. Status Warning / Guidance Aura (if congested, rerouted, or emergency)
    if (alertGlow) {
      ctx.beginPath();
      ctx.arc(0, 0, bState === 'EMERGENCY' ? 10.5 : 8.5, 0, Math.PI * 2);
      ctx.fillStyle = alertGlow;
      ctx.fill();
    }

    // 1. Soft Ground Shadow
    ctx.beginPath();
    ctx.ellipse(0, 1.4, 4.8, 2.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Walking Legs / Sandals
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(stride, -1.8, 1.6, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-stride, 1.8, 1.6, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Human Torso & Shoulders
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.4, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = clothesColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 4. Traditional Angavastram / Shawl / Dupatta across shoulder
    ctx.beginPath();
    ctx.moveTo(-2.2, -1.8);
    ctx.lineTo(2.2, 1.8);
    ctx.strokeStyle = scarfColor;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 5. Arms & Skin-toned Hands swinging with natural momentum
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(-stride * 0.6, -3.2, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(stride * 0.6, 3.2, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // 6. Head & Hair Crown
    ctx.beginPath();
    ctx.arc(1.4, 0, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = skinColor;
    ctx.fill();

    // Hair cap
    ctx.beginPath();
    ctx.arc(1.2, 0, 2.2, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fillStyle = hairColor;
    ctx.fill();

    ctx.restore();
  });
}

function drawGates(
  ctx: CanvasRenderingContext2D,
  gates: Gate[],
  scenario?: ScenarioSettings,
  isAfterView?: boolean,
  engine?: SimulationEngine,
  venueType: VenueType = 'railway'
) {
  // If venue is railway and engine is provided, render live interactive Gate A, B, C and Exit A, B, C
  if (venueType === 'railway' && engine) {
    const railwayGates = [
      { id: 'gate-a', code: 'Gate A (Dewas Gate)', x: 160, y: 40, isOpen: engine.gateAOpen, isExit: false },
      { id: 'gate-b', code: 'Gate B (Central FOB)', x: 410, y: 40, isOpen: engine.gateBOpen, isExit: false },
      { id: 'gate-c', code: 'Gate C (East Skybridge)', x: 620, y: 45, isOpen: engine.gateCOpen, isExit: false },
      { id: 'exit-a', code: 'Exit A (City Side)', x: 180, y: 515, isOpen: engine.exitAOpen, isExit: true },
      { id: 'exit-b', code: 'Exit B (Central Plaza)', x: 420, y: 515, isOpen: engine.exitBOpen, isExit: true },
      { id: 'exit-c', code: 'Exit C (Hariphatak Bypass)', x: 620, y: 515, isOpen: engine.exitCOpen, isExit: true },
    ];

    railwayGates.forEach((g) => {
      const isClosed = !g.isOpen;

      // Draw Gate/Exit Marker Node
      ctx.beginPath();
      ctx.arc(g.x, g.y, isClosed ? 9 : 7.5, 0, Math.PI * 2);
      ctx.fillStyle = isClosed ? '#ef4444' : g.isExit ? '#10b981' : '#0284c7';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // If closed, draw physical barricade beam
      if (isClosed) {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(g.x - 24, g.y);
        ctx.lineTo(g.x + 24, g.y);
        ctx.stroke();

        // Diagonal hazard stripes on barricade
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        for (let bx = g.x - 20; bx <= g.x + 20; bx += 8) {
          ctx.beginPath();
          ctx.moveTo(bx - 3, g.y - 4);
          ctx.lineTo(bx + 3, g.y + 4);
          ctx.stroke();
        }
        ctx.restore();
      }

      const label = isClosed
        ? `⛔ ${g.code} (CLOSED)`
        : g.isExit
        ? `⬇ ${g.code} (OPEN)`
        : `⬇ ${g.code} (OPEN)`;

      ctx.font = 'bold 9.5px monospace';
      const textWidth = ctx.measureText(label).width;
      const labelY = g.isExit ? g.y - 18 : g.y + 22;

      ctx.fillStyle = isClosed ? 'rgba(220, 38, 38, 0.95)' : g.isExit ? 'rgba(6, 78, 59, 0.92)' : 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(g.x - textWidth / 2 - 6, labelY - 13, textWidth + 12, 17, 4);
      } else {
        ctx.rect(g.x - textWidth / 2 - 6, labelY - 13, textWidth + 12, 17);
      }
      ctx.fill();
      ctx.strokeStyle = isClosed ? '#ef4444' : g.isExit ? '#10b981' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, g.x - textWidth / 2, labelY);
    });

    // If Exit B is closed, draw clear dynamic detour arrows to Exit A and Exit C
    if (!engine.exitBOpen) {
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('⬅ DIVERSION TO EXIT A', 220, 480);
      ctx.fillText('DIVERSION TO EXIT C ➡', 470, 480);

      // Detour arrows
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      // Left arrow toward Exit A
      ctx.beginPath();
      ctx.moveTo(380, 465);
      ctx.lineTo(240, 475);
      ctx.lineTo(200, 505);
      ctx.stroke();

      // Right arrow toward Exit C
      ctx.beginPath();
      ctx.moveTo(460, 465);
      ctx.lineTo(560, 475);
      ctx.lineTo(600, 505);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    return;
  }

  // Fallback for non-railway venues
  gates.forEach((gate) => {
    // If isAfterView is explicitly false (Unmitigated view in Before/After comparison), Gate 2 MUST stay OPEN!
    const isG2Closed = isAfterView
      ? true
      : isAfterView === false
      ? false
      : (scenario?.closeGateG2 ?? false);
    const isClosed = gate.id === 'gate-2' && isG2Closed;

    // Glowing Gate Node
    ctx.beginPath();
    ctx.arc(gate.x, gate.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = isClosed ? '#ef4444' : gate.isAlert ? '#f59e0b' : '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const isExit = gate.y > 450;
    const label = isClosed
      ? `✕ ${gate.code} (Closed)`
      : isExit
      ? `⬇ ${gate.code}: Egress`
      : gate.isAlert
      ? `▲ ${gate.code}: Ingress`
      : `⬇ ${gate.code}: Ingress`;

    ctx.font = 'bold 10px sans-serif';
    const textWidth = ctx.measureText(label).width;

    const labelY = isExit ? gate.y - 18 : gate.y - 20;

    ctx.fillStyle = isClosed
      ? 'rgba(220, 38, 38, 0.95)'
      : isExit
      ? 'rgba(6, 78, 59, 0.92)'
      : gate.isAlert
      ? 'rgba(180, 83, 9, 0.95)'
      : 'rgba(15, 23, 42, 0.9)';

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(gate.x - textWidth / 2 - 8, labelY - 14, textWidth + 16, 18, 4);
    } else {
      ctx.rect(gate.x - textWidth / 2 - 8, labelY - 14, textWidth + 16, 18);
    }
    ctx.fill();
    ctx.strokeStyle = isClosed ? '#ef4444' : isExit ? '#10b981' : '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, gate.x - textWidth / 2, labelY);
  });
}

function drawEmergencyIncident(
  ctx: CanvasRenderingContext2D,
  incident: EmergencyIncident,
  venueType: VenueType
) {
  const now = Date.now();
  if (!incident.active) return;

  if (incident.type === 'fire') {
    const fx = incident.x || 390;
    const fy = incident.y || 190;
    const radius = incident.radius || 60;

    // 1. Red Hazard Perimeter with animated dashed boundary
    const dashOffset = -(now * 0.04) % 24;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = dashOffset;
    ctx.beginPath();
    ctx.arc(fx, fy, radius + 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing heat aura
    const heatGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, radius + 35);
    heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    heatGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.25)');
    heatGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = heatGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, radius + 35, 0, Math.PI * 2);
    ctx.fill();

    // 2. Rising Smoke Plumes
    for (let s = 0; s < 4; s++) {
      const smokeAge = ((now * 0.001 + s * 0.6) % 2.4);
      const smokeRadius = 18 + smokeAge * 22;
      const smokeY = fy - 10 - smokeAge * 35;
      const smokeX = fx + Math.sin(smokeAge * 3 + s) * 14;
      const smokeAlpha = Math.max(0, 0.45 - smokeAge * 0.16);

      ctx.fillStyle = `rgba(30, 41, 59, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Flickering Fire Core with animated tongues
    for (let f = 0; f < 7; f++) {
      const angle = (f / 7) * Math.PI * 2 + now * 0.002;
      const fDist = 12 + 8 * Math.sin(now * 0.01 + f);
      const px = fx + Math.cos(angle) * fDist;
      const py = fy + Math.sin(angle) * fDist;
      const fSize = 14 + 10 * Math.sin(now * 0.015 + f * 2);

      const fGrad = ctx.createRadialGradient(px, py, 0, px, py, fSize);
      fGrad.addColorStop(0, '#ffffff'); // White-hot
      fGrad.addColorStop(0.3, '#fde047'); // Yellow
      fGrad.addColorStop(0.7, '#ea580c'); // Orange
      fGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');

      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.arc(px, py, fSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Firefighters / RPF Fire Squad
    const fUnit1 = { x: fx - 45, y: fy + 35 };
    const fUnit2 = { x: fx + 45, y: fy + 35 };
    [fUnit1, fUnit2].forEach((fu, idx) => {
      ctx.beginPath();
      ctx.arc(fu.x, fu.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#eab308';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(fu.x, fu.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();

      // Water spray jet towards fire
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -(now * 0.06) % 12;
      ctx.beginPath();
      ctx.moveTo(fu.x, fu.y);
      ctx.lineTo(fx + (idx === 0 ? -10 : 10), fy + 5);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 5. Fire Alert HUD Pill
    ctx.fillStyle = 'rgba(153, 27, 27, 0.95)';
    ctx.fillRect(fx - 110, fy - 65, 220, 24);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx - 110, fy - 65, 220, 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('🔥 ACTIVE FIRE EVACUATION PROTOCOL', fx - 100, fy - 49);

    // Green Emergency Egress Guidance on road
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('➔➔ EMERGENCY EGRESS VIA DEWAS GATE (G1)', 120, 480);
    ctx.fillText('➔➔ EMERGENCY HARIPHATAK EGRESS (G4)', 460, 480);

  } else if (incident.type === 'medical') {
    const mx = incident.x || 410;
    const my = incident.y || 220;

    // 1. Animate 108 Ambulance Driving Strictly on Dedicated Outer Perimeter Road
    // Road Coordinates: (15, 18) -> (322, 18) -> (322, 82) (Adjacent to 108 Base)
    // Ambulance NEVER traverses passenger platforms or railway tracks!
    const cycle = (now * 0.0002) % 1; // 5-second cycle
    let ambX = 322;
    let ambY = 82;
    let ambAngle = Math.PI / 2; // facing down into parking bay
    let isMoving = false;

    if (cycle < 0.35) {
      // Phase 1: Driving east along horizontal perimeter road (15 to 322)
      const t = cycle / 0.35;
      ambX = 15 + t * (322 - 15);
      ambY = 18;
      ambAngle = 0;
      isMoving = true;
    } else if (cycle < 0.48) {
      // Phase 2: Turning 90 degrees and berthing into 108 Ambulance Bay (18 to 82)
      const t = (cycle - 0.35) / 0.13;
      ambX = 322;
      ambY = 18 + t * (82 - 18);
      ambAngle = Math.PI / 2;
      isMoving = true;
    } else {
      // Phase 3: Parked at 108 Rapid Response Base Bay
      ambX = 322;
      ambY = 82;
      ambAngle = Math.PI / 2;
      isMoving = false;
    }

    // Draw 108 Advanced Life Support Ambulance Van
    ctx.save();
    ctx.translate(ambX, ambY);
    ctx.rotate(ambAngle);

    // Headlight cone on road when driving
    if (isMoving) {
      const coneGrad = ctx.createRadialGradient(24, 0, 4, 60, 0, 32);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      coneGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(18, -4);
      ctx.lineTo(60, -22);
      ctx.lineTo(60, 22);
      ctx.lineTo(18, 4);
      ctx.fill();
    }

    // Van Body (White)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-18, -9, 36, 18);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-18, -9, 36, 18);

    // Green & Saffron Emergency Side Bands
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-18, -9, 36, 3);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-18, 6, 36, 3);

    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, -7, 6, 14);

    // Red Cross Emblem on roof
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-3, -6, 6, 12);
    ctx.fillRect(-6, -3, 12, 6);

    // Strobe Warning Lightbar (Alternating Red / Blue)
    const flash = Math.sin(now * 0.02) > 0;
    // Red beacon
    ctx.fillStyle = flash ? '#ef4444' : '#1e3a8a';
    ctx.beginPath();
    ctx.arc(-8, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Blue beacon
    ctx.fillStyle = flash ? '#3b82f6' : '#991b1b';
    ctx.beginPath();
    ctx.arc(-8, 5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pulse aura around strobe lights
    ctx.fillStyle = flash ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)';
    ctx.beginPath();
    ctx.arc(-8, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 2. Glowing Sterile Pedestrian Corridor (From 108 Base x: 220 -> FOB 1 x: 400 -> Platform Patient)
    const corridorDash = -(now * 0.05) % 20;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(250, 95);
    ctx.lineTo(400, 95);
    ctx.lineTo(400, my);
    ctx.stroke();

    // Dashed Centerline on Sterile Aisle
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = corridorDash;
    ctx.beginPath();
    ctx.moveTo(250, 95);
    ctx.lineTo(400, 95);
    ctx.lineTo(400, my);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Foot Paramedic Team with Emergency Spineboard (Walking along Sterile FOB Aisle)
    const teamProgress = (Math.sin(now * 0.0016) + 1) / 2;
    const teamY = 100 + teamProgress * (my - 105);
    const teamX = 400;

    // Lead Paramedic (High-Vis Green Uniform)
    ctx.beginPath();
    ctx.arc(teamX, teamY - 14, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Paramedic Head
    ctx.beginPath();
    ctx.arc(teamX, teamY - 14, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Orange Emergency Spineboard / Stretcher
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(teamX - 5, teamY - 9, 10, 18);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(teamX - 5, teamY - 9, 10, 18);
    // Medical monitor on stretcher
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(teamX - 3, teamY - 5, 6, 4);

    // Rear Paramedic
    ctx.beginPath();
    ctx.arc(teamX, teamY + 14, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 4. Pulsing Red Cross at Patient Location
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.008);
    ctx.beginPath();
    ctx.arc(mx, my, 18 + pulse * 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(239, 68, 68, ${0.25 + pulse * 0.25})`;
    ctx.fill();

    // Red Cross Badge
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(mx, my, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // White Cross symbol
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mx - 2.5, my - 8, 5, 16);
    ctx.fillRect(mx - 8, my - 2.5, 16, 5);

    // 5. Medical Corridor Floating HUD Pill
    ctx.fillStyle = 'rgba(6, 78, 59, 0.96)';
    ctx.fillRect(mx - 145, my - 45, 290, 24);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx - 145, my - 45, 290, 24);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText('🚑 108 AMBULANCE VIA OUTER ROAD (TRACK ISOLATED)', mx - 138, my - 31);
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('FOOT PARAMEDICS DISPATCHED VIA STERILE FOB AISLE', mx - 138, my - 21);
  } else if (incident.type === 'train_surge' || incident.type === 'crush') {
    const sx = incident.x || 560;
    const sy = incident.y || 260;

    // Platform Surge Amber Beacons
    const surgePulse = 0.5 + 0.5 * Math.sin(now * 0.01);
    ctx.strokeStyle = `rgba(245, 158, 11, ${surgePulse})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(470, 250, 280, 50);

    // RPF Cordon across stair entrance
    ctx.fillStyle = 'rgba(180, 83, 9, 0.95)';
    ctx.fillRect(sx - 120, sy - 40, 240, 22);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx - 120, sy - 40, 240, 22);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText('⚠ CROWD CRUSH ALERT • RPF HOLDING LINE', sx - 110, sy - 25);
  } else if (incident.type === 'electrical') {
    const ex = incident.x || 380;
    const ey = incident.y || 190;
    // Blue electrical arcs & spark animation
    for (let a = 0; a < 5; a++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 35;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex + Math.cos(angle) * (dist * 0.5) + (Math.random() - 0.5) * 10, ey + Math.sin(angle) * (dist * 0.5) + (Math.random() - 0.5) * 10);
      ctx.lineTo(ex + Math.cos(angle) * dist, ey + Math.sin(angle) * dist);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(ex - 110, ey - 45, 220, 22);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ex - 110, ey - 45, 220, 22);
    ctx.fillStyle = '#7dd3fc';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('⚡ ELECTRICAL HAZARD • OHE POWER CUT', ex - 100, ey - 30);
  } else if (incident.type === 'blocked_route') {
    const bx = incident.x || 410;
    const by = incident.y || 220;
    // Barricade with red hazard lights
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(bx - 25, by - 10);
    ctx.lineTo(bx + 25, by + 10);
    ctx.moveTo(bx + 25, by - 10);
    ctx.lineTo(bx - 25, by + 10);
    ctx.stroke();

    ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
    ctx.fillRect(bx - 100, by + 15, 200, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('🛑 ROUTE BLOCKED • REROUTING', bx - 90, by + 29);
  }

  // ==========================================
  // GRAPH-BASED EVACUATION PATH OVERLAY (Dijkstra Route)
  // ==========================================
  if (incident.evacuationPathPoints && incident.evacuationPathPoints.length > 1) {
    const pts = incident.evacuationPathPoints;

    // 1. Broad Glowing Corridor Ribbon
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    // 2. Animated Pulsing Centerline
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([12, 8]);
    ctx.lineDashOffset = -(now * 0.05) % 20;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Directional Animated Chevrons
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const segDx = p2.x - p1.x;
      const segDy = p2.y - p1.y;
      const segLen = Math.hypot(segDx, segDy) || 1;
      const chevronSpacing = 32;
      const chevronCount = Math.floor(segLen / chevronSpacing);

      for (let c = 1; c <= chevronCount; c++) {
        const t = ((c * chevronSpacing + (now * 0.04) % chevronSpacing)) / segLen;
        if (t > 0.05 && t < 0.95) {
          const cx = p1.x + segDx * t;
          const cy = p1.y + segDy * t;
          const angle = Math.atan2(segDy, segDx);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(-6, -4);
          ctx.lineTo(4, 0);
          ctx.lineTo(-6, 4);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 4. Origin Corridor Ingress / Safe Detour Marker
    const oPulse = 0.5 + 0.5 * Math.sin(now * 0.01);
    const isFire = incident.type === 'fire';
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, 12 + oPulse * 4, 0, Math.PI * 2);
    ctx.fillStyle = isFire ? `rgba(6, 182, 212, ${0.25 + oPulse * 0.25})` : `rgba(239, 68, 68, ${0.25 + oPulse * 0.25})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, 7, 0, Math.PI * 2);
    ctx.fillStyle = isFire ? '#06b6d4' : '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 5. Destination Exit Badge (Recommended Exit)
    const endPt = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(endPt.x, endPt.y, 16 + oPulse * 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + oPulse * 0.3})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(endPt.x, endPt.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Recommended Exit Callout Box
    ctx.fillStyle = 'rgba(6, 78, 59, 0.96)';
    ctx.fillRect(endPt.x - 85, endPt.y - 32, 170, 22);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(endPt.x - 85, endPt.y - 32, 170, 22);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(`🚪 SAFEST ROUTE ➔ ${incident.recommendedExitId.toUpperCase()}`, endPt.x - 78, endPt.y - 18);

    // 5B. Secondary Safe Evacuation Egress (West Side to Exit A Dewas Porch)
    if (isFire) {
      const westPts = [
        { x: 210, y: 140 },
        { x: 180, y: 80 },
        { x: 140, y: 40 },
        { x: 80, y: 30 },
      ];
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(westPts[0].x, westPts[0].y);
      for (let i = 1; i < westPts.length; i++) ctx.lineTo(westPts[i].x, westPts[i].y);
      ctx.stroke();

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -(now * 0.04) % 18;
      ctx.beginPath();
      ctx.moveTo(westPts[0].x, westPts[0].y);
      for (let i = 1; i < westPts.length; i++) ctx.lineTo(westPts[i].x, westPts[i].y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Exit A Callout
      ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
      ctx.fillRect(100, 16, 110, 18);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.strokeRect(100, 16, 110, 18);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('🚪 WEST EGRESS ➔ EXIT A', 104, 28);
    }
  }

  // 6. Alternative Path (Dashed Amber)
  if (incident.alternativePathPoints && incident.alternativePathPoints.length > 1) {
    const aPts = incident.alternativePathPoints;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 6]);
    ctx.lineDashOffset = -(now * 0.03) % 13;
    ctx.beginPath();
    ctx.moveTo(aPts[0].x, aPts[0].y);
    for (let i = 1; i < aPts.length; i++) {
      ctx.lineTo(aPts[i].x, aPts[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
