import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  X, 
  Sparkles, 
  Download, 
  Radio, 
  ShieldCheck,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { UseSpeechReturn } from '../hooks/useSpeech';
import { PWAInstallButton } from './PWAInstallButton';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  speech: UseSpeechReturn;
  isPWAInstalled?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  speech,
  isPWAInstalled = false,
}) => {
  const { t } = useLanguage();
  const {
    isVoiceEnabled,
    setIsVoiceEnabled,
    isMuted,
    toggleMute,
    rate,
    setRate,
    selectedVoice,
    setVoice,
    availableVoices,
    speak,
    isSupported,
  } = speech;

  const handleTestVoice = () => {
    speak('Voice navigation active. Cellular monitoring is online, and dead zones will be announced.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="connectpath-settings-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-lg rounded-3xl p-5 sm:p-6 z-10 flex flex-col gap-5 overflow-hidden"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--text-primary)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between pb-3.5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="p-2 rounded-xl"
                  style={{
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent-border)',
                  }}
                >
                  <Settings size={18} />
                </span>
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                  >
                    {t('settings', 'Settings')}
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {t('navigation_subtitle', 'Voice navigation, offline maps & preferences')}
                  </p>
                </div>
              </div>
              
              <button
                id="close-settings-modal-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Main Settings Sections */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* SECTION 1: VOICE NAVIGATION */}
              <div
                className="p-4 rounded-2xl space-y-3"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-xl"
                      style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                    >
                      <Volume2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                        {t('voice_active', 'Voice Navigation')}
                        {isVoiceEnabled && !isMuted ? (
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--green-subtle)', color: 'var(--green)', border: '1px solid var(--green-border)' }}
                          >
                            ON
                          </span>
                        ) : (
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                          >
                            {isMuted ? 'MUTED' : 'OFF'}
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {t('voice_alerts_desc', 'Spoken turn-by-turn alerts and dead zone warnings')}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="voice-navigation-toggle"
                      type="checkbox"
                      checked={isVoiceEnabled}
                      onChange={(e) => setIsVoiceEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className="w-10 h-5 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"
                      style={{
                        background: isVoiceEnabled ? 'var(--accent)' : 'var(--border-strong)',
                        position: 'relative',
                      }}
                    />
                  </label>
                </div>

                {isVoiceEnabled && (
                  <div className="pt-2 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                    {/* Audio Output Mute / Unmute */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Audio output:</span>
                      <button
                        onClick={toggleMute}
                        className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                        style={{
                          background: isMuted ? 'var(--red-subtle)' : 'var(--green-subtle)',
                          border: `1px solid ${isMuted ? 'var(--red-border)' : 'var(--green-border)'}`,
                          color: isMuted ? 'var(--red)' : 'var(--green)',
                        }}
                      >
                        {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        <span>{isMuted ? 'Muted' : 'Active'}</span>
                      </button>
                    </div>

                    {/* Speech Rate Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span style={{ color: 'var(--text-secondary)' }}>Speaking speed:</span>
                        <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>{rate.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.5"
                        step="0.05"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 rounded-lg cursor-pointer"
                        style={{ accentColor: 'var(--accent)', background: 'var(--border)' }}
                      />
                      <div
                        className="flex justify-between text-[9px] font-mono"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span>Slow</span>
                        <span>Normal</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    {/* Voice Selection Dropdown (if available) */}
                    {availableVoices.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] block" style={{ color: 'var(--text-secondary)' }}>Voice:</label>
                        <select
                          value={selectedVoice}
                          onChange={(e) => setVoice(e.target.value)}
                          className="w-full rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                          style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {availableVoices.map((v) => (
                            <option key={v.name} value={v.name}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Test Audio Button */}
                    <button
                      id="test-voice-navigation-btn"
                      onClick={handleTestVoice}
                      className="w-full py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={{
                        background: 'var(--accent-subtle)',
                        border: '1px solid var(--accent-border)',
                        color: 'var(--accent)',
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Play Sample Voice Alert</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 2: PWA & OFFLINE CAPABILITIES */}
              <div
                className="p-4 rounded-2xl space-y-3"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: 'var(--green-subtle)', color: 'var(--green)' }}
                  >
                    <Download size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                      Install App &amp; Offline Mode
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--green-subtle)', color: 'var(--green)', border: '1px solid var(--green-border)' }}
                      >
                        PWA
                      </span>
                    </h4>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Works offline so you can navigate without an internet connection
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div
                    className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Install status:</span>
                    <span className="font-semibold flex items-center gap-1 text-[11px]" style={{ color: 'var(--green)' }}>
                      <CheckCircle2 size={12} />
                      {isPWAInstalled ? 'Installed' : 'Add to Home Screen'}
                    </span>
                  </div>

                  {!isPWAInstalled && (
                    <PWAInstallButton variant="full" />
                  )}
                </div>
              </div>

              {/* SECTION 3: ROUTE DEVIATION TOLERANCE */}
              <div
                className="p-4 rounded-2xl space-y-2"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: 'var(--amber-subtle)', color: 'var(--amber)' }}
                  >
                    <Sliders size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                      Off-Route Alert Distance
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--amber-subtle)', color: 'var(--amber)', border: '1px solid var(--amber-border)' }}
                      >
                        200 m
                      </span>
                    </h4>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      You'll get an alert if you stray more than 200m from the selected route
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              id="settings-done-btn"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
              style={{
                background: 'var(--accent)',
                color: '#ffffff',
              }}
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
