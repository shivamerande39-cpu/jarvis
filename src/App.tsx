import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Cpu, 
  Settings, 
  Terminal, 
  Sliders, 
  RefreshCw, 
  Bell, 
  Maximize2 
} from 'lucide-react';
import { 
  ProtocolMode, 
  SystemTelemetry, 
  SubsystemStatus, 
  Directive, 
  DirectivePriority, 
  ChatMessage, 
  VoiceSettings 
} from './types';
import { ArcReactorCore } from './components/ArcReactorCore';
import { TelemetryGauges } from './components/TelemetryGauges';
import { ProtocolSelector } from './components/ProtocolSelector';
import { DirectiveManager } from './components/DirectiveManager';
import { CommandConsole } from './components/CommandConsole';
import { GlobalMonitor } from './components/GlobalMonitor';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { voiceAssistant } from './services/voiceAssistant';
import { soundEffects } from './services/soundEffects';

export default function App() {
  // Protocol State
  const [activeProtocol, setActiveProtocol] = useState<ProtocolMode>('STANDARD');

  // Telemetry State
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    arcReactorOutput: 96.8,
    coreTemperature: 36.4,
    quantumComputeLoad: 24.0,
    memoryIntegrity: 99.4,
    neuralSyncRate: 98.2,
    shieldEfficiency: 100.0,
    networkLatency: 12,
    uplinkStatus: 'SECURED',
    activeProtocol: 'STANDARD',
    uptimeSeconds: 1420,
  });

  // Subsystems
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>([
    { name: 'Arc Reactor Core', code: 'ARC-01', value: 98, status: 'OPTIMAL', detail: '3.2 GW sustained plasma' },
    { name: 'Repulsor Arrays', code: 'REP-04', value: 96, status: 'OPTIMAL', detail: 'Capacitor cycle nominal' },
    { name: 'Neural Synapse Interface', code: 'NEUR-7', value: 99, status: 'OPTIMAL', detail: 'Synaptic latency 0.3ms' },
    { name: 'Nanotech Weave', code: 'NANO-X', value: 94, status: 'OPTIMAL', detail: 'Tensile matrix stabilized' },
    { name: 'Satellite Uplink', code: 'SAT-09', value: 97, status: 'OPTIMAL', detail: 'Orbital lock steady' },
    { name: 'Thermal Dissipation', code: 'THERM-2', value: 92, status: 'OPTIMAL', detail: 'Liquid N2 cooling active' },
  ]);

  // Directives State with LocalStorage Persistence
  const [directives, setDirectives] = useState<Directive[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jarvis_directives');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'dir-1',
        title: 'Calibrate Mark 85 repulsor capacitors and flight stabilizers',
        category: 'MISSION',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        createdAt: '10:42 AM',
      },
      {
        id: 'dir-2',
        title: 'Run thermal stress analysis on vibranium-titanium composite',
        category: 'DIAGNOSTIC',
        priority: 'HIGH',
        status: 'PENDING',
        createdAt: '11:15 AM',
      },
      {
        id: 'dir-3',
        title: 'Synchronize orbital tracking lock with Stark-Sat-09 constellation',
        category: 'SECURITY',
        priority: 'NORMAL',
        status: 'COMPLETED',
        createdAt: '09:00 AM',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('jarvis_directives', JSON.stringify(directives));
  }, [directives]);

  // Voice Settings State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jarvis_voice_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      autoSpeak: true,
      voiceRate: 1.05,
      voicePitch: 0.95,
      selectedVoiceURI: null,
      soundEffects: true,
      continuousListening: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('jarvis_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  // Chat Backlog State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'jarvis',
      content: 'At your service, Sir. J.A.R.V.I.S. matrix online. All primary subsystems and Arc Reactor telemetry are functioning within nominal parameters.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Activity Flags
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'directives' | 'satellite'>('console');
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Clock & Telemetry subtle life-pulse
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subtle telemetry oscillation for alive feeling
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        arcReactorOutput: +(95 + Math.sin(Date.now() / 3000) * 3).toFixed(1),
        quantumComputeLoad: +(22 + Math.cos(Date.now() / 4000) * 6).toFixed(0),
        coreTemperature: +(36.2 + Math.sin(Date.now() / 5000) * 1.2).toFixed(1),
        networkLatency: 10 + Math.floor(Math.random() * 5),
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Vocalize a message with JARVIS voice
  const speakMessage = useCallback((text: string) => {
    soundEffects.playWakeChime();
    voiceAssistant.speak(text, {
      rate: voiceSettings.voiceRate,
      pitch: voiceSettings.voicePitch,
      voiceURI: voiceSettings.selectedVoiceURI,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [voiceSettings]);

  // Handle User Input Submission
  const handleSendMessage = async (userPrompt: string, isVoice: boolean = false) => {
    if (!userPrompt.trim() || isThinking) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp,
      isVoiceInput: isVoice,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    setInterimTranscript('');

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          history: messages.slice(-6),
          telemetry,
          protocol: activeProtocol,
        }),
      });

      if (!res.ok) {
        throw new Error('Neural relay request failed');
      }

      const data = await res.json();
      const jarvisReply = data.response || 'Right away, Sir.';

      // Process any detected actions
      if (data.action) {
        if (data.action.type === 'PROTOCOL_CHANGED' && data.action.payload) {
          setActiveProtocol(data.action.payload);
          soundEffects.playAlertTone();
        } else if (data.action.type === 'DIRECTIVE_ADDED' && data.action.payload) {
          const newDir: Directive = {
            id: `dir-${Date.now()}`,
            title: data.action.payload,
            category: 'MISSION',
            priority: 'HIGH',
            status: 'PENDING',
            createdAt: timestamp,
          };
          setDirectives((prev) => [newDir, ...prev]);
        } else if (data.action.type === 'DIAGNOSTIC_RUN') {
          handleRunDiagnostics();
        }
      }

      const jarvisMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        role: 'jarvis',
        content: jarvisReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: data.action,
      };

      setMessages((prev) => [...prev, jarvisMsg]);

      // Vocalize if enabled
      if (voiceSettings.autoSpeak) {
        speakMessage(jarvisReply);
      }
    } catch (err) {
      console.error('Relay error:', err);
      const fallbackReply = 'My apologies, Sir. Atmospheric telemetry interference encountered. I remain fully operational on local auxiliary matrix.';
      setMessages((prev) => [
        ...prev,
        {
          id: `jarvis-err-${Date.now()}`,
          role: 'jarvis',
          content: fallbackReply,
          timestamp,
        },
      ]);
      if (voiceSettings.autoSpeak) {
        speakMessage(fallbackReply);
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Voice Recognition Controls
  const handleStartListening = () => {
    soundEffects.playMicStart();
    setIsListening(true);
    setInterimTranscript('');

    const success = voiceAssistant.startListening({
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          setIsListening(false);
          setInterimTranscript('');
          handleSendMessage(transcript, true);
        } else {
          setInterimTranscript(transcript);
        }
      },
      onEnd: () => {
        setIsListening(false);
        setInterimTranscript('');
      },
      onError: (err) => {
        console.warn('Speech Rec Error:', err);
        setIsListening(false);
        setInterimTranscript('');
      },
    });

    if (!success) {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    voiceAssistant.stopListening();
    setIsListening(false);
    setInterimTranscript('');
  };

  // Run Full Diagnostic Sweep
  const handleRunDiagnostics = async () => {
    if (isRunningDiagnostics) return;
    setIsRunningDiagnostics(true);
    soundEffects.playDiagnosticSweep();

    try {
      const res = await fetch('/api/jarvis/diagnostics', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.subsystems) {
        setSubsystems(data.subsystems);
      }

      const summary = data.summary || 'Diagnostic completed. All Stark subsystems verified nominal.';
      setMessages((prev) => [
        ...prev,
        {
          id: `diag-${Date.now()}`,
          role: 'system',
          content: `DIAGNOSTIC SWEEP COMPLETED: ${summary}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (voiceSettings.autoSpeak) {
        speakMessage(summary);
      }
    } catch (err) {
      console.error('Diagnostic error:', err);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Directives Actions
  const handleAddDirective = (title: string, priority: DirectivePriority, category: Directive['category']) => {
    const newDir: Directive = {
      id: `dir-${Date.now()}`,
      title,
      priority,
      category,
      status: 'PENDING',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setDirectives((prev) => [newDir, ...prev]);
  };

  const handleToggleDirective = (id: string) => {
    setDirectives((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          if (nextStatus === 'COMPLETED') {
            soundEffects.playAlertTone();
          }
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  const handleDeleteDirective = (id: string) => {
    setDirectives((prev) => prev.filter((d) => d.id !== id));
  };

  // Arc Reactor Click handler: toggles voice listening or speaks greeting
  const handleArcCoreClick = () => {
    if (isListening) {
      handleStopListening();
    } else if (isSpeaking) {
      voiceAssistant.stopSpeaking();
      setIsSpeaking(false);
    } else {
      handleStartListening();
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-cyan-400 hud-grid relative flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Scanline CRT overlay effect */}
      <div className="fixed inset-0 scanlines pointer-events-none z-40 opacity-40" />

      {/* Top Holographic Navigation Header */}
      <header className="border-b border-cyan-500/30 bg-black/60 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-cyan-400 bg-cyan-950/60 flex items-center justify-center animate-pulse-glow shadow-[0_0_12px_#38bdf8]">
                <div className="w-3 h-3 rounded-full bg-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-cyan-200 hud-glow">
                  J.A.R.V.I.S.
                </h1>
                <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  MARK-X OS
                </span>
              </div>
              <div className="text-[10px] font-mono-tech text-cyan-400/60 hidden sm:block">
                STARK INDUSTRIES • PERSONAL AI ASSISTANT MATRIX
              </div>
            </div>
          </div>

          {/* Center Protocol & Security Status */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono-tech">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-800/60 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PROTOCOL: {activeProtocol}</span>
            </div>
            <div className="text-cyan-400/80">
              SYS-TIME: <span className="text-cyan-200 font-bold">{currentTimeStr}</span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Audio Settings Modal Trigger */}
            <button
              id="audio-settings-btn"
              onClick={() => {
                soundEffects.playHudClick();
                setIsVoiceModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Acoustic Voice Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">VOICE CALIBRATION</span>
            </button>

            {/* Quick Diagnostic Trigger */}
            <button
              id="header-diagnostic-btn"
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="p-1.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-colors disabled:opacity-50 cursor-pointer"
              title="Run Subsystem Sweep"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostics ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Holographic HUD Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4 z-10">
        {/* Top Protocol Switcher */}
        <ProtocolSelector
          activeProtocol={activeProtocol}
          onSelectProtocol={(p) => {
            setActiveProtocol(p);
            setMessages((prev) => [
              ...prev,
              {
                id: `proto-${Date.now()}`,
                role: 'system',
                content: `STARK PROTOCOL OVERRIDE: ${p} engaged. Recalibrating defense matrix and core plasma routing.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            if (voiceSettings.autoSpeak) {
              speakMessage(`${p} protocol engaged, Sir.`);
            }
          }}
        />

        {/* Primary Interactive Split: Arc Reactor & Telemetry (Left) | Command Console & Directives (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (5 Cols on LG): Arc Reactor Core + Telemetry Gauges */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Arc Reactor Core Hologram Container */}
            <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-2 left-3 text-[10px] font-mono-tech text-cyan-500/70 tracking-wider">
                QUANTUM FUSION CORE • MARK-L
              </div>
              <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] font-mono-tech text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </div>

              <ArcReactorCore
                isListening={isListening}
                isSpeaking={isSpeaking}
                isThinking={isThinking}
                activeProtocol={activeProtocol}
                onCoreClick={handleArcCoreClick}
                outputPower={telemetry.arcReactorOutput}
              />

              {/* Status readout bar under core */}
              <div className="w-full mt-3 pt-2 border-t border-cyan-900/40 flex items-center justify-between text-[11px] font-mono-tech text-cyan-400/80">
                <span>ACOUSTIC LINK: {isSpeaking ? 'TRANSMITTING' : isListening ? 'CAPTURING' : 'STANDBY'}</span>
                <span className="text-cyan-300">VIBRANIUM-TI SHIELD</span>
              </div>
            </div>

            {/* Telemetry Stat Blocks & Subsystems */}
            <TelemetryGauges
              telemetry={telemetry}
              subsystems={subsystems}
              onRunDiagnostics={handleRunDiagnostics}
              isRunningDiagnostics={isRunningDiagnostics}
            />
          </div>

          {/* Right Column (7 Cols on LG): Command Console + Directives / Tabs */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Tabs for Console / Directives / Satellite Network on smaller screens */}
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-1">
              <div className="flex items-center gap-2">
                <button
                  id="tab-console"
                  onClick={() => {
                    soundEffects.playHudClick();
                    setActiveTab('console');
                  }}
                  className={`px-3 py-1 text-xs font-orbitron font-bold tracking-wider rounded-t border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'console'
                      ? 'border-cyan-400 text-cyan-200 bg-cyan-950/40'
                      : 'border-transparent text-cyan-600 hover:text-cyan-400'
                  }`}
                >
                  COMMAND CONSOLE
                </button>

                <button
                  id="tab-directives"
                  onClick={() => {
                    soundEffects.playHudClick();
                    setActiveTab('directives');
                  }}
                  className={`px-3 py-1 text-xs font-orbitron font-bold tracking-wider rounded-t border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'directives'
                      ? 'border-cyan-400 text-cyan-200 bg-cyan-950/40'
                      : 'border-transparent text-cyan-600 hover:text-cyan-400'
                  }`}
                >
                  <span>DIRECTIVES</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300">
                    {directives.filter((d) => d.status !== 'COMPLETED').length}
                  </span>
                </button>

                <button
                  id="tab-satellite"
                  onClick={() => {
                    soundEffects.playHudClick();
                    setActiveTab('satellite');
                  }}
                  className={`px-3 py-1 text-xs font-orbitron font-bold tracking-wider rounded-t border-b-2 transition-colors cursor-pointer hidden sm:block ${
                    activeTab === 'satellite'
                      ? 'border-cyan-400 text-cyan-200 bg-cyan-950/40'
                      : 'border-transparent text-cyan-600 hover:text-cyan-400'
                  }`}
                >
                  ORBITAL RELAYS
                </button>
              </div>

              <div className="text-[10px] font-mono-tech text-cyan-500/70 hidden sm:block">
                GEMINI 3.8 FLASH NEURAL CORE
              </div>
            </div>

            {/* Tab Body */}
            {activeTab === 'console' && (
              <CommandConsole
                messages={messages}
                onSendMessage={handleSendMessage}
                isListening={isListening}
                isThinking={isThinking}
                isSpeaking={isSpeaking}
                onStartListening={handleStartListening}
                onStopListening={handleStopListening}
                onSpeakMessage={speakMessage}
                interimTranscript={interimTranscript}
                soundEffectsEnabled={voiceSettings.soundEffects}
                onToggleSoundEffects={() => {
                  const next = !voiceSettings.soundEffects;
                  soundEffects.setEnabled(next);
                  setVoiceSettings((prev) => ({ ...prev, soundEffects: next }));
                }}
                autoSpeak={voiceSettings.autoSpeak}
                onToggleAutoSpeak={() => {
                  soundEffects.playHudClick();
                  setVoiceSettings((prev) => ({ ...prev, autoSpeak: !prev.autoSpeak }));
                }}
                onClearConsole={() => {
                  soundEffects.playHudClick();
                  setMessages([
                    {
                      id: `msg-clr-${Date.now()}`,
                      role: 'system',
                      content: 'Console backlog flushed. J.A.R.V.I.S. neural buffer cleared.',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
              />
            )}

            {activeTab === 'directives' && (
              <DirectiveManager
                directives={directives}
                onAddDirective={handleAddDirective}
                onToggleStatus={handleToggleDirective}
                onDeleteDirective={handleDeleteDirective}
              />
            )}

            {activeTab === 'satellite' && (
              <GlobalMonitor
                onSelectFacility={(fac) => {
                  const query = `Provide an atmospheric and security readout for ${fac.name} in ${fac.location}.`;
                  setActiveTab('console');
                  handleSendMessage(query, false);
                }}
              />
            )}

            {/* When viewing console, show Global Monitor or Directives underneath if space permits */}
            {activeTab === 'console' && (
              <div className="hidden md:block">
                <DirectiveManager
                  directives={directives}
                  onAddDirective={handleAddDirective}
                  onToggleStatus={handleToggleDirective}
                  onDeleteDirective={handleDeleteDirective}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Full-Width Global Outposts Banner */}
        <div className="mt-2">
          <GlobalMonitor
            onSelectFacility={(fac) => {
              const query = `Provide an operational status report for Stark ${fac.name} at ${fac.location}.`;
              setActiveTab('console');
              handleSendMessage(query, false);
            }}
          />
        </div>
      </main>

      {/* Footer System Telemetry Status Bar */}
      <footer className="border-t border-cyan-900/40 bg-black/80 px-4 py-2 text-[11px] font-mono-tech text-cyan-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">STARK INDUSTRIES AI SYSTEM</span>
          <span>•</span>
          <span>ARCHITECTURE: GEMINI 3.8 FLASH + WEBAUDIO HUD</span>
          <span>•</span>
          <span className="text-emerald-400">STATUS: NOMINAL</span>
        </div>
        <div className="flex items-center gap-4 text-cyan-400/70">
          <span>UPTIME: {Math.floor(telemetry.uptimeSeconds / 60)}m {telemetry.uptimeSeconds % 60}s</span>
          <span>ENCRYPTION: QUANTUM 4096-BIT</span>
        </div>
      </footer>

      {/* Voice Calibration Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={(newSettings) => setVoiceSettings((prev) => ({ ...prev, ...newSettings }))}
      />
    </div>
  );
}
