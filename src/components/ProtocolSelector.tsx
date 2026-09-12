import React from 'react';
import { Shield, EyeOff, Zap, Users, ShieldAlert } from 'lucide-react';
import { ProtocolMode } from '../types';
import { soundEffects } from '../services/soundEffects';

interface ProtocolSelectorProps {
  activeProtocol: ProtocolMode;
  onSelectProtocol: (protocol: ProtocolMode) => void;
}

export const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({
  activeProtocol,
  onSelectProtocol,
}) => {
  const protocols: Array<{
    id: ProtocolMode;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    activeClasses: string;
  }> = [
    {
      id: 'STANDARD',
      label: 'STANDARD',
      description: 'Nominal operational state & balanced telemetry',
      icon: Shield,
      accentColor: 'text-cyan-400',
      activeClasses: 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.25)]',
    },
    {
      id: 'STEALTH',
      label: 'STEALTH',
      description: 'Thermal suppression & minimized EM radar footprint',
      icon: EyeOff,
      accentColor: 'text-indigo-400',
      activeClasses: 'border-indigo-400 bg-indigo-950/40 text-indigo-200 shadow-[0_0_15px_rgba(129,140,248,0.25)]',
    },
    {
      id: 'DEFENSE',
      label: 'DEFENSE MATRIX',
      description: 'Perimeter energy shields & repulsor capacitors armed',
      icon: ShieldAlert,
      accentColor: 'text-amber-400',
      activeClasses: 'border-amber-400 bg-amber-950/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    },
    {
      id: 'OVERDRIVE',
      label: 'OVERDRIVE',
      description: '100% Arc Reactor output & boosted cognitive throughput',
      icon: Zap,
      accentColor: 'text-sky-300',
      activeClasses: 'border-sky-300 bg-sky-950/40 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.35)]',
    },
    {
      id: 'HOUSE_PARTY',
      label: 'HOUSE PARTY',
      description: 'Autonomous armor legion coordination protocol',
      icon: Users,
      accentColor: 'text-pink-400',
      activeClasses: 'border-pink-400 bg-pink-950/40 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.25)]',
    },
  ];

  const handleSelect = (mode: ProtocolMode) => {
    soundEffects.playAlertTone();
    onSelectProtocol(mode);
  };

  return (
    <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-900/40">
        <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-200">
          STARK PROTOCOL OVERRIDE
        </h3>
        <span className="text-[10px] font-mono-tech text-cyan-400/70">
          STATUS: <span className="text-cyan-300 font-bold">{activeProtocol}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {protocols.map((proto) => {
          const Icon = proto.icon;
          const isActive = activeProtocol === proto.id;

          return (
            <button
              key={proto.id}
              id={`protocol-btn-${proto.id.toLowerCase()}`}
              onClick={() => handleSelect(proto.id)}
              className={`p-2 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isActive
                  ? proto.activeClasses
                  : 'border-cyan-900/40 bg-black/40 text-cyan-400/60 hover:border-cyan-600/40 hover:text-cyan-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-4 h-4 ${isActive ? proto.accentColor : 'text-cyan-600'}`} />
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <div>
                <div className="font-orbitron text-[11px] font-bold tracking-wide">
                  {proto.label}
                </div>
                <div className="text-[9px] font-mono-tech opacity-70 line-clamp-1 mt-0.5">
                  {proto.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
