import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw, X, Navigation } from 'lucide-react';

interface RouteDeviationAlertProps {
  isDeviated: boolean;
  distanceMeters: number;
  onRecalculate: () => void;
  onDismiss?: () => void;
  isRecalculating?: boolean;
}

export const RouteDeviationAlert: React.FC<RouteDeviationAlertProps> = ({
  isDeviated,
  distanceMeters,
  onRecalculate,
  onDismiss,
  isRecalculating = false,
}) => {
  return (
    <AnimatePresence>
      {isDeviated && (
        <motion.div
          id="route-deviation-alert-banner"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="absolute top-20 sm:top-24 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-2xl z-40 glass rounded-2xl p-3 sm:px-4 sm:py-3 border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3 text-white backdrop-blur-md"
        >
          {/* Warning Message */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30 animate-pulse">
              <AlertCircle size={18} />
            </span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-extrabold text-amber-400 uppercase tracking-wider">
                  Route Deviation Detected
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {distanceMeters}m OFF ROUTE
                </span>
              </div>
              <p className="text-[11px] font-sans text-slate-200 mt-0.5">
                You&apos;ve deviated <span className="font-bold text-amber-300 font-mono">{distanceMeters}m</span> from the recommended route. Recalculate?
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              id="recalculate-route-btn"
              onClick={onRecalculate}
              disabled={isRecalculating}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian font-sans font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={isRecalculating ? 'animate-spin' : ''} />
              <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Route'}</span>
            </button>

            {onDismiss && (
              <button
                id="dismiss-deviation-btn"
                onClick={onDismiss}
                className="p-1.5 rounded-lg text-muted-slate hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Dismiss Warning"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
