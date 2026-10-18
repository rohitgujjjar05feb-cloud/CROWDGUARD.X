import React, { useEffect, useRef, useState } from 'react';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';

interface Screen1LaunchProps {
  onLaunchComplete: () => void;
  selectedVenue: string;
  onVenueChange: (venue: string) => void;
}

export const Screen1Launch: React.FC<Screen1LaunchProps> = ({
  onLaunchComplete,
  selectedVenue,
  onVenueChange,
}) => {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stageText, setStageText] = useState<string>('System Armed • Ready to Initialize');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background animated crowd canvas under searchlights
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = [];
    const count = 160;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.45 + Math.random() * (canvas.height * 0.55),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: 0.2 + Math.random() * 0.6,
        size: 1.2 + Math.random() * 2.2,
      });
    }

    let time = 0;
    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep dark arena atmosphere
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(0.5, '#070f22');
      bgGrad.addColorStop(1, '#020409');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sweeping stadium searchlights
      ctx.save();
      const lightX = canvas.width / 2 + Math.sin(time * 0.5) * (canvas.width * 0.35);
      const lightGrad = ctx.createRadialGradient(
        lightX,
        canvas.height * 0.12,
        10,
        lightX,
        canvas.height * 0.7,
        canvas.width * 0.5
      );
      lightGrad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
      lightGrad.addColorStop(0.45, 'rgba(37, 99, 235, 0.08)');
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Crowd skyline
      ctx.fillStyle = 'rgba(4, 7, 18, 0.88)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 30) {
        const h = canvas.height * 0.78 + Math.sin(x * 0.02 + time) * 12 + Math.cos(x * 0.05) * 8;
        ctx.lineTo(x, h);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Render glowing crowd particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < canvas.height * 0.45) p.y = canvas.height;
        if (p.y > canvas.height) p.y = canvas.height * 0.45;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * (0.6 + Math.sin(time + p.x) * 0.3)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Smooth loading progression that triggers upon clicking Start Button
  useEffect(() => {
    if (!hasStarted) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;

        if (next < 25) {
          setStageText('Connecting IoT CCTV Sensors & LiDAR Ingress Streams...');
        } else if (next < 50) {
          setStageText('Constructing 3D Spatial Digital Twin & Corridor Network...');
        } else if (next < 75) {
          setStageText('Calibrating Helbing Social Force Dynamic Fluid Physics...');
        } else if (next < 95) {
          setStageText('Running XGBoost Multi-Horizon Predictive Analysis...');
        } else {
          setStageText('All Neural Cores Armed • Launching Command Platform...');
        }

        if (next >= 100) {
          clearInterval(timer);
          soundManager.playSuccess();
          confetti({
            particleCount: 110,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#10b981', '#3b82f6', '#facc15'],
          });
          setTimeout(() => {
            onLaunchComplete();
          }, 650);
          return 100;
        }
        return next;
      });
    }, 28);

    return () => clearInterval(timer);
  }, [hasStarted, onLaunchComplete]);

  const handleStartSimulation = () => {
    soundManager.playAlert();
    setHasStarted(true);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-8 overflow-hidden select-none">
      {/* Background Interactive Crowd Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Cyber Grid & Laser Scanline Overlay */}
      <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-scanline pointer-events-none" />

      {/* Top Hackathon Banner in Times New Roman */}
      <div className="relative z-10 w-full flex items-center justify-between max-w-6xl mx-auto border-b border-cyan-800/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Shield className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="font-tnr text-xl tracking-wider text-white font-bold">
              SISTec Innovation Hackathon 2026
            </div>
            <div className="text-[11px] font-mono text-cyan-400">
              NovaTech • Problem Statement ID: <span className="text-white font-bold">IS-15</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLaunchComplete}
          className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 text-xs sm:text-sm font-semibold transition-all cursor-pointer font-tnr"
        >
          Direct to Dashboard →
        </button>
      </div>

      {/* Center Hero: Project Name, Motto, Much Bigger 2 Lines, and Impressive Start Button / Loading Bar */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto my-auto py-4">
        {/* Glowing Shield Crest */}
        <div className="relative mb-5">
          <div className="absolute -inset-7 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-2xl opacity-50 animate-pulse-slow" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-[#0c243f] to-[#050e1b] border-2 border-cyan-400/90 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.7)]">
            <Shield className="w-14 h-14 sm:w-16 sm:h-16 text-cyan-300 drop-shadow-[0_0_15px_#38bdf8]" />
          </div>
        </div>

        {/* Project Name (Times New Roman) */}
        <h1 className="font-tnr text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-2 leading-none">
          CROWDGUARD <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.85)]">X</span>
        </h1>

        {/* Motto (Times New Roman) */}
        <p className="font-tnr text-xl sm:text-2xl md:text-3xl text-cyan-200 tracking-[0.24em] font-bold uppercase mb-4 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
          PREDICT • SIMULATE • PROTECT
        </p>

        {/* Two Lines Description — Substantially BIGGER, Bold & Highly Legible */}
        <div className="max-w-3xl mb-7 space-y-1.5 px-4">
          <p className="font-tnr text-xl sm:text-2xl md:text-3xl text-white font-extrabold tracking-wide leading-snug drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            AI-Powered Crowd Mobility Intelligence & Digital Twin Platform
          </p>
          <p className="font-tnr text-base sm:text-lg md:text-xl text-cyan-300 font-semibold tracking-normal leading-relaxed">
            Predictive Spatial Simulation and Counter-Factual Incident Decision Support for Mass Gatherings
          </p>
        </div>

        {/* Venue Selection Selector on Launch Screen */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2">
          <span className="text-xs text-slate-400 font-tnr font-semibold uppercase tracking-wider mr-1">
            Target Venue:
          </span>
          {[
            { id: 'kashi-temple', label: '🛕 Kashi Vishwanath (Temple)' },
            { id: 'kumbh-2025', label: '🌊 Maha Kumbh (Riverside)' },
            { id: 'bhopal-junction', label: '🚆 Bhopal Junction (Railway)' },
            { id: 'grand-stadium', label: '🏟 Grand Arena (Stadium)' },
            { id: 'horizon-fest', label: '⚡ Horizon Fest (Festival)' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => {
                onVenueChange(v.id);
                soundManager.playBlip();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                selectedVenue === v.id
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Dynamic Launch Controls: Big Impressive Start Button vs Active Loading Progress */}
        {!hasStarted ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleStartSimulation}
              className="group relative flex items-center justify-center gap-4 px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base sm:text-xl shadow-[0_0_40px_rgba(16,185,129,0.7)] hover:shadow-[0_0_60px_rgba(6,182,212,0.9)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer font-tnr uppercase tracking-wider"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
                <Play className="w-6 h-6 text-slate-950 fill-slate-950" />
              </div>
              <div className="text-left">
                <div className="leading-tight">START DIGITAL TWIN & SIMULATION ➔</div>
                <div className="text-[11px] font-mono text-slate-900/80 tracking-normal font-bold lowercase">
                  Click to initialize physics engine & telemetry dashboard
                </div>
              </div>
            </button>
            <span className="text-[11px] text-cyan-300/70 font-mono">
              Ready for verification • SISTec Hackathon IS-15
            </span>
          </div>
        ) : (
          <div className="w-full max-w-lg bg-slate-900/95 border border-cyan-500/60 rounded-2xl p-5 shadow-[0_0_45px_rgba(6,182,212,0.4)] backdrop-blur-xl mb-5 text-left animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center text-xs sm:text-sm font-mono mb-2.5">
              <span className="text-slate-200 flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>{stageText}</span>
              </span>
              <span className="text-cyan-400 font-bold text-base font-mono">{progress}%</span>
            </div>

            <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-0.5 border border-cyan-900/90 shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 h-full rounded-full transition-all duration-150 shadow-[0_0_20px_#06b6d4]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
              <span>Status: Initializing</span>
              <span className="text-emerald-400 font-bold">Real-Time Core</span>
            </div>
          </div>
        )}
      </div>

      {/* 4 Bottom Readiness Indicators — Elevated from bottom, Much BIGGER & Highly Prominent */}
      <div className="relative z-10 w-full max-w-6xl mx-auto mb-6 sm:mb-8 pt-4 border-t border-cyan-900/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/85 border border-emerald-500/50 shadow-lg backdrop-blur-md hover:border-emerald-400 transition-all">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-tnr text-sm sm:text-base font-black text-white">Temple Venue Active</div>
              <div className="text-[11px] text-slate-300 font-medium">Kashi Corridor & Sacred Geometry</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/85 border border-emerald-500/50 shadow-lg backdrop-blur-md hover:border-emerald-400 transition-all">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-tnr text-sm sm:text-base font-black text-white">Prediction Engine Ready</div>
              <div className="text-[11px] text-slate-300 font-medium">XGBoost Multi-Horizon Online</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/85 border border-emerald-500/50 shadow-lg backdrop-blur-md hover:border-emerald-400 transition-all">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-tnr text-sm sm:text-base font-black text-white">Simulation Engine Ready</div>
              <div className="text-[11px] text-slate-300 font-medium">Social Force Physics 60fps</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/85 border border-emerald-500/50 shadow-lg backdrop-blur-md hover:border-emerald-400 transition-all">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-tnr text-sm sm:text-base font-black text-white">Decision Copilot Ready</div>
              <div className="text-[11px] text-slate-300 font-medium">Autonomous Incident Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
