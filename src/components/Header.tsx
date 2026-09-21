import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Settings, Globe, Sun, Moon, MapPin, AlertCircle, PhoneCall, HardDrive } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useLanguage } from '../hooks/useLanguage';
import { LANGUAGE_OPTIONS } from '../lib/translations';
import { getGamificationState, GAMIFICATION_UPDATE_EVENT } from '../lib/gamificationService';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onEmergencyClick: () => void;
  onSimulateDeadZone?: () => void;
  isDeadZoneActive?: boolean;
  isRouteSelected?: boolean;
  isTracking?: boolean;
  onToggleTracking?: () => void;
  isRouteCached?: boolean;
  onViewCachedRoute?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isVoiceEnabled?: boolean;
  onOpenSettings?: () => void;
  isDeviated?: boolean;
  distanceFromRoute?: number;
  onToggleSimulatedDeviation?: () => void;
  onOpenCommunity?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onEmergencyClick, 
  onSimulateDeadZone,
  isDeadZoneActive,
  isRouteSelected,
  isTracking,
  onToggleTracking,
  isRouteCached,
  onViewCachedRoute,
  isMuted,
  onToggleMute,
  isVoiceEnabled = true,
  onOpenSettings,
  isDeviated = false,
  distanceFromRoute = 0,
  onToggleSimulatedDeviation,
  onOpenCommunity,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [gamification, setGamification] = useState(() => getGamificationState());
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleGamificationUpdate = () => {
      setGamification(getGamificationState());
    };
    window.addEventListener(GAMIFICATION_UPDATE_EVENT, handleGamificationUpdate);
    return () => window.removeEventListener(GAMIFICATION_UPDATE_EVENT, handleGamificationUpdate);
  }, []);

  const currentLangObj = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <header
      className="absolute top-4 left-4 right-4 z-40 rounded-2xl px-4 py-3 flex items-center justify-between pointer-events-auto transition-colors"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Brand Identity - Clean & Human */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-transform hover:scale-105"
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)'
          }}
        >
          <MapPin size={20} className="stroke-[2.5]" />
        </div>

        <div className="flex flex-col">
            <span
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('app_title', 'ConnectPath')}
            </span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
              }}
            >
              {t('region_tag', 'Telangana')}
            </span>
          <span
            className="text-xs font-normal"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('navigation_subtitle', 'Navigation with signal information')}
          </span>
        </div>
      </div>

      {/* Action Controls Bar - Generous Spacing & High Usability */}
      <div className="flex items-center gap-2.5 sm:gap-3">

        {/* Community Reports / Signal Points */}
        {onOpenCommunity && (
          <button
            id="header-gamification-btn"
            onClick={onOpenCommunity}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Community Signal Reports & Points"
          >
            <span style={{ color: 'var(--amber)' }}>★</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{gamification.points}</span>
            <span className="hidden md:inline">pts</span>
          </button>
        )}

        {/* Offline Cache Status / Download Button */}
        {onViewCachedRoute && (
          <button
            id="header-offline-maps-btn"
            onClick={onViewCachedRoute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all hover:opacity-90 active:scale-95"
            style={{
              background: isRouteCached ? 'var(--green-subtle)' : 'var(--bg-input)',
              border: `1px solid ${isRouteCached ? 'var(--green-border)' : 'var(--border)'}`,
              color: isRouteCached ? 'var(--green)' : 'var(--text-secondary)',
            }}
            title={isRouteCached ? 'Offline Route Cached' : 'Download & Manage Offline Maps'}
          >
            <HardDrive size={14} />
            <span className="hidden md:inline font-medium">
              {isRouteCached ? t('cached_offline', 'Available offline') : t('offline_maps', 'Offline maps')}
            </span>
          </button>
        )}

        {/* GPS Live Tracking Toggle */}
        {isRouteSelected && onToggleTracking && (
          <button
            id="header-start-tracking-btn"
            onClick={onToggleTracking}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            style={{
              background: isTracking ? 'var(--accent)' : 'var(--accent-subtle)',
              border: `1px solid var(--accent-border)`,
              color: isTracking ? '#ffffff' : 'var(--accent)',
            }}
            title={isTracking ? 'Stop Live GPS Tracking' : 'Start Live GPS Tracking'}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: isTracking ? '#ffffff' : 'var(--accent)',
                boxShadow: isTracking ? '0 0 8px #ffffff' : 'none'
              }}
            />
            <span>{isTracking ? 'Tracking Live' : 'Start GPS'}</span>
          </button>
        )}

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            id="header-language-dropdown-btn"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all hover:opacity-90"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Switch Language"
          >
            <Globe size={14} style={{ color: 'var(--accent)' }} />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {currentLangObj.nativeLabel}
            </span>
          </button>

          <AnimatePresence>
            {isLangDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                className="absolute right-0 mt-2 w-36 rounded-xl p-1.5 z-50 flex flex-col gap-1 shadow-xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)',
                }}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left"
                    style={{
                      background: language === opt.code ? 'var(--accent)' : 'transparent',
                      color: language === opt.code ? '#ffffff' : 'var(--text-primary)',
                      fontWeight: language === opt.code ? 600 : 400,
                    }}
                  >
                    <span>{opt.nativeLabel}</span>
                    <span className="text-[10px] opacity-75">{opt.code.toUpperCase()}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator Divider */}
        <div className="h-5 w-px" style={{ background: 'var(--border)' }} />

        {/* Dark / Light Theme Toggle */}
        <button
          id="header-theme-toggle-btn"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:opacity-90 active:scale-95"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun size={17} style={{ color: 'var(--amber)' }} />
          ) : (
            <Moon size={17} style={{ color: 'var(--accent)' }} />
          )}
        </button>

        {/* Voice Navigation Mute/Unmute */}
        {onToggleMute && (
          <button
            id="header-volume-mute-btn"
            onClick={onToggleMute}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{
              background: isMuted || !isVoiceEnabled ? 'var(--bg-input)' : 'var(--accent-subtle)',
              border: `1px solid ${isMuted || !isVoiceEnabled ? 'var(--border)' : 'var(--accent-border)'}`,
              color: isMuted || !isVoiceEnabled ? 'var(--text-muted)' : 'var(--accent)',
            }}
            title={isMuted ? 'Voice Muted — Click to Enable' : 'Voice Navigation Active'}
          >
            {isMuted || !isVoiceEnabled ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        )}

        {/* App Settings Modal */}
        {onOpenSettings && (
          <button
            id="header-open-settings-btn"
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-secondary)',
            }}
            title={t('settings', 'Settings')}
          >
            <Settings size={17} />
          </button>
        )}

        {/* Emergency Assistance Button */}
        <button
          id="header-emergency-btn"
          onClick={onEmergencyClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:opacity-90 active:scale-95"
          style={{
            background: 'var(--red-subtle)',
            border: '1px solid var(--red-border)',
            color: 'var(--red)',
          }}
          title="Emergency Contacts & SOS"
        >
          <PhoneCall size={14} />
          <span className="hidden sm:inline">SOS</span>
        </button>

      </div>
    </header>
  );
};
