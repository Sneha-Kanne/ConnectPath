import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coffee, Utensils, Fuel, Bed, MapPin, Star } from 'lucide-react';
import { PointOfInterest } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface RestStopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pois: PointOfInterest[];
  routeName?: string;
  onSelectPoi?: (poi: PointOfInterest) => void;
}

export const RestStopsModal: React.FC<RestStopsModalProps> = ({
  isOpen,
  onClose,
  pois,
  routeName,
  onSelectPoi,
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'fuel' | 'restaurant' | 'rest_area' | 'hotel'>('all');

  const filteredPois = pois.filter(p => filter === 'all' || p.type === filter);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl max-h-[85vh] flex flex-col glass rounded-2xl border border-cyan-glow/30 bg-obsidian/95 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow">
                <Coffee size={18} />
              </div>
              <div>
                <h3 className="text-sm font-sans font-bold text-white tracking-wide">
                  {t('stops_modal_title', 'Nearby Highway Amenities')}
                </h3>
                <p className="text-[11px] font-sans text-muted-slate truncate max-w-sm">
                  {routeName ? `Along ${routeName}` : t('stops_modal_subtitle', 'Fuel, dining & rest stops')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-slate hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-white/5 bg-black/30">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-cyan-glow text-obsidian font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-muted-slate hover:text-white bg-white/5'
              }`}
            >
              All ({pois.length})
            </button>
            <button
              onClick={() => setFilter('fuel')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === 'fuel'
                  ? 'bg-cyan-glow text-obsidian font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-muted-slate hover:text-white bg-white/5'
              }`}
            >
              <Fuel size={12} /> {t('fuel_station', 'Fuel')}
            </button>
            <button
              onClick={() => setFilter('restaurant')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === 'restaurant'
                  ? 'bg-cyan-glow text-obsidian font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-muted-slate hover:text-white bg-white/5'
              }`}
            >
              <Utensils size={12} /> {t('restaurant', 'Food')}
            </button>
            <button
              onClick={() => setFilter('rest_area')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === 'rest_area'
                  ? 'bg-cyan-glow text-obsidian font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-muted-slate hover:text-white bg-white/5'
              }`}
            >
              <Coffee size={12} /> {t('rest_area', 'Rest Areas')}
            </button>
            <button
              onClick={() => setFilter('hotel')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === 'hotel'
                  ? 'bg-cyan-glow text-obsidian font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-muted-slate hover:text-white bg-white/5'
              }`}
            >
              <Bed size={12} /> {t('hotel', 'Hotels')}
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredPois.length === 0 ? (
              <div className="text-center py-10 text-muted-slate text-xs">
                {t('no_stops_found', 'No amenities detected in this category.')}
              </div>
            ) : (
              filteredPois.map(poi => (
                <div
                  key={poi.id}
                  onClick={() => onSelectPoi?.(poi)}
                  className="group p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-glow/30 transition-all flex items-start justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl p-2 rounded-lg bg-black/40 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                      {poi.icon}
                    </span>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-glow transition-colors">
                          {poi.name}
                        </span>
                        {poi.rating && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                            <Star size={10} className="fill-amber-400" />
                            {poi.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-slate mt-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-cyan-glow/70" />
                        {poi.address || `${poi.distanceKm} km from the route`}
                      </span>
                      {poi.amenities && poi.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {poi.amenities.map((a, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-soft-silver border border-white/5"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-xs font-mono font-bold text-cyan-glow">
                      {poi.distanceKm} km
                    </span>
                    <span className="text-[9px] text-muted-slate">
                      {t('distance_away', 'away')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 bg-black/40 flex justify-between items-center text-[10px] text-muted-slate">
            <span>Location data verified</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              {t('close', 'Close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
