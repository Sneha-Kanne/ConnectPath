import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Bookmark, 
  Sparkles, 
  MapPin, 
  Activity, 
  Wifi, 
  Clock, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X,
  Compass,
  AlertTriangle,
  Radio,
  Users
} from 'lucide-react';

import { JourneyPurpose, LocationData, RouteOption, SavedPath } from './types';
import { Header } from './components/Header';
import { MapCanvas } from './components/MapCanvas';
import { SearchPanel } from './components/SearchPanel';
import { RouteResults } from './components/RouteResults';
import { SavedPathsList } from './components/SavedPathsList';
import { ConnectivityTimeline } from './components/ConnectivityTimeline';
import { DeadZoneAlert } from './components/DeadZoneAlert';
import { CommunityReports } from './components/CommunityReports';
import { ConvoyPanel } from './components/ConvoyPanel';
import { getThemedRoutes } from './lib/routingService';
import { Card } from './components/Card';
import { EmergencyPanel } from './components/EmergencyPanel';
import { useGeolocation } from './hooks/useGeolocation';
import { ProximityAlert } from './components/ProximityAlert';
import { 
  cacheRoute, 
  getCachedRoute, 
  clearCachedRoute, 
  isRouteCached, 
  CachedRouteData,
  formatCachedTimestamp 
} from './lib/offlineCache';
import { CachedRouteModal } from './components/CachedRouteModal';
import { useSpeech } from './hooks/useSpeech';
import { useRouteDeviation } from './hooks/useRouteDeviation';
import { RouteDeviationAlert } from './components/RouteDeviationAlert';
import { SettingsModal } from './components/SettingsModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { UserAnalytics } from './components/UserAnalytics';
import { PredictionAccuracy } from './components/PredictionAccuracy';
import { useLanguage } from './hooks/useLanguage';

export default function App() {
  const { t } = useLanguage();
  // --- Core State Variables ---
  const [startLocation, setStartLocation] = useState<LocationData | null>(null);
  const [endLocation, setEndLocation] = useState<LocationData | null>(null);
  const [journeyPurpose, setJourneyPurpose] = useState<JourneyPurpose>('Daily Commute');
  const [preference, setPreference] = useState<number>(50);
  const [emergencySafe, setEmergencySafe] = useState<boolean>(false);

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('fastest');
  
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [savedPaths, setSavedPaths] = useState<SavedPath[]>([]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  
  // Custom Banner / Alert States
  const [isDeadZoneAlertVisible, setIsDeadZoneAlertVisible] = useState<boolean>(false);

  // Tab control inside UI drawer: 'configure' | 'convoy' | 'bulletins' | 'analytics' | 'accuracy' | 'bookmarks'
  const [activeTab, setActiveTab] = useState<'configure' | 'convoy' | 'bulletins' | 'analytics' | 'accuracy' | 'bookmarks'>('configure');

  // Responsiveness & Mobile Panel States
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState<boolean>(true);

  // --- Real-time GPS Geolocation Hook ---
  const {
    latitude,
    longitude,
    accuracy,
    error: geoError,
    isTracking,
    startTracking,
    stopTracking,
  } = useGeolocation();

  const userLocation =
    latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null;

  // --- Voice Navigation (Web Speech API) ---
  const speech = useSpeech();
  const { speak, isMuted, toggleMute, isVoiceEnabled } = speech;
  const { isInstalled: isPWAInstalled } = usePWAInstall();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // --- Route Deviation Detection ---
  const [simulatedDeviation, setSimulatedDeviation] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [dismissDeviation, setDismissDeviation] = useState<boolean>(false);

  const activeRoute = routes.find(r => r.id === selectedRouteId) || null;

  // Compute effective position for deviation check
  const effectiveLocation = React.useMemo(() => {
    if (simulatedDeviation) {
      if (userLocation) {
        return { lat: userLocation.lat + 0.0035, lng: userLocation.lng + 0.0035 };
      }
      if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 1) {
        const mid = activeRoute.coordinates[Math.floor(activeRoute.coordinates.length / 2)];
        return { lat: mid[0] + 0.0035, lng: mid[1] + 0.0035 };
      }
      return { lat: 17.4385, lng: 78.5385 };
    }
    return userLocation;
  }, [simulatedDeviation, userLocation, activeRoute]);

  const deviation = useRouteDeviation(
    effectiveLocation,
    activeRoute?.coordinates,
    200
  );

  const isDeviatedActive = (isTracking || simulatedDeviation) && deviation.isDeviated && !dismissDeviation;

  // Voice alert on deviation detection
  const hasSpokenDeviationRef = React.useRef<boolean>(false);
  useEffect(() => {
    if (isDeviatedActive && !hasSpokenDeviationRef.current) {
      hasSpokenDeviationRef.current = true;
      speak(`Warning. You have deviated ${deviation.distanceFromRoute} meters from the recommended route.`);
    } else if (!isDeviatedActive) {
      hasSpokenDeviationRef.current = false;
    }
  }, [isDeviatedActive, deviation.distanceFromRoute, speak]);

  // Reset dismiss flag when user is back on route
  useEffect(() => {
    if (!deviation.isDeviated) {
      setDismissDeviation(false);
    }
  }, [deviation.isDeviated]);

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
      setSimulatedDeviation(false);
    } else {
      startTracking();
    }
  };

  // Recalculate Route from current GPS position
  const handleRecalculateRoute = async () => {
    if (!endLocation) return;
    setIsRecalculating(true);
    speak('Recalculating route from current position');

    try {
      const originLat = effectiveLocation?.lat || startLocation?.lat || 17.385;
      const originLng = effectiveLocation?.lng || startLocation?.lng || 78.4867;
      const newStart: LocationData = {
        name: `Current Location [${originLat.toFixed(4)}, ${originLng.toFixed(4)}]`,
        lat: originLat,
        lng: originLng,
      };
      setStartLocation(newStart);
      const recalculated = await getThemedRoutes(newStart, endLocation);
      setRoutes(recalculated);
      setSelectedRouteId('connectivity');
      setSimulatedDeviation(false);
      setDismissDeviation(false);
    } catch (err) {
      console.error('Error recalculating route:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  // --- Offline Route Caching States ---
  const [cachedRoute, setCachedRoute] = useState<CachedRouteData | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(false);
  const [isCachedModalOpen, setIsCachedModalOpen] = useState<boolean>(false);

  // Check for cached route on app load
  useEffect(() => {
    const existing = getCachedRoute();
    if (existing) {
      setCachedRoute(existing);
      setShowResumeBanner(true);
    }
  }, []);

  const handleResumeRoute = (cached: CachedRouteData) => {
    const restoredRoute: RouteOption = {
      id: cached.id || 'connectivity',
      name: cached.name,
      distance: cached.distance,
      duration: cached.duration,
      signalStrength: cached.signalStrength,
      emergencySafetyRating: cached.emergencySafetyRating,
      coordinates: cached.coordinates,
      description: cached.description,
      bestProvider: cached.bestProvider,
      routeHealth: cached.routeHealth,
      confidenceScore: cached.confidenceScore,
      deadZonesCount: cached.deadZonesCount,
      deadZones: cached.deadZones,
      whyThisRoute: cached.whyThisRoute,
      dataSource: cached.dataSource,
      towerCount: cached.towerCount,
    };

    setRoutes([restoredRoute]);
    setSelectedRouteId(restoredRoute.id);

    if (cached.coordinates && cached.coordinates.length > 1) {
      const origin = cached.coordinates[0];
      const dest = cached.coordinates[cached.coordinates.length - 1];
      setStartLocation({
        name: `${cached.name.split('Corridor')[0].trim()} (Origin)`,
        lat: origin[0],
        lng: origin[1],
      });
      setEndLocation({
        name: 'Destination (Cached)',
        lat: dest[0],
        lng: dest[1],
      });
    }

    setShowResumeBanner(false);
    setActiveTab('configure');
    setMobileSheetExpanded(true);
  };

  const handleClearCache = () => {
    clearCachedRoute();
    setCachedRoute(null);
    setShowResumeBanner(false);
    setIsCachedModalOpen(false);
  };

  // --- Load and Save bookmarks ---
  useEffect(() => {
    const loadSavedRoutes = async () => {
      try {
        const response = await fetch('/api/routes');
        if (response.ok) {
          const dbRoutes = await response.json();
          if (dbRoutes && dbRoutes.length > 0) {
            const mapped: SavedPath[] = dbRoutes.map((r: any) => ({
              id: r._id || r.id,
              title: r.name,
              start: r.start,
              end: r.end,
              purpose: 'Daily Commute',
              preference: r.signalStrength || 90,
              emergencySafe: r.signalStrength > 95,
              selectedRouteId: 'connectivity',
              createdAt: r.createdAt || new Date().toISOString()
            }));
            setSavedPaths(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Error fetching saved routes from Express API:', err);
      }

      // Fallback to local storage if API is offline
      const saved = localStorage.getItem('connectpath_saved_corridors');
      if (saved) {
        try {
          setSavedPaths(JSON.parse(saved));
        } catch (err) {
          console.error('Error parsing saved paths:', err);
        }
      }
    };

    loadSavedRoutes();
  }, []);

  // Trigger Dead Zone warning alert for the fastest corridor route option
  useEffect(() => {
    if (routes.length > 0 && selectedRouteId === 'fastest') {
      setIsDeadZoneAlertVisible(true);
    } else {
      setIsDeadZoneAlertVisible(false);
    }
  }, [selectedRouteId, routes]);

  // Sync to local storage
  const syncSavedPaths = (paths: SavedPath[]) => {
    setSavedPaths(paths);
    localStorage.setItem('connectpath_saved_corridors', JSON.stringify(paths));
  };

  // Detect Mobile Width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Map Click Handler (Manual Selection Mode) ---
  const handleMapSelection = (lat: number, lng: number, type: 'start' | 'end') => {
    const truncatedName = `Map Pin [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
    const newLocation: LocationData = {
      name: truncatedName,
      lat,
      lng,
    };

    if (type === 'start') {
      setStartLocation(newLocation);
    } else {
      setEndLocation(newLocation);
    }
    
    // Clear selection mode
    setSelectionMode(null);
  };

  // --- Smart Route Engine trigger ---
  const handleCalculateRoutes = async () => {
    if (!startLocation || !endLocation) return;

    setIsScanning(true);
    setMobileSheetExpanded(true);

    try {
      // Simulate futuristic AI Grid scanning delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const calculated = await getThemedRoutes(startLocation, endLocation);
      setRoutes(calculated);
      
      // Determine auto-selected route based on settings
      if (emergencySafe) {
        setSelectedRouteId('emergency');
      } else if (preference > 70) {
        setSelectedRouteId('connectivity');
      } else {
        setSelectedRouteId('fastest');
      }
    } catch (err) {
      console.error("Error calculating routes:", err);
    } finally {
      setIsScanning(false);
    }
  };

  // --- Save / Bookmark Path ---
  const handleSaveCurrentPath = async () => {
    if (!startLocation || !endLocation) return;

    // Avoid duplicates
    const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
    const newPathId = `${startLocation.lat.toFixed(4)}-${endLocation.lat.toFixed(4)}-${journeyPurpose}-${preference}`;
    
    if (savedPaths.some(p => p.id === newPathId)) return;

    const routeTitle = `${journeyPurpose}: ${startLocation.name.split('(')[0].trim()} → ${endLocation.name.split('(')[0].trim()}`;

    // 1. Post to our fullstack database!
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-default',
          name: routeTitle,
          start: startLocation,
          end: endLocation,
          coordinates: selectedRoute ? selectedRoute.coordinates : [],
          signalStrength: selectedRoute ? selectedRoute.signalStrength : 80,
          duration: selectedRoute ? selectedRoute.duration : 30,
          distance: selectedRoute ? selectedRoute.distance : 15
        })
      });

      if (response.ok) {
        console.log('Successfully saved corridor to database.');
      }
    } catch (err) {
      console.warn('Failed to post saved route to DB, saving locally in fallback:', err);
    }

    // 2. Local state sync
    const newPath: SavedPath = {
      id: newPathId,
      title: routeTitle,
      start: startLocation,
      end: endLocation,
      purpose: journeyPurpose,
      preference,
      emergencySafe,
      selectedRouteId,
      createdAt: new Date().toISOString()
    };

    const updated = [newPath, ...savedPaths];
    syncSavedPaths(updated);

    // Also persist route directly to offline navigation cache
    if (selectedRoute) {
      cacheRoute(selectedRoute);
      setCachedRoute(getCachedRoute());
    }
  };

  // --- Delete Saved Path ---
  const handleDeleteSavedPath = (id: string) => {
    const updated = savedPaths.filter(p => p.id !== id);
    syncSavedPaths(updated);
  };

  // --- Load Saved Path ---
  const handleLoadSavedPath = async (path: SavedPath) => {
    setStartLocation(path.start);
    setEndLocation(path.end);
    setJourneyPurpose(path.purpose);
    setPreference(path.preference);
    setEmergencySafe(path.emergencySafe);
    
    setIsScanning(true);
    try {
      const calculated = await getThemedRoutes(path.start, path.end);
      setRoutes(calculated);
      setSelectedRouteId(path.selectedRouteId || 'fastest');
    } catch (err) {
      console.error("Error loading path routes:", err);
    } finally {
      setIsScanning(false);
    }
    
    // Set active view to configure
    setActiveTab('configure');
    setMobileSheetExpanded(true);
  };

  const handleResetSearch = () => {
    setStartLocation(null);
    setEndLocation(null);
    setRoutes([]);
    setSelectionMode(null);
  };

  // Check if current configuration matches any saved path
  const isCurrentPathSaved = routes.length > 0 && savedPaths.some(
    p => p.start.lat === startLocation?.lat && 
         p.end.lat === endLocation?.lat &&
         p.purpose === journeyPurpose &&
         p.preference === preference &&
         p.emergencySafe === emergencySafe &&
         p.selectedRouteId === selectedRouteId
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-obsidian text-soft-silver font-sans select-none">
      {/* 1. Header component */}
      <Header 
        onEmergencyClick={() => setIsEmergencyModalOpen(true)} 
        onSimulateDeadZone={() => setIsDeadZoneAlertVisible(prev => !prev)}
        isDeadZoneActive={isDeadZoneAlertVisible}
        isRouteSelected={routes.length > 0 && !!activeRoute}
        isTracking={isTracking}
        onToggleTracking={handleToggleTracking}
        isRouteCached={!!cachedRoute}
        onViewCachedRoute={() => setIsCachedModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isVoiceEnabled={isVoiceEnabled}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isDeviated={isDeviatedActive}
        distanceFromRoute={deviation.distanceFromRoute}
        onToggleSimulatedDeviation={() => setSimulatedDeviation(prev => !prev)}
        onOpenCommunity={() => setActiveTab('bulletins')}
      />

      {/* Route Deviation Alert Banner (Yellow alert when >200m off route) */}
      <RouteDeviationAlert 
        isDeviated={isDeviatedActive}
        distanceMeters={deviation.distanceFromRoute}
        onRecalculate={handleRecalculateRoute}
        onDismiss={() => setDismissDeviation(true)}
        isRecalculating={isRecalculating}
      />

      {/* Settings Modal (Voice Navigation & Offline Management) */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        speech={speech}
        isPWAInstalled={isPWAInstalled}
      />

      {/* Subtle Banner: Resume Cached Route */}
      {showResumeBanner && cachedRoute && (
        <div 
          id="resume-cached-route-banner"
          className="absolute top-20 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-xl z-40 glass rounded-2xl px-4 py-2.5 border border-emerald-500/40 shadow-2xl flex items-center justify-between gap-3 text-xs pointer-events-auto backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm shrink-0">
              📦
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-[11px] truncate flex items-center gap-1.5">
                Resume cached route from {formatCachedTimestamp(cachedRoute.timestamp)}?
                <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/15">
                  {cachedRoute.distance} km
                </span>
              </span>
              <span className="text-[10px] text-muted-slate truncate font-sans">
                {cachedRoute.name} • {cachedRoute.turnsCount} turns stored offline
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="resume-cached-route-banner-btn"
              onClick={() => handleResumeRoute(cachedRoute)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-obsidian font-bold text-[11px] hover:bg-emerald-400 transition-all cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              Resume
            </button>
            <button
              id="view-cached-route-banner-btn"
              onClick={() => setIsCachedModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] border border-white/10 transition-all cursor-pointer"
            >
              View Route
            </button>
            <button
              id="dismiss-cached-banner-btn"
              onClick={() => setShowResumeBanner(false)}
              className="p-1.5 rounded-lg text-muted-slate hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Dismiss Banner"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Geolocation Permission / Status Notification */}
      {geoError && isTracking && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-coral-glow/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xl border border-coral-glow">
          <AlertTriangle size={14} className="shrink-0 animate-pulse" />
          <span>GPS Tracking: {geoError}</span>
          <button 
            onClick={stopTracking} 
            className="ml-2 text-white/80 hover:text-white underline text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Emergency Hotline Modal */}
      <EmergencyPanel 
        isOpen={isEmergencyModalOpen} 
        onClose={() => setIsEmergencyModalOpen(false)} 
      />

      {/* Cached Route Inspection Modal */}
      <CachedRouteModal 
        isOpen={isCachedModalOpen}
        onClose={() => setIsCachedModalOpen(false)}
        cachedRoute={cachedRoute}
        onResumeRoute={handleResumeRoute}
        onClearCache={handleClearCache}
      />

      {/* Real-time GPS Proximity Alert for Dead Zones */}
      {activeRoute && activeRoute.deadZones && activeRoute.deadZones.length > 0 && (
        <ProximityAlert 
          userLocation={userLocation}
          deadZones={activeRoute.deadZones}
          onCacheRoute={handleSaveCurrentPath}
        />
      )}

      {/* DeadZoneAlert glowing banner with Journey Prep Mode */}
      <DeadZoneAlert 
        isVisible={isDeadZoneAlertVisible} 
        onDismiss={() => setIsDeadZoneAlertVisible(false)} 
        locationName={startLocation?.name ? `${startLocation.name.split('(')[0].trim()} Corridor` : 'Bhongir Rural Valley'}
        onCacheNavigation={() => {
          handleSaveCurrentPath();
          const refreshed = getCachedRoute();
          if (refreshed) {
            setCachedRoute(refreshed);
          }
        }}
        activeRoute={activeRoute}
        speak={speak}
      />

      {/* 2. Interactive Map Container (Full Screen Background) */}
      <main className="w-full h-full z-0">
        <MapCanvas 
          startLocation={startLocation}
          endLocation={endLocation}
          selectedRoute={activeRoute}
          onSelectCoordinates={handleMapSelection}
          selectionMode={selectionMode}
          userLocation={effectiveLocation || userLocation}
          isTracking={isTracking || simulatedDeviation}
        />
      </main>

      {/* 3. Interactive Floating Controls Panel */}
      <div className={`absolute z-30 pointer-events-none transition-all duration-300
        ${isMobile 
          ? 'left-0 right-0 bottom-0 max-h-[85%]' 
          : 'left-4 top-24 bottom-4 w-[420px]'
        }
      `}>
        <div className={`w-full h-full flex flex-col justify-end pointer-events-auto p-4 md:p-0`}>
          
          {/* ConnectivityTimeline sits just above side panel on desktop */}
          {!isMobile && activeRoute && activeTab === 'configure' && (
            <div className="w-full mb-3 shrink-0">
              <ConnectivityTimeline route={activeRoute} />
            </div>
          )}

          {/* Desktop Frame Container */}
          {!isMobile ? (
            <Card variant="glass" className="w-full h-full max-h-[72vh] flex flex-col overflow-hidden pointer-events-auto shadow-2xl">
              
              {/* Primary Tab Navigation — Clean & Human */}
              <div 
                className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl mb-2.5 shrink-0"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  id="tab-configure-btn"
                  onClick={() => setActiveTab('configure')}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:opacity-95 active:scale-95"
                  style={{
                    background: activeTab === 'configure' ? 'var(--accent)' : 'transparent',
                    color: activeTab === 'configure' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'configure' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Sliders size={14} />
                  {t('routes', 'Routes')}
                </button>
                <button
                  id="tab-bulletins-btn"
                  onClick={() => setActiveTab('bulletins')}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:opacity-95 active:scale-95"
                  style={{
                    background: activeTab === 'bulletins' ? 'var(--accent)' : 'transparent',
                    color: activeTab === 'bulletins' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'bulletins' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Radio size={14} />
                  {t('community', 'Community')}
                </button>
                <button
                  id="tab-bookmarks-btn"
                  onClick={() => setActiveTab('bookmarks')}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:opacity-95 active:scale-95"
                  style={{
                    background: activeTab === 'bookmarks' ? 'var(--accent)' : 'transparent',
                    color: activeTab === 'bookmarks' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: activeTab === 'bookmarks' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Bookmark size={14} />
                  {t('saved', 'Saved')}
                </button>
              </div>

              {/* Secondary Navigation Tools (Analytics, Accuracy, Convoy) */}
              <div className="flex items-center justify-between px-1 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    id="tab-analytics-btn"
                    onClick={() => setActiveTab(activeTab === 'analytics' ? 'configure' : 'analytics')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer hover:opacity-90"
                    style={{
                      background: activeTab === 'analytics' ? 'var(--accent-subtle)' : 'var(--bg-input)',
                      border: `1px solid ${activeTab === 'analytics' ? 'var(--accent-border)' : 'var(--border)'}`,
                      color: activeTab === 'analytics' ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <Activity size={12} />
                    {t('analytics', 'Analytics')}
                  </button>
                  <button
                    id="tab-accuracy-btn"
                    onClick={() => setActiveTab(activeTab === 'accuracy' ? 'configure' : 'accuracy')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer hover:opacity-90"
                    style={{
                      background: activeTab === 'accuracy' ? 'var(--accent-subtle)' : 'var(--bg-input)',
                      border: `1px solid ${activeTab === 'accuracy' ? 'var(--accent-border)' : 'var(--border)'}`,
                      color: activeTab === 'accuracy' ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <ShieldCheck size={12} />
                    {t('accuracy', 'Accuracy')}
                  </button>
                </div>

                <button
                  id="tab-convoy-btn"
                  onClick={() => setActiveTab(activeTab === 'convoy' ? 'configure' : 'convoy')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer hover:opacity-90"
                  style={{
                    background: activeTab === 'convoy' ? 'var(--accent-subtle)' : 'var(--bg-input)',
                    border: `1px solid ${activeTab === 'convoy' ? 'var(--accent-border)' : 'var(--border)'}`,
                    color: activeTab === 'convoy' ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  <Users size={12} />
                  {t('convoy', 'Convoy')}
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                {activeTab === 'configure' ? (
                  <>
                    {/* View Offline Cached Route Button (Desktop) */}
                    {cachedRoute && (
                      <button
                        id="view-cached-route-btn-desktop"
                        onClick={() => setIsCachedModalOpen(true)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer group shrink-0"
                        style={{
                          background: 'var(--green-subtle)',
                          border: '1px solid var(--green-border)',
                          color: 'var(--green)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md text-xs" style={{ background: 'var(--green-subtle)' }}>📦</span>
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] font-sans font-extrabold" style={{ color: 'var(--text-primary)' }}>
                              View Cached Route ({cachedRoute.distance} km)
                            </span>
                            <span className="text-[9px] font-sans" style={{ color: 'var(--text-secondary)' }}>
                              {cachedRoute.name} • {cachedRoute.turnsCount} turns
                            </span>
                          </div>
                        </div>
                        <span 
                          className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                          style={{
                            background: 'var(--green-subtle)',
                            border: '1px solid var(--green-border)',
                            color: 'var(--green)',
                          }}
                        >
                          {t('offline_ready', 'Offline Ready')}
                        </span>
                      </button>
                    )}

                    {routes.length === 0 ? (
                      <div className="flex flex-col gap-3">
                        <SearchPanel
                          startLocation={startLocation}
                          setStartLocation={setStartLocation}
                          endLocation={endLocation}
                          setEndLocation={setEndLocation}
                          journeyPurpose={journeyPurpose}
                          setJourneyPurpose={setJourneyPurpose}
                          preference={preference}
                          setPreference={setPreference}
                          emergencySafe={emergencySafe}
                          setEmergencySafe={setEmergencySafe}
                          onSearch={handleCalculateRoutes}
                          selectionMode={selectionMode}
                          setSelectionMode={setSelectionMode}
                        />
                      </div>
                    ) : (
                      <RouteResults
                        routes={routes}
                        selectedRouteId={selectedRouteId}
                        setSelectedRouteId={setSelectedRouteId}
                        onSave={handleSaveCurrentPath}
                        isSaved={isCurrentPathSaved}
                        onReset={handleResetSearch}
                      />
                    )}
                  </>
                ) : activeTab === 'convoy' ? (
                  <ConvoyPanel />
                ) : activeTab === 'bulletins' ? (
                  <CommunityReports />
                ) : activeTab === 'analytics' ? (
                  <UserAnalytics />
                ) : activeTab === 'accuracy' ? (
                  <PredictionAccuracy />
                ) : (
                  <SavedPathsList
                    savedPaths={savedPaths}
                    onLoadPath={handleLoadSavedPath}
                    onDeletePath={handleDeleteSavedPath}
                  />
                )}
              </div>
            </Card>
          ) : (
            /* --- Mobile Bottom Sheet (Fully animated & collapsible) --- */
            <div className="w-full flex flex-col gap-2 pointer-events-auto">
              {/* ConnectivityTimeline sits just above bottom sheet on mobile */}
              {activeRoute && activeTab === 'configure' && mobileSheetExpanded && (
                <div className="w-full shrink-0 px-1">
                  <ConnectivityTimeline route={activeRoute} />
                </div>
              )}

              <motion.div
                layout
                animate={{ height: mobileSheetExpanded ? 'auto' : '52px' }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="rounded-t-3xl border-t border-x shadow-2xl flex flex-col max-h-[75vh] overflow-hidden pointer-events-auto"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {/* Drag/Click Handle Header */}
                <div 
                  id="mobile-drag-handle"
                  onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)}
                  className="w-full py-3.5 flex flex-col items-center justify-center cursor-pointer select-none shrink-0"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="w-10 h-1 rounded-full mb-1" style={{ background: 'var(--border-strong)' }} />
                  <span className="text-[10px] font-sans font-semibold tracking-wide flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    {mobileSheetExpanded ? (
                      <>
                        <ChevronDown size={11} /> {t('collapse', 'Collapse')}
                      </>
                    ) : (
                      <>
                        <ChevronUp size={11} /> {t('show_options', 'Show options')}
                      </>
                    )}
                  </span>
                </div>

                {/* Expanded contents */}
                {mobileSheetExpanded && (
                  <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[50vh]">
                    {/* Segmented Tab controls (Mobile) */}
                    <div 
                      className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl shrink-0"
                      style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <button
                        id="mobile-tab-config"
                        onClick={() => setActiveTab('configure')}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        style={{
                          background: activeTab === 'configure' ? 'var(--accent)' : 'transparent',
                          color: activeTab === 'configure' ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        <Sliders size={13} />
                        {t('routes', 'Routes')}
                      </button>
                      <button
                        id="mobile-tab-bulletins"
                        onClick={() => setActiveTab('bulletins')}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        style={{
                          background: activeTab === 'bulletins' ? 'var(--accent)' : 'transparent',
                          color: activeTab === 'bulletins' ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        <Radio size={13} />
                        {t('community', 'Community')}
                      </button>
                      <button
                        id="mobile-tab-bookmarks"
                        onClick={() => setActiveTab('bookmarks')}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        style={{
                          background: activeTab === 'bookmarks' ? 'var(--accent)' : 'transparent',
                          color: activeTab === 'bookmarks' ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        <Bookmark size={13} />
                        {t('saved', 'Saved')}
                      </button>
                    </div>

                    {/* Mobile Utilities */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveTab(activeTab === 'analytics' ? 'configure' : 'analytics')}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          style={{
                            background: activeTab === 'analytics' ? 'var(--accent-subtle)' : 'var(--bg-input)',
                            color: activeTab === 'analytics' ? 'var(--accent)' : 'var(--text-secondary)',
                            border: `1px solid ${activeTab === 'analytics' ? 'var(--accent-border)' : 'var(--border)'}`
                          }}
                        >
                          <Activity size={12} />
                          {t('analytics', 'Analytics')}
                        </button>
                        <button
                          onClick={() => setActiveTab(activeTab === 'accuracy' ? 'configure' : 'accuracy')}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          style={{
                            background: activeTab === 'accuracy' ? 'var(--accent-subtle)' : 'var(--bg-input)',
                            color: activeTab === 'accuracy' ? 'var(--accent)' : 'var(--text-secondary)',
                            border: `1px solid ${activeTab === 'accuracy' ? 'var(--accent-border)' : 'var(--border)'}`
                          }}
                        >
                          <ShieldCheck size={12} />
                          {t('accuracy', 'Accuracy')}
                        </button>
                      </div>
                      <button
                        onClick={() => setActiveTab(activeTab === 'convoy' ? 'configure' : 'convoy')}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        style={{
                          background: activeTab === 'convoy' ? 'var(--accent-subtle)' : 'var(--bg-input)',
                          color: activeTab === 'convoy' ? 'var(--accent)' : 'var(--text-secondary)',
                          border: `1px solid ${activeTab === 'convoy' ? 'var(--accent-border)' : 'var(--border)'}`
                        }}
                      >
                        <Users size={12} />
                        {t('convoy', 'Convoy')}
                      </button>
                    </div>

                    {activeTab === 'configure' ? (
                      <>
                        {/* View Offline Cached Route Button (Mobile) */}
                        {cachedRoute && (
                          <button
                            id="view-cached-route-btn-mobile"
                            onClick={() => setIsCachedModalOpen(true)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer group shrink-0"
                            style={{
                              background: 'var(--green-subtle)',
                              border: '1px solid var(--green-border)',
                              color: 'var(--green)',
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded-md text-xs" style={{ background: 'var(--green-subtle)' }}>📦</span>
                              <div className="flex flex-col text-left">
                                <span className="text-[11px] font-sans font-extrabold" style={{ color: 'var(--text-primary)' }}>
                                  View Cached Route ({cachedRoute.distance} km)
                                </span>
                                <span className="text-[9px] font-sans" style={{ color: 'var(--text-secondary)' }}>
                                  {cachedRoute.name} • {cachedRoute.turnsCount} turns
                                </span>
                              </div>
                            </div>
                            <span 
                              className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                              style={{
                                background: 'var(--green-subtle)',
                                border: '1px solid var(--green-border)',
                                color: 'var(--green)',
                              }}
                            >
                              {t('offline_ready', 'Offline Ready')}
                            </span>
                          </button>
                        )}

                        {routes.length === 0 ? (
                          <SearchPanel
                            startLocation={startLocation}
                            setStartLocation={setStartLocation}
                            endLocation={endLocation}
                            setEndLocation={setEndLocation}
                            journeyPurpose={journeyPurpose}
                            setJourneyPurpose={setJourneyPurpose}
                            preference={preference}
                            setPreference={setPreference}
                            emergencySafe={emergencySafe}
                            setEmergencySafe={setEmergencySafe}
                            onSearch={handleCalculateRoutes}
                            selectionMode={selectionMode}
                            setSelectionMode={setSelectionMode}
                          />
                        ) : (
                          <RouteResults
                            routes={routes}
                            selectedRouteId={selectedRouteId}
                            setSelectedRouteId={setSelectedRouteId}
                            onSave={handleSaveCurrentPath}
                            isSaved={isCurrentPathSaved}
                            onReset={handleResetSearch}
                          />
                        )}
                      </>
                    ) : activeTab === 'convoy' ? (
                      <ConvoyPanel />
                    ) : activeTab === 'bulletins' ? (
                      <CommunityReports />
                    ) : activeTab === 'analytics' ? (
                      <UserAnalytics />
                    ) : activeTab === 'accuracy' ? (
                      <PredictionAccuracy />
                    ) : (
                      <SavedPathsList
                        savedPaths={savedPaths}
                        onLoadPath={handleLoadSavedPath}
                        onDeletePath={handleDeleteSavedPath}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Route Calculation Loading Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden select-none"
            style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(16px)' }}
          >
            {/* Subtle animated background grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <pattern id="grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              </svg>
            </div>

            {/* Animated scan line */}
            <motion.div
              animate={{ y: ['-10vh', '110vh'] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-px pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to right, transparent, var(--accent), transparent)',
                boxShadow: '0 0 12px var(--accent)',
                opacity: 0.6,
              }}
            />

            {/* Scanning Target */}
            <div className="relative flex items-center justify-center w-32 h-32">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl" style={{ borderColor: 'var(--accent)' }} />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr" style={{ borderColor: 'var(--accent)' }} />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl" style={{ borderColor: 'var(--accent)' }} />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br" style={{ borderColor: 'var(--accent)' }} />

              <motion.div
                animate={{ scale: [0.88, 1.04, 0.88], opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute inset-3 rounded-full"
                style={{ border: '1px solid var(--accent-border)' }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-dashed"
                style={{ border: '1px dashed var(--accent-border)' }}
              />
              <div
                className="relative w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--accent-border)',
                  boxShadow: '0 0 20px var(--accent-subtle)',
                }}
              >
                <Activity size={22} style={{ color: 'var(--accent)' }} className="animate-pulse" />
              </div>
            </div>

            {/* Status text */}
            <div className="text-center flex flex-col items-center gap-2 z-20">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: 'var(--accent)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                {t('search_routes', 'Searching routes')}
              </span>
              <h2 className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                {t('checking_signal', 'Checking signal coverage...')}
              </h2>
              <div
                className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-lg mt-1"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ color: 'var(--accent)' }}>Coverage map</span> loading...
                <span style={{ color: 'var(--border-strong)' }}>|</span>
                <span style={{ color: 'var(--green)' }}>3 carriers</span> checked
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
