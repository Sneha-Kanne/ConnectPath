import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSpeechReturn {
  speak: (text: string) => void;
  setVoice: (voiceName: string) => void;
  setRate: (rate: number) => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: string;
  rate: number;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeech(): UseSpeechReturn {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [isVoiceEnabled, setIsVoiceEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('connectpath_voice_enabled');
    return stored !== null ? stored === 'true' : true;
  });

  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('connectpath_voice_muted');
    return stored === 'true';
  });

  const [rate, setRateState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.0;
    const stored = localStorage.getItem('connectpath_voice_rate');
    return stored ? parseFloat(stored) : 1.0;
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoiceState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('connectpath_selected_voice') || '';
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (!isSupported) return;
    synthRef.current = window.speechSynthesis;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
        // Default to an English voice if none selected
        if (!selectedVoice) {
          const defaultEn = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.default));
          if (defaultEn) {
            setSelectedVoiceState(defaultEn.name);
          }
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported, selectedVoice]);

  const setIsVoiceEnabled = useCallback((enabled: boolean) => {
    setIsVoiceEnabledState(enabled);
    localStorage.setItem('connectpath_voice_enabled', String(enabled));
    if (!enabled && synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
    localStorage.setItem('connectpath_voice_muted', String(muted));
    if (muted && synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const setRate = useCallback((newRate: number) => {
    const clamped = Math.max(0.5, Math.min(2.0, newRate));
    setRateState(clamped);
    localStorage.setItem('connectpath_voice_rate', String(clamped));
  }, []);

  const setVoice = useCallback((voiceName: string) => {
    setSelectedVoiceState(voiceName);
    localStorage.setItem('connectpath_selected_voice', voiceName);
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !synthRef.current) {
      console.warn('[useSpeech] Speech synthesis is not supported on this device.');
      return;
    }

    if (!isVoiceEnabled || isMuted) {
      return;
    }

    try {
      // Cancel previous utterance to prevent stutter/backlog
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (selectedVoice && availableVoices.length > 0) {
        const found = availableVoices.find(v => v.name === selectedVoice);
        if (found) {
          utterance.voice = found;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('[useSpeech] Speech synthesis error:', e);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    } catch (err) {
      console.warn('[useSpeech] Failed to execute speak:', err);
    }
  }, [isSupported, isVoiceEnabled, isMuted, rate, selectedVoice, availableVoices]);

  return {
    speak,
    setVoice,
    setRate,
    isVoiceEnabled,
    setIsVoiceEnabled,
    isMuted,
    toggleMute,
    setMuted,
    availableVoices,
    selectedVoice,
    rate,
    isSpeaking,
    isSupported,
  };
}
