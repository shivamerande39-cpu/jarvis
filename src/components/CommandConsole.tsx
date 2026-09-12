import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Terminal, Copy, Check, RotateCcw } from 'lucide-react';
import { ChatMessage } from '../types';
import { soundEffects } from '../services/soundEffects';

interface CommandConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isVoice?: boolean) => void;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSpeakMessage: (text: string) => void;
  interimTranscript: string;
  soundEffectsEnabled: boolean;
  onToggleSoundEffects: () => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onClearConsole: () => void;
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  messages,
  onSendMessage,
  isListening,
  isThinking,
  isSpeaking,
  onStartListening,
  onStopListening,
  onSpeakMessage,
  interimTranscript,
  soundEffectsEnabled,
  onToggleSoundEffects,
  autoSpeak,
  onToggleAutoSpeak,
  onClearConsole,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimTranscript, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    soundEffects.playMicStart();
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      soundEffects.playHudClick();
      onStopListening();
    } else {
      soundEffects.playMicStart();
      onStartListening();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundEffects.playHudClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: 'System Diagnostics', prompt: 'Run a full diagnostic scan on all suit subsystems and Arc Reactor.' },
    { label: 'Engage Stealth', prompt: 'Initiate stealth protocol and minimize electromagnetic emissions.' },
    { label: 'Atmospheric Scan', prompt: 'Provide an atmospheric telemetry scan for Malibu and Stark Tower.' },
    { label: 'Add Directive', prompt: 'Remind me to inspect the vibranium weave and repulsor relays at 18:00.' },
    { label: 'Who are you?', prompt: 'State your operational designation and current readiness status.' },
  ];

  return (
    <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-3 flex flex-col h-[520px] relative">
      {/* Console Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-900/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-200">
            NEURAL COMMAND CONSOLE
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-tech">
          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSoundEffects}
            className={`p-1 rounded border text-cyan-400 hover:text-cyan-200 cursor-pointer transition-colors ${
              soundEffectsEnabled
                ? 'border-cyan-500/50 bg-cyan-950/60'
                : 'border-cyan-950/40 bg-black/40 opacity-50'
            }`}
            title={soundEffectsEnabled ? 'Mute HUD Audio Cues' : 'Unmute HUD Audio Cues'}
          >
            {soundEffectsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Voice Auto Speak Toggle */}
          <button
            onClick={onToggleAutoSpeak}
            className={`px-2 py-0.5 rounded border text-[10px] tracking-wider cursor-pointer transition-colors ${
              autoSpeak
                ? 'border-cyan-400 bg-cyan-900/40 text-cyan-200'
                : 'border-cyan-950/60 bg-black/40 text-cyan-600'
            }`}
            title="Toggle automatic vocal response by Jarvis"
          >
            VOICE: {autoSpeak ? 'ACTIVE' : 'MUTED'}
          </button>

          {/* Clear Console */}
          <button
            onClick={onClearConsole}
            className="p-1 text-cyan-500 hover:text-cyan-300 transition-colors"
            title="Clear console backlog"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message Backlog */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="text-center py-1 text-[11px] font-mono-tech text-cyan-500/70 border-y border-cyan-950/40"
              >
                [SYSTEM EVENT] {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-cyan-400/60 mb-0.5">
                <span>{isUser ? 'TONY STARK' : 'J.A.R.V.I.S.'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.isVoiceInput && (
                  <span className="text-cyan-400 flex items-center gap-0.5">
                    <Mic className="w-2.5 h-2.5" /> VOICE
                  </span>
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-lg p-2.5 text-xs font-mono-tech tracking-wide leading-relaxed relative group ${
                  isUser
                    ? 'bg-cyan-900/25 border border-cyan-500/40 text-cyan-100 rounded-br-none'
                    : 'bg-black/60 border border-cyan-800/40 text-cyan-200 rounded-bl-none shadow-[0_0_12px_rgba(56,189,248,0.1)]'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Directive / Protocol Action Tag */}
                {msg.actionTaken && (
                  <div className="mt-2 pt-1.5 border-t border-cyan-900/40 text-[10px] font-mono-tech text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>{msg.actionTaken.details}</span>
                  </div>
                )}

                {/* Actions: Speak & Copy */}
                {!isUser && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 right-1 flex items-center gap-1 bg-black/90 px-1.5 py-0.5 rounded border border-cyan-800/60 z-10">
                    <button
                      onClick={() => onSpeakMessage(msg.content)}
                      className="text-cyan-400 hover:text-cyan-200 text-[10px] p-0.5"
                      title="Vocalize response"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-cyan-400 hover:text-cyan-200 text-[10px] p-0.5"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Interim Speech Transcript Display */}
        {isListening && interimTranscript && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono-tech text-amber-400/80 mb-0.5 animate-pulse">
              SPEECH-TO-TEXT STREAMING...
            </span>
            <div className="max-w-[85%] rounded-lg p-2.5 text-xs font-mono-tech bg-amber-950/30 border border-amber-500/50 text-amber-200 rounded-br-none">
              {interimTranscript}
            </div>
          </div>
        )}

        {/* Thinking State */}
        {isThinking && (
          <div className="flex items-center gap-2 text-xs font-mono-tech text-cyan-400 py-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>J.A.R.V.I.S. is compiling response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-cyan-900/30">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundEffects.playHudClick();
              onSendMessage(qp.prompt, false);
            }}
            className="flex-shrink-0 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-[10px] font-mono-tech text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-100 transition-colors cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Command Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        {/* Voice Input Button */}
        <button
          type="button"
          id="voice-mic-btn"
          onClick={handleVoiceToggle}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
            isListening
              ? 'border-red-500 bg-red-950/60 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
              : 'border-cyan-500/50 bg-cyan-950/50 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/50'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input (Speech to Text)'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            id="jarvis-command-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to voice stream, Sir...'
                : 'Direct J.A.R.V.I.S. (e.g., "Run diagnostics", "Activate stealth")...'
            }
            disabled={isThinking}
            className="w-full bg-black/70 border border-cyan-800/60 rounded-lg px-3 py-2 text-xs font-mono-tech text-cyan-100 placeholder-cyan-600 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          id="jarvis-send-btn"
          disabled={!inputText.trim() || isThinking}
          className="p-2.5 rounded-lg bg-cyan-600/30 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/40 disabled:opacity-40 transition-colors cursor-pointer"
          title="Send command"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
