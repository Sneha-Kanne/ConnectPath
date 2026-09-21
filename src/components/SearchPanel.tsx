import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  ArrowUpDown, 
  Navigation, 
  Clock, 
  Wifi, 
  ShieldAlert, 
  Compass, 
  Search,
  X,
  Map
} from 'lucide-react';
import { JourneyPurpose, LocationData } from '../types';
import { TELANGANA_PRESET_LOCATIONS } from '../data/presets';
import { popularRoutes, getCoordinates, telanganaLocations } from '../lib/telanganaLocations';
import { indiaLocations, indiaPopularRoutes } from '../lib/indiaLocations';
import { Button } from './Button';
import { useLanguage } from '../hooks/useLanguage';
import { getLocalizedLocationName } from '../lib/themedLocationNames';

interface SearchPanelProps {
  startLocation: LocationData | null;
  setStartLocation: (loc: LocationData | null) => void;
  endLocation: LocationData | null;
  setEndLocation: (loc: LocationData | null) => void;
  journeyPurpose: JourneyPurpose;
  setJourneyPurpose: (purpose: JourneyPurpose) => void;
  preference: number;
  setPreference: (pref: number) => void;
  emergencySafe: boolean;
  setEmergencySafe: (safe: boolean) => void;
  onSearch: () => void;
  selectionMode: 'start' | 'end' | null;
  setSelectionMode: (mode: 'start' | 'end' | null) => void;
}

const JOURNEY_OPTIONS: JourneyPurpose[] = [
  'Daily Commute', 
  'Business', 
  'Road Trip', 
  'Delivery', 
  'Emergency', 
  'Custom'
];

export const SearchPanel: React.FC<SearchPanelProps> = ({
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  journeyPurpose,
  setJourneyPurpose,
  preference,
  setPreference,
  emergencySafe,
  setEmergencySafe,
  onSearch,
  selectionMode,
  setSelectionMode,
}) => {
  const { language, t } = useLanguage();
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  
  const [showStartPresets, setShowStartPresets] = useState(false);
  const [showEndPresets, setShowEndPresets] = useState(false);

  const startContainerRef = useRef<HTMLDivElement>(null);
  const endContainerRef = useRef<HTMLDivElement>(null);

  // Sync state if locations are changed externally (e.g. from clicking on map)
  useEffect(() => {
    if (startLocation) {
      setStartQuery(getLocalizedLocationName(startLocation.name, language));
    } else {
      setStartQuery('');
    }
  }, [startLocation, language]);

  useEffect(() => {
    if (endLocation) {
      setEndQuery(getLocalizedLocationName(endLocation.name, language));
    } else {
      setEndQuery('');
    }
  }, [endLocation, language]);

  // Click outside presets handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startContainerRef.current && !startContainerRef.current.contains(event.target as Node)) {
        setShowStartPresets(false);
      }
      if (endContainerRef.current && !endContainerRef.current.contains(event.target as Node)) {
        setShowEndPresets(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwap = () => {
    const tempLoc = startLocation;
    const tempQuery = startQuery;
    
    setStartLocation(endLocation);
    setStartQuery(endQuery);
    
    setEndLocation(tempLoc);
    setEndQuery(tempQuery);
  };

  // Combined location database: Telangana presets + Telangana locations + India locations (deduped by name)
  const ALL_LOCATIONS = React.useMemo(() => {
    const seen = new Set<string>();
    const combined: { name: string; lat: number; lng: number }[] = [];

    // Seed with preset locations first (highest priority)
    for (const loc of TELANGANA_PRESET_LOCATIONS) {
      if (!seen.has(loc.name)) {
        seen.add(loc.name);
        combined.push(loc);
      }
    }
    // Add remaining Telangana locations
    for (const [name, coords] of Object.entries(telanganaLocations)) {
      if (!seen.has(name)) {
        seen.add(name);
        combined.push({ name, lat: coords.lat, lng: coords.lng });
      }
    }
    // Add India-wide locations
    for (const [name, coords] of Object.entries(indiaLocations)) {
      if (!seen.has(name)) {
        seen.add(name);
        combined.push({ name, lat: coords.lat, lng: coords.lng });
      }
    }
    return combined;
  }, []);

  const resolveCoords = (name: string): { lat: number; lng: number } | null => {
    // Try Telangana first
    const tCoords = getCoordinates(name);
    if (tCoords) return tCoords;
    // Then India
    const searchName = name.toLowerCase().trim();
    for (const [key, coords] of Object.entries(indiaLocations)) {
      if (key.toLowerCase() === searchName) return coords;
    }
    for (const [key, coords] of Object.entries(indiaLocations)) {
      if (key.toLowerCase().includes(searchName)) return coords;
    }
    return null;
  };

  const handlePopularRouteSelect = (from: string, to: string) => {
    const fromCoords = resolveCoords(from);
    const toCoords = resolveCoords(to);
    if (fromCoords) {
      setStartLocation({ name: from, lat: fromCoords.lat, lng: fromCoords.lng });
      setStartQuery(getLocalizedLocationName(from, language));
    }
    if (toCoords) {
      setEndLocation({ name: to, lat: toCoords.lat, lng: toCoords.lng });
      setEndQuery(getLocalizedLocationName(to, language));
    }
  };

  const filteredStartPresets = ALL_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(startQuery.toLowerCase()) ||
    getLocalizedLocationName(loc.name, language).toLowerCase().includes(startQuery.toLowerCase())
  ).slice(0, 8);

  const filteredEndPresets = ALL_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(endQuery.toLowerCase()) ||
    getLocalizedLocationName(loc.name, language).toLowerCase().includes(endQuery.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="flex flex-col gap-5 w-full max-w-full">
      {/* 1. Location Inputs Stack */}
      <div className="relative flex flex-col gap-3">
        {/* Starting Location */}
        <div ref={startContainerRef} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }}>
                <MapPin size={18} />
              </span>
              <input
                id="start-location-input"
                type="text"
                placeholder={t('starting_location', 'Starting Location...')}
                value={startQuery}
                onChange={(e) => {
                  setStartQuery(e.target.value);
                  setShowStartPresets(true);
                  if (!e.target.value) setStartLocation(null);
                }}
                onFocus={() => {
                  setShowStartPresets(true);
                  setShowEndPresets(false);
                }}
                className="w-full rounded-xl pl-11 pr-10 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  background: 'var(--bg-input)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
              {startQuery && (
                <button
                  id="clear-start-btn"
                  onClick={() => {
                    setStartQuery('');
                    setStartLocation(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Map selection trigger */}
            <button
              id="select-start-map-btn"
              onClick={() => setSelectionMode(selectionMode === 'start' ? null : 'start')}
              className="p-3 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
              style={{
                background: selectionMode === 'start' ? 'var(--accent-subtle)' : 'var(--bg-input)',
                border: `1.5px solid ${selectionMode === 'start' ? 'var(--accent)' : 'var(--border)'}`,
                color: selectionMode === 'start' ? 'var(--accent)' : 'var(--text-muted)',
              }}
              title={t('select_start_map', 'Select starting point on map')}
            >
              <Map size={18} />
            </button>
          </div>

          {/* Autocomplete Suggestion Dropdown */}
          <AnimatePresence>
            {showStartPresets && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-14 mt-1.5 max-h-52 overflow-y-auto rounded-xl z-50 p-1"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {filteredStartPresets.length > 0 ? (
                  filteredStartPresets.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => {
                        setStartLocation(loc);
                        setStartQuery(getLocalizedLocationName(loc.name, language));
                        setShowStartPresets(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Navigation size={12} style={{ color: 'var(--accent)', opacity: 0.7 }} className="rotate-45" />
                      {getLocalizedLocationName(loc.name, language)}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('custom_address_hint', 'Type a custom address or tap map button to pin')}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Swap Button (floating gracefully in the middle side) */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 z-20">
          <motion.button
            id="swap-locations-btn"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwap}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--accent)',
              boxShadow: 'var(--shadow-sm)',
            }}
            title={t('swap_locations', 'Swap locations')}
          >
            <ArrowUpDown size={14} />
          </motion.button>
        </div>

        {/* Destination Location */}
        <div ref={endContainerRef} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--red)' }}>
                <MapPin size={18} />
              </span>
              <input
                id="end-location-input"
                type="text"
                placeholder={t('destination', 'Destination...')}
                value={endQuery}
                onChange={(e) => {
                  setEndQuery(e.target.value);
                  setShowEndPresets(true);
                  if (!e.target.value) setEndLocation(null);
                }}
                onFocus={() => {
                  setShowEndPresets(true);
                  setShowStartPresets(false);
                }}
                className="w-full rounded-xl pl-11 pr-10 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  background: 'var(--bg-input)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; }}
                onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
              {endQuery && (
                <button
                  id="clear-end-btn"
                  onClick={() => {
                    setEndQuery('');
                    setEndLocation(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Map selection trigger */}
            <button
              id="select-end-map-btn"
              onClick={() => setSelectionMode(selectionMode === 'end' ? null : 'end')}
              className="p-3 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
              style={{
                background: selectionMode === 'end' ? 'var(--red-subtle)' : 'var(--bg-input)',
                border: `1.5px solid ${selectionMode === 'end' ? 'var(--red)' : 'var(--border)'}`,
                color: selectionMode === 'end' ? 'var(--red)' : 'var(--text-muted)',
              }}
              title={t('select_destination_map', 'Select destination on map')}
            >
              <Map size={18} />
            </button>
          </div>

          {/* Autocomplete Suggestion Dropdown */}
          <AnimatePresence>
            {showEndPresets && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-14 mt-1.5 max-h-52 overflow-y-auto rounded-xl z-50 p-1"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {filteredEndPresets.length > 0 ? (
                  filteredEndPresets.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => {
                        setEndLocation(loc);
                        setEndQuery(getLocalizedLocationName(loc.name, language));
                        setShowEndPresets(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Navigation size={12} style={{ color: 'var(--red)', opacity: 0.7 }} className="rotate-45" />
                      {getLocalizedLocationName(loc.name, language)}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('custom_address_hint', 'Type a custom address or tap map button to pin')}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Routes Section */}
      <div className="flex flex-col gap-3">
        {/* Telangana Routes */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-semibold tracking-wide flex items-center gap-1.5"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
            {t('popular_routes', 'Popular Routes in Telangana')}
          </label>
          <div className="flex gap-2.5 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
            {popularRoutes.map((route, idx) => {
              const isRouteActive =
                startLocation?.name === route.from &&
                endLocation?.name === route.to;
              return (
                <button
                  key={idx}
                  onClick={() => handlePopularRouteSelect(route.from, route.to)}
                  className="px-3.5 py-2 shrink-0 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-95"
                  style={{
                    background: isRouteActive ? 'var(--accent-subtle)' : 'var(--bg-input)',
                    border: `1px solid ${isRouteActive ? 'var(--accent-border)' : 'var(--border)'}`,
                    color: isRouteActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {route.label.split(' ⇆ ').map((place, placeIndex) => (
                    <React.Fragment key={`${place}-${placeIndex}`}>
                      {placeIndex > 0 && ' ⇆ '}
                      {getLocalizedLocationName(place, language)}
                    </React.Fragment>
                  ))}
                </button>
              );
            })}
          </div>
        </div>

        {/* India Routes */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-semibold tracking-wide flex items-center gap-1.5"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
            {t('interstate_highways', 'Interstate Highways')}
          </label>
          <div className="flex gap-2.5 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
            {indiaPopularRoutes.map((route, idx) => {
              const isRouteActive =
                startLocation?.name === route.from &&
                endLocation?.name === route.to;
              return (
                <button
                  key={idx}
                  onClick={() => handlePopularRouteSelect(route.from, route.to)}
                  className="px-3.5 py-2 shrink-0 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-95"
                  style={{
                    background: isRouteActive ? 'var(--green-subtle)' : 'var(--bg-input)',
                    border: `1px solid ${isRouteActive ? 'var(--green-border)' : 'var(--border)'}`,
                    color: isRouteActive ? 'var(--green)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {route.label.split(' ⇆ ').map((place, placeIndex) => (
                    <React.Fragment key={`${place}-${placeIndex}`}>
                      {placeIndex > 0 && ' ⇆ '}
                      {getLocalizedLocationName(place.replace(' (Taj Mahal)', ''), language)}
                      {place.includes(' (Taj Mahal)') && ' (Taj Mahal)'}
                    </React.Fragment>
                  ))}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Journey Purpose */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-semibold tracking-wide flex items-center gap-1.5"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
        >
          <Compass size={15} style={{ color: 'var(--accent)' }} />
          {t('trip_type', 'Trip Type')}
        </label>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {JOURNEY_OPTIONS.map((opt) => {
            const isSelected = journeyPurpose === opt;
            return (
              <button
                key={opt}
                id={`journey-purpose-${opt.toLowerCase().replace(' ', '-')}`}
                onClick={() => setJourneyPurpose(opt)}
                className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-95"
                style={{
                  background: isSelected ? 'var(--accent)' : 'var(--bg-input)',
                  border: `1px solid ${isSelected ? 'transparent' : 'var(--border)'}`,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 600 : 500,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Route Preference Slider */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-xs font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--red)' }}>
            <Clock size={14} />
            {t('fastest_route', 'Fastest Route')}
          </span>
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--accent)' }}>
            <Wifi size={14} />
            {t('best_signal', 'Best Signal')}
          </span>
        </div>
        
        <div className="relative w-full flex items-center py-2">
          <div
            className="absolute left-0 right-0 h-2 rounded-full"
            style={{
              background: 'linear-gradient(to right, var(--red), var(--accent))',
              opacity: 0.85,
            }}
          />

          <input
            id="route-preference-slider"
            type="range"
            min="0"
            max="100"
            value={preference}
            onChange={(e) => setPreference(Number(e.target.value))}
            className="relative w-full h-2 bg-transparent appearance-none cursor-pointer outline-none focus:outline-none focus:ring-0
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:scale-125
            "
            style={{ accentColor: 'var(--accent)' }}
          />
        </div>
        
        <div
          className="text-xs text-center font-normal"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
        >
          {preference < 30 && t('direct_highways', 'Prefers direct highways for minimum driving time')}
          {preference >= 30 && preference <= 70 && t('balanced_route', 'A practical balance of travel time and signal coverage')}
          {preference > 70 && t('strong_reception', 'Prioritizes strong cellular reception and avoids dead zones')}
        </div>
      </div>

      {/* 4. Emergency Toggle */}
      <div
        className="flex items-center justify-between p-3.5 rounded-2xl transition-colors"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="p-2.5 rounded-xl transition-colors"
            style={{
              background: emergencySafe ? 'var(--red-subtle)' : 'var(--bg-hover)',
              color: emergencySafe ? 'var(--red)' : 'var(--text-muted)',
            }}
          >
            <ShieldAlert size={18} />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
              {t('emergency_safe_route', 'Emergency Safe Route')}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              {t('avoid_weak_signal', 'Avoids known weak-signal areas when possible')}
            </span>
          </div>
        </div>

        <button
          id="emergency-toggle-btn"
          onClick={() => setEmergencySafe(!emergencySafe)}
          className="w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer"
          style={{ background: emergencySafe ? 'var(--red)' : 'var(--border-strong)' }}
        >
          <motion.div
            layout
            className="w-5.5 h-5.5 rounded-full bg-white shadow-md"
            animate={{ x: emergencySafe ? 22 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* 5. Search Button */}
      <Button
        id="find-smart-route-btn"
        variant={emergencySafe ? 'coral' : 'primary'}
        size="lg"
        fullWidth
        onClick={onSearch}
        disabled={!startLocation || !endLocation}
      >
        <Search size={18} />
        {t('find_route', 'Find Route')}
      </Button>
    </div>
  );
};
