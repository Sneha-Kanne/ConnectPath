import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  ShieldCheck, 
  Trash2, 
  Radio, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { CachedRouteData, formatCachedTimestamp } from '../lib/offlineCache';
import { Button } from './Button';

interface CachedRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cachedRoute: CachedRouteData | null;
  onResumeRoute: (route: CachedRouteData) => void;
  onClearCache: () => void;
}

export const CachedRouteModal: React.FC<CachedRouteModalProps> = ({
  isOpen,
  onClose,
  cachedRoute,
  onResumeRoute,
  onClearCache,
}) => {
  if (!isOpen || !cachedRoute) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian/85 backdrop-blur-md">
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
          className="relative w-full max-w-lg bg-obsidian/95 border border-white/12 rounded-2xl p-5 shadow-2xl z-10 flex flex-col gap-4 overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Navigation size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-sans font-extrabold text-white uppercase tracking-wider">
                    Offline Cached Route
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    RAM / LOCAL
                  </span>
                </div>
                <p className="text-[10px] font-sans text-muted-slate mt-0.5">
                  Saved {formatCachedTimestamp(cachedRoute.timestamp)} • Available without a connection
                </p>
              </div>
            </div>

            <button
              id="close-cached-route-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-slate hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

              {/* Route title and summary */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.03] border border-white/8">
            <h4 className="text-xs font-sans font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {cachedRoute.name}
            </h4>

            <div className="grid grid-cols-3 gap-2 mt-1 pt-2 border-t border-white/6">
              <div className="flex flex-col">
                <span className="text-[9px] font-sans uppercase tracking-wider text-muted-slate font-semibold">
                  Distance
                </span>
                <span className="text-sm font-mono font-extrabold text-white">
                  {cachedRoute.distance} <span className="text-[10px] text-muted-slate">km</span>
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-sans uppercase tracking-wider text-muted-slate font-semibold">
                  Est. Duration
                </span>
                <span className="text-sm font-mono font-extrabold text-white">
                  {cachedRoute.duration} <span className="text-[10px] text-muted-slate">mins</span>
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-sans uppercase tracking-wider text-muted-slate font-semibold">
                  Waypoints / Turns
                </span>
                <span className="text-sm font-mono font-extrabold text-cyan-glow">
                  {cachedRoute.turnsCount} <span className="text-[10px] text-muted-slate">turns</span>
                </span>
              </div>
            </div>
          </div>

          {/* Connectivity & Signal Diagnostics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-cyan-glow/5 border border-cyan-glow/15 flex items-center gap-2.5">
              <Radio size={16} className="text-cyan-glow shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-sans uppercase tracking-wider text-muted-slate font-semibold">
                  Signal quality
                </span>
                <span className="text-xs font-mono font-bold text-cyan-glow">
                  {cachedRoute.signalStrength}% Avg Coverage
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-sans uppercase tracking-wider text-muted-slate font-semibold">
                  Provider Backhaul
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {cachedRoute.bestProvider || 'Multi-Carrier'}
                </span>
              </div>
            </div>
          </div>

          {/* Dead Zones Section */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-slate flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-coral-glow" />
              Pre-Calculated Cellular Dead Zones ({cachedRoute.deadZones?.length ?? 0})
            </span>

            <div className="max-h-36 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
              {cachedRoute.deadZones && cachedRoute.deadZones.length > 0 ? (
                cachedRoute.deadZones.map((dz, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-coral-glow/10 border border-coral-glow/20 flex items-center justify-between text-xs font-sans"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-[11px]">{dz.name}</span>
                      <span className="text-[9px] text-muted-slate font-mono mt-0.5">
                        {dz.description || 'Nearest tower > 2km away'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-coral-glow/20 text-coral-glow font-mono text-[10px] font-bold shrink-0">
                      <Clock size={10} />
                      ~{dz.expectedDurationMins || 4}m gap
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/6 text-center text-[11px] font-sans text-muted-slate flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Signal coverage is expected to remain available along this route.</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-3">
            <button
              id="clear-cached-route-btn"
              onClick={() => {
                onClearCache();
                onClose();
              }}
              className="px-3 py-2 rounded-xl text-xs font-sans font-bold text-coral-glow hover:bg-coral-glow/10 border border-coral-glow/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              Clear Cache
            </button>

            <div className="flex items-center gap-2">
              <Button
                id="resume-cached-route-modal-btn"
                variant="cyan"
                size="sm"
                className="text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                onClick={() => {
                  onResumeRoute(cachedRoute);
                  onClose();
                }}
              >
                <RotateCcw size={13} />
                Resume This Route
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
