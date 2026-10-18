import React, { useState } from 'react';
import {
  Bot,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Sparkles,
  FileText,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { VenueData, ScreenId } from '../../types';

interface Screen8CopilotProps {
  venueData: VenueData;
  onApplySuggestion: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen8Copilot: React.FC<Screen8CopilotProps> = ({
  venueData,
  onApplySuggestion,
  onNavigate,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<
    { sender: 'copilot' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'copilot',
      text: 'Telemetry feeds processed across all 5 gates. Zone B density is critical at 81%. Simulation indicates closing Gate G2 and rerouting through Gate G3 yields the safest pedestrian flux.',
      time: '12:04 PM',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setChatInput('');

    // AI Copilot context-aware response
    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();
      if (lower.includes('gate 4') || lower.includes('gate 5') || lower.includes('exit')) {
        reply =
          'Gate G4 and South Pier exits currently have 39% reserve discharge bandwidth. Opening auxiliary barricades at Gate G4 will accelerate Zone B dispersal by an extra 4.2 minutes.';
      } else if (lower.includes('staff') || lower.includes('police') || lower.includes('security')) {
        reply =
          'Dispatch recommendation: 12 marshals to Gate G2 barrier line to handle ingress holding; 8 guide volunteers along East Bypass Corridor to direct flow toward Gate G3.';
      } else if (lower.includes('announcement') || lower.includes('speaker') || lower.includes('pa')) {
        reply =
          'PA Broadcast draft: "Attention respected pilgrims: Gate G2 is undergoing temporary maintenance. Please proceed along the illuminated East Promenade towards Gate G3 for direct ghat access."';
      } else {
        reply =
          'I have analyzed the scenario with our Social Force prediction engine. Diverting the primary inflow away from Gate G2 avoids critical density crush and reduces cascade risk by 62%.';
      }
      setMessages((prev) => [...prev, { sender: 'copilot', text: reply, time: now }]);
    }, 600);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Screen Title Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-full">
            8. AI Decision Copilot
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Autonomous Operational Intelligence & Incident Copilot
          </span>
        </div>
        <div className="text-xs font-mono text-cyan-300">
          Venue: {venueData.name}
        </div>
      </div>

      {/* Main Grid: Copilot Recommendation (Left) + Why Cards (Right) (matching image screen 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Copilot Card & Action Buttons */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/80 border border-cyan-900/60 rounded-xl p-6 shadow-xl backdrop-blur-sm">
            {/* Bot Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <Bot className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>AI Decision Copilot</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    ANALYSIS VERIFIED
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Here's my analysis based on current data and simulation results:
                </div>
              </div>
            </div>

            {/* Recommended Action Card (matching image screen 8) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 shadow-inner mb-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Recommended Action</span>
              </div>

              <div className="space-y-2 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Close Gate G2 temporarily</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Redirect crowd through Gate G3</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Deploy additional staff in Zone B</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>This can reduce congestion risk by 62% in the next 10 minutes.</span>
              </div>
            </div>

            {/* Action Buttons (matching image screen 8) */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onApplySuggestion}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <span>Apply Suggestion</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => alert('Incident Assessment Report generated with Helbing Pedestrian Dynamics Telemetry.')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>View Detailed Report</span>
              </button>
            </div>
          </div>

          {/* Interactive Chat Console */}
          <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask Copilot Custom Incident Queries</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-2 mb-3 pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg text-xs ${
                    m.sender === 'copilot'
                      ? 'bg-slate-950/70 border border-cyan-900/40 text-slate-300'
                      : 'bg-cyan-950/50 border border-cyan-600/40 text-cyan-100 ml-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-cyan-300">
                      {m.sender === 'copilot' ? '🤖 Decision Copilot' : '👤 Incident Commander'}
                    </span>
                    <span>{m.time}</span>
                  </div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask e.g. 'How many staff at Gate 2?', 'Draft loudspeaker advisory'..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: "Why?" Reasoning Breakdown Cards (matching image screen 8) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/80 border border-cyan-900/50 rounded-xl p-5 shadow-lg backdrop-blur-sm">
            <div className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Why?</span>
            </div>

            <div className="space-y-3">
              {/* Reason 1 */}
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-amber-500/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Zone B density is rising (81%)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pedestrian influx at Gate G2 creates a shockwave condition where exit clearance lags ingress by 48%.
                </p>
              </div>

              {/* Reason 2 */}
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-emerald-500/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulation shows better flow with Gate G2 closed</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Closing G2 reduces Zone B density from 81% down to 57%, restoring pedestrian velocity to 1.2 m/s.
                </p>
              </div>

              {/* Reason 3 */}
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-emerald-500/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Safer route identified via Gate G3</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  East Bypass Corridor maintains 54% unused capacity, providing a wide unobstructed passage to south ghats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
