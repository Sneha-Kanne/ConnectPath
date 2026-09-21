import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Download, 
  MapPin,
  CheckCircle2, 
  Send,
  Save,
  Radio,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  HardDrive,
  Layers
} from 'lucide-react';
import { Button } from './Button';
import { RouteOption } from '../types';
import { cacheRoute, getCachedRoute, isRouteCached, CachedRouteData } from '../lib/offlineCache';
import { downloadRouteOfflineMap, estimateTileCount, formatBytes, TileDownloadProgress } from '../lib/offlineTileService';

interface DeadZoneAlertProps {
  isVisible: boolean;
  onDismiss: () => void;
  locationName?: string;
  distanceKm?: number;
  onCacheNavigation?: () => void;
  activeRoute?: RouteOption | null;
  speak?: (text: string) => void;
}

export const DeadZoneAlert: React.FC<DeadZoneAlertProps> = ({ 
  isVisible, 
  onDismiss,
  locationName = 'Bhongir Rural Valley',
  distanceKm,
  onCacheNavigation,
  activeRoute,
  speak,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const hasSpokenRef = React.useRef<boolean>(false);

  // Spoken voice warning on dead zone detection
  useEffect(() => {
    if (isVisible) {
      if (!hasSpokenRef.current) {
        hasSpokenRef.current = true;
        const dist = distanceKm !== undefined ? distanceKm.toFixed(1) : '2';
        const warningSpeech = `Warning. Dead zone ahead in ${dist} kilometers. Prepare for signal loss.`;
        if (speak) {
          speak(warningSpeech);
        }
      }
    } else {
      hasSpokenRef.current = false;
    }
  }, [isVisible, distanceKm, speak]);
  
  // Prep Action States
  const [navCached, setNavCached] = useState<boolean>(false);
  const [isNavCaching, setIsNavCaching] = useState<boolean>(false);
  const [cachedDetails, setCachedDetails] = useState<{ distance: number; turns: number } | null>(null);

  const [locationSent, setLocationSent] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);

  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadedBytesStr, setDownloadedBytesStr] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [mapDownloaded, setMapDownloaded] = useState<boolean>(false);
  const [downloadedSize, setDownloadedSize] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const downloadAbortRef = React.useRef<boolean>(false);

  const whatsappMessage = `Entering low network area near ${locationName}, will update in 20 mins`;

  // Estimate tile count and size before download starts
  const tileEstimate = useMemo(() => {
    const coords: [number, number][] = activeRoute?.coordinates
      ? (activeRoute.coordinates as [number, number][])
      : [
          [17.385, 78.4867],
          [17.435, 78.535],
          [17.512, 78.891],
          [17.560, 79.020],
        ];
    return estimateTileCount(coords, 8, 12);
  }, [activeRoute]);

  // Check if current route or any route is already cached
  useEffect(() => {
    const existing = getCachedRoute();
    if (existing) {
      if (!activeRoute || existing.id === activeRoute.id || existing.name === activeRoute.name) {
        setNavCached(true);
        setCachedDetails({ distance: existing.distance, turns: existing.turnsCount });
      }
    }
  }, [activeRoute]);

  // Action 1: Cache Navigation
  const handleCacheNavigation = () => {
    if (navCached || isNavCaching) return;
    setIsNavCaching(true);

    setTimeout(() => {
      let turns = 12;
      let dist = 48.2;

      if (activeRoute) {
        const saved = cacheRoute(activeRoute);
        turns = saved.turnsCount;
        dist = saved.distance;
      } else {
        const defaultMockRoute: RouteOption = {
          id: 'connectivity',
          name: 'Telangana Smart 5G High-Fidelity Path',
          distance: 48.2,
          duration: 52,
          signalStrength: 92,
          emergencySafetyRating: 95,
          coordinates: [
            [17.385, 78.4867],
            [17.435, 78.535],
            [17.512, 78.891],
          ],
          description: 'Offline saved route',
          bestProvider: 'Jio',
          deadZonesCount: 1,
          deadZones: [
            {
              name: locationName,
              coordinates: [17.512, 78.891],
              expectedDurationMins: 4,
              description: 'Cellular attenuation valley',
            },
          ],
        };
        const saved = cacheRoute(defaultMockRoute);
        turns = saved.turnsCount;
        dist = saved.distance;
      }

      setCachedDetails({ distance: dist, turns });
      setIsNavCaching(false);
      setNavCached(true);

      if (speak) speak('Route cached for offline use');
      if (onCacheNavigation) onCacheNavigation();
    }, 800);
  };

  // Action 2: Send Live Location via WhatsApp
  const handleSendLiveLocation = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(whatsappMessage);
    }
    
    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // If popup blocked, clipboard fallback handles it
    }

    setLocationSent(true);
    setCopiedMessage(true);
    if (speak) speak('Live location sent to family');
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  // Action 3: Download Offline Map — real tile download via offlineTileService
  const handleDownloadMap = async () => {
    if (mapDownloaded || isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadedBytesStr('');
    setDownloadError(null);
    downloadAbortRef.current = false;

    const coords: [number, number][] = activeRoute?.coordinates
      ? (activeRoute.coordinates as [number, number][])
      : [
          [17.385, 78.4867],
          [17.435, 78.535],
          [17.512, 78.891],
          [17.560, 79.020],
        ];

    try {
      const region = await downloadRouteOfflineMap(
        locationName,
        coords,
        8,   // minZoom
        12,  // maxZoom keeps the download practical on public tile servers
        (progress: TileDownloadProgress) => {
          if (downloadAbortRef.current) return;
          setDownloadProgress(progress.percent);
          setDownloadedBytesStr(formatBytes(progress.bytesDownloaded));
        }
      );

      setDownloadedSize(formatBytes(region.sizeBytes));
      setDownloadedBytesStr(formatBytes(region.sizeBytes));
      setIsDownloading(false);
      setMapDownloaded(true);
      setDownloadProgress(100);

      if (speak) {
        speak(`Offline map downloaded. ${formatBytes(region.sizeBytes)} ready for offline use.`);
      }
    } catch (err) {
      console.error('[DeadZoneAlert] Offline map download failed:', err);
      setDownloadError(err instanceof Error ? err.message : 'Download failed. Check your connection and try again.');
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadedBytesStr('');
    }
  };

  const handleRetryDownload = () => {
    setDownloadError(null);
    setDownloadProgress(0);
    setDownloadedBytesStr('');
    handleDownloadMap();
  };

  const completedCount = (navCached ? 1 : 0) + (locationSent ? 1 : 0) + (mapDownloaded ? 1 : 0);
  const allCompleted = completedCount === 3;

  return (
    <>
      {/* 1. Slide Down Alert Banner */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="absolute top-20 sm:top-24 left-3 right-3 sm:left-4 sm:right-4 z-40 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--red-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Warning Icon + Text */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span 
                className="p-2.5 rounded-xl shrink-0 animate-bounce"
                style={{
                  background: 'var(--red-subtle)',
                  color: 'var(--red)',
                  border: '1px solid var(--red-border)',
                }}
              >
                <AlertTriangle size={18} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-sans font-extrabold flex items-center gap-1.5 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Dead Zone Detected
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                    style={{
                      background: 'var(--red-subtle)',
                      color: 'var(--red)',
                      border: '1px solid var(--red-border)',
                    }}
                  >
                    {distanceKm !== undefined ? `${distanceKm.toFixed(1)} km AWAY` : '1.9 km AWAY'}
                  </span>
                </span>
                <span className="text-[11px] font-sans" style={{ color: 'var(--text-secondary)' }}>
                  {distanceKm !== undefined ? (
                    <>Dead zone in <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{distanceKm.toFixed(1)} km</span> near <span className="font-bold" style={{ color: 'var(--red)' }}>{locationName}</span>.</>
                  ) : (
                    <>Approaching signal dropout near <span className="font-bold" style={{ color: 'var(--red)' }}>{locationName}</span>. Expected duration: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>4 mins</span>.</>
                  )}
                </span>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                id="journey-prep-trigger-btn"
                variant="coral"
                size="sm"
                className="text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                Journey Prep
                {completedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: 'rgba(0,0,0,0.25)', color: '#fff' }}>
                    {completedCount}/3
                  </span>
                )}
                <ChevronRight size={13} />
              </Button>

              <button
                id="dismiss-alert-btn"
                onClick={onDismiss}
                className="p-2 rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                title="Dismiss Banner"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. "Journey Prep Mode" Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4"
            style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg rounded-3xl p-5 sm:p-6 z-10 flex flex-col gap-4 overflow-hidden"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--red-border)',
                boxShadow: 'var(--shadow-lg)',
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
                      background: 'var(--red-subtle)',
                      color: 'var(--red)',
                      border: '1px solid var(--red-border)',
                    }}
                  >
                    <AlertTriangle size={18} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-sm font-sans font-extrabold uppercase tracking-wider"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Journey Prep Mode
                      </h3>
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full font-extrabold animate-pulse"
                        style={{
                          background: 'var(--red-subtle)',
                          color: 'var(--red)',
                          border: '1px solid var(--red-border)',
                        }}
                      >
                        URGENT PREP
                      </span>
                    </div>
                    <p className="text-[10px] font-sans mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Cellular dropout ahead in 1.9 km • Est. 4 mins blackout
                    </p>
                  </div>
                </div>
                
                <button
                  id="close-journey-prep-modal"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg transition-colors cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Urgency Alert Bar */}
              <div
                className="p-3 rounded-xl flex items-center justify-between text-[11px] font-sans"
                style={{
                  background: 'var(--red-subtle)',
                  border: '1px solid var(--red-border)',
                }}
              >
                <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--red)' }}>
                  <Radio size={14} className="animate-ping" />
                  <span>Target Zone: {locationName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  <Clock size={12} />
                  <span>~4m Downtime</span>
                </div>
              </div>

              {/* The 3 Actionable Checklist Cards */}
              <div className="flex flex-col gap-3">

                {/* ── 1. Cache Navigation ─────────────────────────────────── */}
                <div
                  className="p-3.5 rounded-2xl flex flex-col gap-2 transition-all duration-200"
                  style={{
                    background: navCached ? 'var(--green-subtle)' : 'var(--bg-input)',
                    border: `1px solid ${navCached ? 'var(--green-border)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          background: navCached ? 'var(--green-subtle)' : 'var(--accent-subtle)',
                          color: navCached ? 'var(--green)' : 'var(--accent)',
                          border: `1px solid ${navCached ? 'var(--green-border)' : 'var(--accent-border)'}`,
                        }}
                      >
                        <Save size={16} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-sans font-bold" style={{ color: 'var(--text-primary)' }}>
                            Cache Navigation
                          </span>
                          {navCached && (
                            <span
                              className="text-[9px] font-sans px-1.5 py-0.5 rounded font-extrabold"
                              style={{ background: 'var(--green-subtle)', color: 'var(--green)', border: '1px solid var(--green-border)' }}
                            >
                              SAVED
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[10px] font-sans mt-0.5"
                          style={{ color: navCached ? 'var(--green)' : 'var(--text-secondary)' }}
                        >
                          {navCached 
                            ? `✓ Route cached (${cachedDetails?.distance ?? 48.2} km, ${cachedDetails?.turns ?? 14} turns)` 
                            : 'Preload turn-by-turn geometry before towers disconnect'}
                        </span>
                      </div>
                    </div>

                    <button
                      id="action-cache-nav-btn"
                      onClick={handleCacheNavigation}
                      disabled={navCached || isNavCaching}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      style={{
                        background: navCached ? 'var(--green-subtle)' : 'var(--accent)',
                        color: navCached ? 'var(--green)' : 'var(--text-on-accent)',
                        border: navCached ? '1px solid var(--green-border)' : '1px solid transparent',
                        opacity: navCached ? 1 : undefined,
                        cursor: navCached ? 'default' : 'pointer',
                      }}
                    >
                      {isNavCaching ? (
                        <>
                          <span className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-on-accent)', borderTopColor: 'transparent' }} />
                          Caching...
                        </>
                      ) : navCached ? (
                        <>
                          <CheckCircle2 size={12} />
                          Cached
                        </>
                      ) : (
                        'Cache Navigation'
                      )}
                    </button>
                  </div>
                </div>

                {/* ── 2. Send Live Location ────────────────────────────────── */}
                <div
                  className="p-3.5 rounded-2xl flex flex-col gap-2.5 transition-all duration-200"
                  style={{
                    background: locationSent ? 'var(--green-subtle)' : 'var(--bg-input)',
                    border: `1px solid ${locationSent ? 'var(--green-border)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          background: 'var(--green-subtle)',
                          color: 'var(--green)',
                          border: '1px solid var(--green-border)',
                        }}
                      >
                        <Send size={16} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-sans font-bold" style={{ color: 'var(--text-primary)' }}>
                            Send Live Location
                          </span>
                          {locationSent && (
                            <span
                              className="text-[9px] font-sans px-1.5 py-0.5 rounded font-extrabold"
                              style={{ background: 'var(--green-subtle)', color: 'var(--green)', border: '1px solid var(--green-border)' }}
                            >
                              DISPATCHED
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-sans mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Alert family/friends on WhatsApp before blackout
                        </span>
                      </div>
                    </div>

                    <button
                      id="action-send-location-btn"
                      onClick={handleSendLiveLocation}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      style={{
                        background: locationSent ? 'var(--green-subtle)' : '#25D366',
                        color: locationSent ? 'var(--green)' : '#fff',
                        border: locationSent ? '1px solid var(--green-border)' : '1px solid transparent',
                      }}
                    >
                      <Send size={12} />
                      {locationSent ? 'Sent Again' : 'Send Location'}
                    </button>
                  </div>

                  {/* WhatsApp Message Preview */}
                  <div
                    className="p-2.5 rounded-xl flex items-center justify-between gap-2"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs">💬</span>
                      <p className="text-[10px] font-mono italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        "{whatsappMessage}"
                      </p>
                    </div>
                    <span className="text-[9px] font-sans font-medium shrink-0 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      {copiedMessage ? <Check size={10} style={{ color: 'var(--green)' }} /> : <Copy size={10} />}
                      {copiedMessage ? 'Copied' : 'Auto-copied'}
                    </span>
                  </div>
                </div>

                {/* ── 3. Download Offline Map ──────────────────────────────── */}
                <div
                  className="p-3.5 rounded-2xl flex flex-col gap-2.5 transition-all duration-200"
                  style={{
                    background: mapDownloaded ? 'var(--green-subtle)' : 'var(--bg-input)',
                    border: `1px solid ${mapDownloaded ? 'var(--green-border)' : downloadError ? 'var(--red-border)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl"
                        style={{
                          background: mapDownloaded ? 'var(--green-subtle)' : 'var(--amber-subtle)',
                          color: mapDownloaded ? 'var(--green)' : 'var(--amber)',
                          border: `1px solid ${mapDownloaded ? 'var(--green-border)' : 'var(--amber-border)'}`,
                        }}
                      >
                        {mapDownloaded ? <HardDrive size={16} /> : <Download size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-sans font-bold" style={{ color: 'var(--text-primary)' }}>
                            Download Offline Map
                          </span>
                          {mapDownloaded && (
                            <span
                              className="text-[9px] font-sans px-1.5 py-0.5 rounded font-extrabold"
                              style={{ background: 'var(--green-subtle)', color: 'var(--green)', border: '1px solid var(--green-border)' }}
                            >
                              {downloadedSize || '~15MB'} READY
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-sans mt-0.5" style={{ color: mapDownloaded ? 'var(--green)' : downloadError ? 'var(--red)' : 'var(--text-secondary)' }}>
                          {mapDownloaded
                            ? `✓ Map cached for offline use (${downloadedSize}) — works without internet`
                            : downloadError
                            ? downloadError
                            : isDownloading
                            ? `Downloading tiles for offline use… (${downloadProgress}%${downloadedBytesStr ? ` — ${downloadedBytesStr}` : ''})`
                            : `~${tileEstimate.estimatedMB} for this route (${tileEstimate.tileCount} tiles)`}
                        </span>
                      </div>
                    </div>

                    {/* Download / Retry / Cached button */}
                    {downloadError ? (
                      <button
                        id="action-retry-download-btn"
                        onClick={handleRetryDownload}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        style={{
                          background: 'var(--red-subtle)',
                          color: 'var(--red)',
                          border: '1px solid var(--red-border)',
                        }}
                      >
                        <RefreshCw size={12} />
                        Retry
                      </button>
                    ) : (
                      <button
                        id="action-download-map-btn"
                        onClick={handleDownloadMap}
                        disabled={mapDownloaded || isDownloading}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        style={{
                          background: mapDownloaded ? 'var(--green-subtle)' : isDownloading ? 'var(--amber-subtle)' : 'var(--amber)',
                          color: mapDownloaded ? 'var(--green)' : isDownloading ? 'var(--amber)' : 'var(--bg-primary)',
                          border: mapDownloaded ? '1px solid var(--green-border)' : isDownloading ? '1px solid var(--amber-border)' : '1px solid transparent',
                          cursor: mapDownloaded || isDownloading ? 'default' : 'pointer',
                        }}
                      >
                        {isDownloading ? (
                          <>
                            <Download size={12} className="animate-bounce" />
                            {downloadProgress > 0 ? `${downloadProgress}%` : 'Starting…'}
                          </>
                        ) : mapDownloaded ? (
                          <>
                            <CheckCircle2 size={12} />
                            Cached
                          </>
                        ) : (
                          <>
                            <Download size={12} />
                            Download
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Download Progress Bar */}
                  {(isDownloading || (mapDownloaded && downloadProgress > 0)) && (
                    <div
                      className="w-full rounded-full h-2 overflow-hidden"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        style={{
                          background: mapDownloaded
                            ? 'var(--green)'
                            : 'linear-gradient(90deg, var(--amber), var(--accent))',
                        }}
                      />
                    </div>
                  )}

                  {/* Tile count info strip */}
                  {!mapDownloaded && !isDownloading && !downloadError && (
                    <div className="flex items-center gap-2 text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      <Layers size={9} />
                      <span>Zoom levels 9–13 • {tileEstimate.tileCount} tiles</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Completion Status Footer */}
              <div
                className="flex items-center justify-between pt-2 text-[11px] font-sans"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Checklist Status:</span>
                <span
                  className="font-bold flex items-center gap-1.5"
                  style={{ color: allCompleted ? 'var(--green)' : 'var(--amber)' }}
                >
                  {allCompleted ? (
                    <>
                      <CheckCircle2 size={13} />
                      ALL 3 PREPARATIONS READY
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} />
                      {completedCount}/3 Actions Completed
                    </>
                  )}
                </span>
              </div>

              {/* Primary CTA */}
              <div className="flex items-center gap-2">
                <Button
                  id="finish-journey-prep-btn"
                  variant={allCompleted ? 'primary' : 'coral'}
                  fullWidth
                  onClick={() => setShowModal(false)}
                  className="text-xs font-bold py-2.5 cursor-pointer"
                >
                  {allCompleted ? '✓ All Systems Synced — Resume Driving' : 'Acknowledge & Continue Navigation'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
