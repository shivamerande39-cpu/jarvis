import React, { useEffect, useRef } from 'react';
import { ProtocolMode } from '../types';
import { soundEffects } from '../services/soundEffects';

interface ArcReactorCoreProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  activeProtocol: ProtocolMode;
  onCoreClick: () => void;
  outputPower: number; // e.g. 94%
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  activeProtocol,
  onCoreClick,
  outputPower,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Theme color mapping based on protocol
  const getColorPalette = () => {
    switch (activeProtocol) {
      case 'STEALTH':
        return {
          primary: '#818cf8', // Indigo
          glow: 'rgba(129, 140, 248, 0.4)',
          accent: '#c084fc',
          textColor: 'text-indigo-400',
        };
      case 'DEFENSE':
        return {
          primary: '#f97316', // Orange / Amber
          glow: 'rgba(249, 115, 22, 0.4)',
          accent: '#ef4444',
          textColor: 'text-amber-400',
        };
      case 'OVERDRIVE':
        return {
          primary: '#38bdf8', // Electric Cyan
          glow: 'rgba(56, 189, 248, 0.6)',
          accent: '#67e8f9',
          textColor: 'text-cyan-300',
        };
      case 'HOUSE_PARTY':
        return {
          primary: '#ec4899', // Pink
          glow: 'rgba(236, 72, 153, 0.4)',
          accent: '#f43f5e',
          textColor: 'text-pink-400',
        };
      case 'STANDARD':
      default:
        return {
          primary: '#00f2ff', // Stark Cyan
          glow: 'rgba(0, 242, 255, 0.4)',
          accent: '#38bdf8',
          textColor: 'text-cyan-400',
        };
    }
  };

  const palette = getColorPalette();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let pulse = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.38;

      ctx.clearRect(0, 0, width, height);

      // Speed up rotation when thinking or speaking
      const speedMultiplier = isThinking ? 2.5 : isSpeaking ? 1.8 : isListening ? 1.2 : 0.6;
      angle += 0.015 * speedMultiplier;
      pulse += isSpeaking ? 0.08 : isListening ? 0.05 : 0.02;

      const dynamicRadius = baseRadius + Math.sin(pulse) * (isSpeaking ? 7 : isListening ? 5 : 2);

      // 1. Outermost subtle radar track
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Concentric segmented outer ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      const segments = 12;
      for (let i = 0; i < segments; i++) {
        const segAngle = (i * 2 * Math.PI) / segments;
        ctx.beginPath();
        ctx.arc(0, 0, dynamicRadius * 1.08, segAngle, segAngle + (Math.PI / segments) * 1.2);
        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Outer tick marks
        const tickX = Math.cos(segAngle) * (dynamicRadius * 1.16);
        const tickY = Math.sin(segAngle) * (dynamicRadius * 1.16);
        ctx.beginPath();
        ctx.arc(tickX, tickY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = palette.primary;
        ctx.fill();
      }
      ctx.restore();

      // 3. Counter-rotating inner ring with chevron dashes
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 1.4);
      ctx.beginPath();
      ctx.arc(0, 0, dynamicRadius * 0.88, 0, Math.PI * 2);
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 8, 2, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Arc Reactor 10 Triangular Plasma Coils (Iconic Iron Man Core)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.4);
      const coils = 10;
      for (let i = 0; i < coils; i++) {
        const coilAngle = (i * 2 * Math.PI) / coils;
        ctx.save();
        ctx.rotate(coilAngle);

        // Draw electromagnetic coil block
        const coilDist = dynamicRadius * 0.58;
        ctx.fillStyle = isThinking
          ? 'rgba(245, 158, 11, 0.7)'
          : isListening
          ? 'rgba(239, 68, 68, 0.7)'
          : palette.glow;
        ctx.fillRect(-10, -coilDist - 12, 20, 10);

        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-10, -coilDist - 12, 20, 10);

        // Core line from coil to center
        ctx.beginPath();
        ctx.moveTo(0, -coilDist + 2);
        ctx.lineTo(0, -dynamicRadius * 0.32);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();

      // 5. Central Glowing Plasma Sphere
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        dynamicRadius * 0.45
      );
      glowGrad.addColorStop(0, '#ffffff');
      glowGrad.addColorStop(0.3, palette.primary);
      glowGrad.addColorStop(0.8, palette.glow);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Inner Core Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 0.28, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Audio waveform pulses if speaking or listening
      if (isSpeaking || isListening) {
        ctx.beginPath();
        const waveRadius = dynamicRadius * (0.35 + Math.sin(pulse * 3) * 0.15);
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isListening ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isSpeaking, isThinking, activeProtocol, palette]);

  const handleCoreActivation = () => {
    soundEffects.playHudClick();
    onCoreClick();
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer Hologram Ring Decorator */}
      <div 
        id="jarvis-arc-core"
        onClick={handleCoreActivation}
        className="group relative cursor-pointer flex items-center justify-center transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        title="Click to interact with J.A.R.V.I.S. Core"
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]"
        />

        {/* Center Overlay Status Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-mono-tech tracking-widest text-cyan-200/60 uppercase">
            STARK IND.
          </span>
          <span className={`text-sm md:text-base font-orbitron font-extrabold tracking-wider ${palette.textColor} hud-glow`}>
            {isThinking
              ? 'CALCULATING'
              : isSpeaking
              ? 'TRANSMITTING'
              : isListening
              ? 'LISTENING'
              : 'J.A.R.V.I.S.'}
          </span>
          <span className="text-[11px] font-mono-tech tracking-wider text-cyan-300/80">
            {outputPower}% CORE
          </span>
        </div>

        {/* Subtle hover prompt ring */}
        <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono-tech tracking-wider text-cyan-300 opacity-80 group-hover:opacity-100 transition-opacity">
          CLICK CORE TO ACTIVATE
        </div>
      </div>
    </div>
  );
};
