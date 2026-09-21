import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, 
  Trash2, 
  MapPin, 
  ArrowRight, 
  ShieldCheck,
} from 'lucide-react';
import { SavedPath } from '../types';

interface SavedPathsListProps {
  savedPaths: SavedPath[];
  onLoadPath: (path: SavedPath) => void;
  onDeletePath: (id: string) => void;
}

export const SavedPathsList: React.FC<SavedPathsListProps> = ({
  savedPaths,
  onLoadPath,
  onDeletePath,
}) => {
  if (savedPaths.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
      >
        <Bookmark size={24} className="mb-3" style={{ color: 'var(--text-muted)' }} />
        <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          No saved routes yet
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Search for a route and tap "Save Route" to bookmark it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <h4
          className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
        >
          <Bookmark size={12} style={{ color: 'var(--accent)' }} />
          Saved Routes ({savedPaths.length})
        </h4>
      </div>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {savedPaths.map((path) => (
            <motion.div
              key={path.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="group relative rounded-xl p-3.5 transition-colors"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {/* Load route area */}
              <div
                id={`saved-path-item-${path.id}`}
                onClick={() => onLoadPath(path)}
                className="cursor-pointer pr-10"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                  >
                    {path.title || 'Unnamed Route'}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-medium shrink-0"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                  >
                    {path.purpose}
                  </span>
                </div>

                {/* Route summary */}
                <div
                  className="flex items-center gap-1.5 text-[10px] mb-2.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
                >
                  <MapPin size={9} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span className="truncate max-w-[110px]" style={{ color: 'var(--text-primary)' }}>
                    {path.start.name.split('(')[0].trim()}
                  </span>
                  <ArrowRight size={9} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span className="truncate max-w-[110px]" style={{ color: 'var(--text-primary)' }}>
                    {path.end.name.split('(')[0].trim()}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-mono"
                    style={{
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent-border)',
                    }}
                  >
                    Signal: {path.preference}%
                  </span>
                  {path.emergencySafe && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-1"
                      style={{
                        background: 'var(--red-subtle)',
                        color: 'var(--red)',
                        border: '1px solid var(--red-border)',
                      }}
                    >
                      <ShieldCheck size={8} />
                      Emergency Safe
                    </span>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                id={`delete-path-btn-${path.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePath(path.id);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--red)';
                  e.currentTarget.style.background = 'var(--red-subtle)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Remove saved route"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

