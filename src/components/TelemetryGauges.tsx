import React from 'react';
import { Activity, Cpu, ShieldCheck, Thermometer, Radio, Zap, RefreshCw } from 'lucide-react';
import { SystemTelemetry, SubsystemStatus } from '../types';

interface TelemetryGaugesProps {
  telemetry: SystemTelemetry;
  subsystems: SubsystemStatus[];
  onRunDiagnostics: () => void;
  isRunningDiagnostics: boolean;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({
  telemetry,
  subsystems,
  onRunDiagnostics,
  isRunningDiagnostics,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Telemetry Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Arc Core Power */}
        <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-2.5 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-cyan-400/70 mb-1">
            <span className="font-mono-tech flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              ARC CORE
            </span>
            <span className="text-[10px] font-mono-tech text-cyan-300/60">GW-3.2</span>
          </div>
          <div className="text-xl font-orbitron font-bold text-cyan-300 tracking-tight">
            {telemetry.arcReactorOutput.toFixed(1)}%
          </div>
          <div className="w-full bg-cyan-950/60 h-1.5 rounded-full mt-2 overflow-hidden border border-cyan-800/40">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#38bdf8]"
              style={{ width: `${Math.min(100, telemetry.arcReactorOutput)}%` }}
            />
          </div>
        </div>

        {/* Quantum Neural Load */}
        <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-2.5 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-cyan-400/70 mb-1">
            <span className="font-mono-tech flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              NEURAL LOAD
            </span>
            <span className="text-[10px] font-mono-tech text-cyan-300/60">Q-BIT</span>
          </div>
          <div className="text-xl font-orbitron font-bold text-sky-300 tracking-tight">
            {telemetry.quantumComputeLoad.toFixed(0)}%
          </div>
          <div className="w-full bg-cyan-950/60 h-1.5 rounded-full mt-2 overflow-hidden border border-cyan-800/40">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#38bdf8]"
              style={{ width: `${Math.min(100, telemetry.quantumComputeLoad)}%` }}
            />
          </div>
        </div>

        {/* Core Temperature */}
        <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-2.5 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-cyan-400/70 mb-1">
            <span className="font-mono-tech flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              CORE TEMP
            </span>
            <span className="text-[10px] font-mono-tech text-cyan-300/60">THERMAL</span>
          </div>
          <div className="text-xl font-orbitron font-bold text-amber-300 tracking-tight">
            {telemetry.coreTemperature.toFixed(1)}°C
          </div>
          <div className="w-full bg-cyan-950/60 h-1.5 rounded-full mt-2 overflow-hidden border border-cyan-800/40">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#f59e0b]"
              style={{ width: `${Math.min(100, (telemetry.coreTemperature / 80) * 100)}%` }}
            />
          </div>
        </div>

        {/* Shield Integrity */}
        <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-2.5 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs text-cyan-400/70 mb-1">
            <span className="font-mono-tech flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              DEFENSE
            </span>
            <span className="text-[10px] font-mono-tech text-cyan-300/60">FORCE</span>
          </div>
          <div className="text-xl font-orbitron font-bold text-emerald-300 tracking-tight">
            {telemetry.shieldEfficiency.toFixed(0)}%
          </div>
          <div className="w-full bg-cyan-950/60 h-1.5 rounded-full mt-2 overflow-hidden border border-cyan-800/40">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#34d399]"
              style={{ width: `${Math.min(100, telemetry.shieldEfficiency)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subsystem Health Grid with Diagnostics Trigger */}
      <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3 border-b border-cyan-900/50 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-200">
              STARK SUBSYSTEM TELEMETRY
            </h3>
          </div>
          <button
            id="run-diagnostics-btn"
            onClick={onRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono-tech tracking-wider rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostics ? 'animate-spin text-amber-400' : ''}`} />
            {isRunningDiagnostics ? 'SCANNING...' : 'RUN SWEEP'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {subsystems.map((sub) => (
            <div
              key={sub.code}
              className="bg-black/40 border border-cyan-900/40 rounded p-2 flex flex-col justify-between hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center justify-between text-cyan-300 font-mono-tech">
                <span className="truncate pr-1">{sub.name}</span>
                <span className="text-[10px] text-cyan-400/80 px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/40">
                  {sub.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-cyan-400/60 font-mono-tech">
                <span className="truncate">{sub.detail}</span>
                <span className="text-cyan-200 font-bold ml-1">{sub.value}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Global Satellite Lock Banner */}
        <div className="mt-3 pt-2 border-t border-cyan-900/40 flex items-center justify-between text-[11px] font-mono-tech text-cyan-400/70">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>ORBITAL UPLINK: {telemetry.uplinkStatus}</span>
          </div>
          <div className="text-cyan-300/80">
            LATENCY: <span className="text-cyan-200">{telemetry.networkLatency} ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
