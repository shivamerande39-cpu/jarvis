import React from 'react';
import { X, Volume2, Sliders, Mic } from 'lucide-react';
import { VoiceSettings } from '../types';
import { voiceAssistant } from '../services/voiceAssistant';
import { soundEffects } from '../services/soundEffects';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const voices = voiceAssistant.getVoices();

  const handleTestVoice = () => {
    soundEffects.playWakeChime();
    voiceAssistant.speak(
      'At your service, Sir. Audio synthesis parameters have been recalibrated to optimal acoustic levels.',
      {
        rate: settings.voiceRate,
        pitch: settings.voicePitch,
        voiceURI: settings.selectedVoiceURI,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-950 border border-cyan-500/50 rounded-xl p-5 w-full max-w-md shadow-[0_0_30px_rgba(56,189,248,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-orbitron text-sm font-bold tracking-wider text-cyan-200">
              AUDIO & VOCAL SYNTHESIS
            </h3>
          </div>
          <button
            onClick={() => {
              soundEffects.playHudClick();
              onClose();
            }}
            className="text-cyan-500 hover:text-cyan-300 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono-tech">
          {/* Voice Selection */}
          <div>
            <label className="block text-cyan-300 font-bold mb-1">
              ACOUSTIC PROFILE (VOICE)
            </label>
            <select
              value={settings.selectedVoiceURI || ''}
              onChange={(e) => onUpdateSettings({ selectedVoiceURI: e.target.value })}
              className="w-full bg-black/70 border border-cyan-800/60 rounded px-2.5 py-1.5 text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="">Default Stark Matrix (Auto-Detect British)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div className="flex items-center justify-between text-cyan-300 mb-1">
              <span>SPEECH CADENCE (RATE)</span>
              <span className="text-cyan-400 font-bold">{settings.voiceRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.4"
              step="0.05"
              value={settings.voiceRate}
              onChange={(e) => onUpdateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-cyan-950/40 rounded h-1.5"
            />
          </div>

          {/* Speech Pitch Slider */}
          <div>
            <div className="flex items-center justify-between text-cyan-300 mb-1">
              <span>VOCAL RESONANCE (PITCH)</span>
              <span className="text-cyan-400 font-bold">{settings.voicePitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={settings.voicePitch}
              onChange={(e) => onUpdateSettings({ voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-cyan-950/40 rounded h-1.5"
            />
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-cyan-900/40 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-cyan-300">AUTO-VOCALIZE RESPONSES</span>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="accent-cyan-400 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-cyan-300">HUD TACTILE SOUND EFFECTS</span>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => {
                  soundEffects.setEnabled(e.target.checked);
                  onUpdateSettings({ soundEffects: e.target.checked });
                }}
                className="accent-cyan-400 w-4 h-4"
              />
            </label>
          </div>

          {/* Test & Dismiss Actions */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-cyan-900/50">
            <button
              onClick={handleTestVoice}
              className="px-3 py-1.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>TEST VOCAL RELAY</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playHudClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded bg-cyan-600/30 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/40 transition-colors cursor-pointer font-bold"
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
