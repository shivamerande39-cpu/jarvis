/**
 * J.A.R.V.I.S. Speech Recognition & Synthesis Engine
 */

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

// Global declaration for vendor prefixes
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

class VoiceAssistantService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
    return this.availableVoices;
  }

  public getJarvisVoice(voiceURI?: string | null): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (voiceURI) {
      const match = voices.find(v => v.voiceURI === voiceURI);
      if (match) return match;
    }

    // Try to find a classic British accent or sophisticated English voice
    const ukMale = voices.find(v => 
      (v.lang.includes('en-GB') || v.lang.includes('en_GB')) && 
      (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('george'))
    );
    if (ukMale) return ukMale;

    const anyUk = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en_GB'));
    if (anyUk) return anyUk;

    const enMale = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
    if (enMale) return enMale;

    const anyEn = voices.find(v => v.lang.startsWith('en'));
    return anyEn || voices[0] || null;
  }

  public speak(
    text: string, 
    options: {
      rate?: number;
      pitch?: number;
      voiceURI?: string | null;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();

    // Clean text of markdown asterisks, backticks, or code blocks for speech
    const cleanSpeech = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanSpeech) return false;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    this.currentUtterance = utterance;

    const voice = this.getJarvisVoice(options.voiceURI);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = options.rate ?? 1.05; // slightly swift and articulate
    utterance.pitch = options.pitch ?? 0.95; // calm, slightly lower authoritative pitch

    utterance.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  public startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onEnd: () => void;
    onError: (error: string) => void;
  }): boolean {
    if (!this.isSpeechSupported()) {
      callbacks.onError("Speech recognition not supported in this browser.");
      return false;
    }

    // Stop speaking while listening to avoid echo
    this.stopSpeaking();

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          callbacks.onResult(finalTranscript, true);
        } else if (interimTranscript) {
          callbacks.onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false;
        callbacks.onError(event.error || 'Microphone capture error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      callbacks.onError(err.message || 'Could not start voice recognition');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }
}

export const voiceAssistant = new VoiceAssistantService();
