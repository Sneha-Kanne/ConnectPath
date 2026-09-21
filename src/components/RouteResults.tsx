import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MapPin, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Bookmark, 
  BookmarkCheck,
  Zap,
  Radio,
  Sparkles,
  Mountain,
  CloudRain,
  Coffee,
  ShieldCheck,
  Fuel,
  Utensils,
  Flag,
  CloudLightning,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { RouteOption, PointOfInterest } from '../types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Button } from './Button';
import { RestStopsModal } from './RestStopsModal';
import { JourneyFeedbackModal } from './JourneyFeedbackModal';
import { useLanguage } from '../hooks/useLanguage';
import { getRouteAccuracy } from '../lib/feedbackService';
import { localizeLocationText } from '../lib/themedLocationNames';

interface RouteResultsProps {
  routes: RouteOption[];
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
  onSave: () => void;
  isSaved: boolean;
  onReset: () => void;
  onSelectPoi?: (poi: PointOfInterest) => void;
}

const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
};

const getProviderBadge = (provider?: 'Jio' | 'Airtel' | 'Vi' | 'BSNL') => {
  const p = provider || 'Jio';
  const colors = {
    Jio: 'bg-[#0A3D91]/20 border-[#0A3D91]/60 text-[#85b2ff]',
    Airtel: 'bg-[#E40000]/20 border-[#E40000]/60 text-[#ff8080]',
    Vi: 'bg-[#FFD700]/10 border-[#FFD700]/50 text-[#ffd700]',
    BSNL: 'bg-[#00843D]/20 border-[#00843D]/60 text-[#73e691]'
  };
  return (
    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-sans font-extrabold tracking-wider uppercase ${colors[p]}`}>
      {p} 5G
    </span>
  );
};

export const RouteResults: React.FC<RouteResultsProps> = ({
  routes,
  selectedRouteId,
  setSelectedRouteId,
  onSave,
  isSaved,
  onReset,
  onSelectPoi,
}) => {
  const { language, t } = useLanguage();
  const [isStopsModalOpen, setIsStopsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // Check if selected route has severe weather warning
  const hasSevereWeather = selectedRoute?.weatherSummary?.hasSevereWeather;
  const severeNotice = selectedRoute?.weatherSummary?.severeWeatherAlert;

  // Accuracy details
  const accuracyInfo = selectedRoute ? getRouteAccuracy(selectedRoute.name) : null;

  return (
    <div className="flex flex-col gap-3.5 w-full text-left">
      {/* Rest Stops Modal */}
      <RestStopsModal
        isOpen={isStopsModalOpen}
        onClose={() => setIsStopsModalOpen(false)}
        pois={selectedRoute?.pointsOfInterest || []}
        routeName={selectedRoute?.name}
        onSelectPoi={onSelectPoi}
      />

      {/* Journey Feedback Modal */}
      <JourneyFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        route={selectedRoute}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-sans)' }}
          >
            <Sparkles size={11} style={{ color: 'var(--accent)' }} />
            {t('corridor_selection', 'Route options')}
          </span>
          <h3
            className="text-xs font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          >
            {t('select_corridor', 'Choose a route')}
          </h3>
        </div>

        <button
          id="new-search-btn"
          onClick={onReset}
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={12} />
          {t('back_to_search', 'Back to Search')}
        </button>
      </div>

      {/* Severe Weather Warning Banner (Task 4) */}
      <AnimatePresence>
        {hasSevereWeather && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl flex items-start gap-2.5"
            style={{
              background: 'var(--amber-subtle)',
              border: '1px solid var(--amber-border)',
              color: 'var(--amber)',
            }}
          >
            <CloudLightning className="shrink-0 mt-0.5" size={16} style={{ color: 'var(--amber)' }} />
            <div className="flex-1">
              <span className="text-[11px] font-bold block" style={{ color: 'var(--text-primary)' }}>
                {t('weather_warning_title', 'Weather Alert: Heavy Precipitation Detected')}
              </span>
              <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--amber)' }}>
                {severeNotice || t('severe_weather_banner', 'Heavy rain is forecast on this route. Consider another route.')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical list of route options */}
      <div className="flex flex-col gap-3">
        {routes.map((route, idx) => {
          const isSelected = route.id === selectedRouteId;
          const isRecommended = idx === 1;
          const deadZonesCount = route.deadZonesCount !== undefined ? route.deadZonesCount : (route.id === 'fastest' ? 2 : 0);
          const routeHealth = route.routeHealth !== undefined ? route.routeHealth : (route.id === 'fastest' ? 68 : route.id === 'connectivity' ? 95 : 99);
          const confidenceScore = route.confidenceScore !== undefined ? route.confidenceScore : (route.id === 'fastest' ? 76 : route.id === 'connectivity' ? 94 : 98);
          const prov = route.bestProvider || 'Jio';
          const weather = route.weatherSummary;
          const accuracy = getRouteAccuracy(route.name);
          const displayRouteName = localizeLocationText(route.name, language);

          return (
            <motion.div
              key={route.id}
              id={`route-option-card-${route.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              onClick={() => setSelectedRouteId(route.id)}
              className="p-3.5 rounded-2xl cursor-pointer select-none transition-all duration-200 relative flex flex-col gap-2.5"
              style={{
                background: isSelected
                  ? isRecommended ? 'var(--accent-subtle)' : 'var(--bg-hover)'
                  : 'var(--bg-input)',
                border: `1.5px solid ${
                  isSelected
                    ? isRecommended ? 'var(--accent-border)' : 'var(--border-strong)'
                    : isRecommended ? 'var(--accent-border)' : 'var(--border)'
                }`,
                boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
              }}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <span
                  className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--text-on-accent)',
                  }}
                >
                  RECOMMENDED
                </span>
              )}

              {/* Card Header */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h4
                      className="text-xs font-bold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                    >
                      {displayRouteName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {getProviderBadge(prov)}
                    {route.dataSource === 'opencellid' ? (
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase flex items-center gap-1"
                        style={{ background: 'var(--green-subtle)', border: '1px solid var(--green-border)', color: 'var(--green)' }}
                      >
                        Based on tower data
                      </span>
                    ) : (
                      <span
                        className="px-1.5 py-0.5 rounded-md border text-[9px] font-sans font-semibold tracking-wide uppercase flex items-center gap-1"
                        style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}
                      >
                        Est. Coverage
                      </span>
                    )}

                    {weather && (
                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-semibold flex items-center gap-1"
                        style={{
                          background: weather.hasSevereWeather ? 'var(--amber-subtle)' : 'var(--bg-input)',
                          border: `1px solid ${weather.hasSevereWeather ? 'var(--amber-border)' : 'var(--border)'}`,
                          color: weather.hasSevereWeather ? 'var(--amber)' : 'var(--text-secondary)',
                        }}
                      >
                        <span>{weather.points[0]?.icon}</span>
                        <span>{weather.summaryText}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className="text-sm font-mono font-bold flex items-center gap-1 justify-end"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Clock size={12} style={{ color: 'var(--accent)' }} />
                    {formatDuration(route.duration)}
                  </span>
                  <span
                    className="text-[10px] font-mono block mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {route.distance} km
                  </span>
                </div>
              </div>

              {/* Prediction Accuracy Badge */}
              <div
                className="flex items-center justify-between text-[9px] px-2 py-1 rounded-lg"
                style={{ background: 'var(--green-subtle)', border: '1px solid var(--green-border)', color: 'var(--green)' }}
              >
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck size={11} style={{ color: 'var(--green)' }} />
                  {route.accuracyBadge || accuracy.badgeText}
                </span>
                <span className="font-mono text-[8px]" style={{ color: 'var(--green)', opacity: 0.8 }}>
                  {accuracy.accuracyPercent}% Verified
                </span>
              </div>

              {/* Metrics Grid */}
              <div
                className="grid grid-cols-2 gap-2 p-2.5 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
              >
                {/* 1. Connectivity Score */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <Wifi size={10} style={{ color: 'var(--accent)' }} />
                      5G Signal
                    </span>
                    <span style={{ color: 'var(--accent)' }} className="font-mono">{route.signalStrength}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${route.signalStrength}%`, background: 'var(--accent)' }}
                    />
                  </div>
                </div>

                {/* 2. Route Health */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <Zap size={10} style={{ color: 'var(--amber)' }} />
                      Route Health
                    </span>
                    <span style={{ color: 'var(--amber)' }} className="font-mono">
                      {routeHealth}%
                      {weather?.hasSevereWeather && (
                        <span className="text-[8px] ml-0.5" style={{ color: 'var(--red)' }}>(-10%)</span>
                      )}
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${routeHealth}%`, background: 'var(--amber)' }}
                    />
                  </div>
                </div>

                {/* 3. Dead Zones */}
                <div className="flex items-center gap-1.5 text-[10px]" style={{ fontFamily: 'var(--font-sans)' }}>
                  {deadZonesCount > 0 ? (
                    <>
                      <AlertTriangle size={11} style={{ color: 'var(--red)' }} className="animate-pulse" />
                      <span style={{ color: 'var(--text-secondary)' }}>Dead Zones:</span>
                      <span style={{ color: 'var(--red)' }} className="font-bold">{deadZonesCount} detected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={11} style={{ color: 'var(--green)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Dead Zones:</span>
                      <span style={{ color: 'var(--green)' }} className="font-bold">0 clear</span>
                    </>
                  )}
                </div>

                {/* 4. Confidence Score */}
                <div className="flex items-center justify-end">
                  <ConfidenceBadge score={confidenceScore} />
                </div>
              </div>

              {/* Recommended Stops for Long Routes (>2 hours / 120 mins) (Task 5) */}
              {route.duration > 120 && route.pointsOfInterest && route.pointsOfInterest.length > 0 && (
                <div
                  className="p-2.5 rounded-xl space-y-1.5"
                  style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                      <Coffee size={11} style={{ color: 'var(--accent)' }} />
                      {t('recommended_stops', 'Recommended Stops (>2 hrs trip)')}
                    </span>
                    <span className="text-[9px] font-mono" style={{ color: 'var(--accent)' }}>2-3 suggestions</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto py-0.5">
                    {route.pointsOfInterest.slice(0, 3).map((poi) => (
                      <div
                        key={poi.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPoi?.(poi);
                        }}
                        className="p-1.5 rounded-lg flex items-center gap-1.5 shrink-0 text-left cursor-pointer transition-colors"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <span className="text-sm">{poi.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold max-w-[100px] truncate" style={{ color: 'var(--text-primary)' }}>
                            {poi.name}
                          </span>
                          <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                            {poi.distanceKm} km away
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tower Count Indicator */}
              {route.towerCount !== undefined && (
                <div
                  className="flex items-center justify-between text-[9px] font-mono px-2.5 py-1 rounded-lg"
                  style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
                >
                  <span className="flex items-center gap-1.5">
                    <Radio size={11} />
                    <span className="font-semibold">{route.towerCount} cell towers along this route</span>
                  </span>
                  <span className="text-[8px] uppercase tracking-wider font-sans" style={{ color: 'var(--text-secondary)' }}>
                    {route.dataSource === 'opencellid' ? 'Live Data' : 'Estimated'}
                  </span>
                </div>
              )}

              {/* Why This Route */}
              <div
                className="flex flex-col gap-1 border-l-2 pl-2 text-[10px] leading-relaxed"
                style={{ borderColor: 'var(--accent-border)', fontFamily: 'var(--font-sans)' }}
              >
                <div>
                  <span className="font-bold not-italic" style={{ color: 'var(--text-primary)' }}>Why This Route: </span>
                  <span className="italic" style={{ color: 'var(--text-secondary)' }}>{route.whyThisRoute}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
                <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Radio size={10} style={{ color: 'var(--accent)' }} />
                  Best signal: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{prov}</span>
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-[9px] font-semibold"
                  style={{
                    background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                    color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                    border: isSelected ? '1px solid var(--accent-border)' : '1px solid transparent',
                  }}
                >
                  {isSelected ? '✓ Active' : 'Tap to select'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Corridor Action Buttons */}
      <div className="flex flex-col gap-2 mt-1">
        {/* Find Highway Stops Button */}
        <button
          id="find-stops-btn"
          type="button"
          onClick={() => setIsStopsModalOpen(true)}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <Coffee size={14} />
          <span>{t('find_stops_button', 'Find Stops & Amenities along Route')}</span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.2 rounded"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            {selectedRoute?.pointsOfInterest?.length || 4}
          </span>
        </button>

        {/* Complete Journey & Feedback */}
        <button
          id="finish-journey-feedback-btn"
          type="button"
          onClick={() => setIsFeedbackModalOpen(true)}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: 'var(--green-subtle)',
            border: '1px solid var(--green-border)',
            color: 'var(--green)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <Flag size={14} />
          <span>{t('finish_journey_btn', 'Finish Journey & Share Feedback')}</span>
        </button>

        {/* Save Route */}
        <Button
          id="bookmark-corridor-btn"
          variant={isSaved ? 'glass' : 'primary'}
          size="md"
          fullWidth
          onClick={onSave}
        >
          {isSaved ? (
            <>
              <BookmarkCheck size={14} />
              Route Saved
            </>
          ) : (
            <>
              <Bookmark size={14} />
              Save Route
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
