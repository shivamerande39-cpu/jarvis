export type ProtocolMode = 'STANDARD' | 'STEALTH' | 'DEFENSE' | 'OVERDRIVE' | 'HOUSE_PARTY';

export type DirectivePriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type DirectiveStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Directive {
  id: string;
  title: string;
  category: 'MISSION' | 'DIAGNOSTIC' | 'SECURITY' | 'PERSONAL';
  priority: DirectivePriority;
  status: DirectiveStatus;
  createdAt: string;
  dueTime?: string;
}

export interface SubsystemStatus {
  name: string;
  code: string;
  value: number; // 0-100
  status: 'OPTIMAL' | 'NOMINAL' | 'WARNING' | 'STANDBY';
  detail: string;
}

export interface SystemTelemetry {
  arcReactorOutput: number; // in GW / %
  coreTemperature: number; // in °C
  quantumComputeLoad: number; // in %
  memoryIntegrity: number; // in %
  neuralSyncRate: number; // in %
  shieldEfficiency: number; // in %
  networkLatency: number; // in ms
  uplinkStatus: 'ONLINE' | 'SECURED' | 'ENCRYPTED' | 'STANDBY';
  activeProtocol: ProtocolMode;
  uptimeSeconds: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: string;
  isVoiceInput?: boolean;
  actionTaken?: {
    type: 'PROTOCOL_CHANGED' | 'DIRECTIVE_ADDED' | 'DIAGNOSTIC_RUN' | 'SYSTEM_SCAN';
    details: string;
  };
}

export interface WeatherData {
  location: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: string;
  airQuality: string;
}

export interface VoiceSettings {
  autoSpeak: boolean;
  voiceRate: number;
  voicePitch: number;
  selectedVoiceURI: string | null;
  soundEffects: boolean;
  continuousListening: boolean;
}
