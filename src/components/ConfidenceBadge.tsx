import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Mountain, Info } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isHighlyVerified = score >= 80;
  const explanation = "Prediction factors in topographical elevation data (hill/valley line-of-sight) and historical crowd-sourced reports.";

  return (
    <div 
      className="relative inline-flex items-center group cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
      title={explanation}
    >
      {isHighlyVerified ? (
        <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.1)] transition-all hover:bg-emerald-500/25">
          <ShieldCheck size={11} />
          <span>Highly Verified ({score}%)</span>
          <Info size={9} className="opacity-70 text-emerald-300" />
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.1)] transition-all hover:bg-blue-500/25">
          <Sparkles size={10} className="animate-pulse" />
          <span>Estimated ({score}%)</span>
          <Info size={9} className="opacity-70 text-blue-300" />
        </span>
      )}

      {/* Floating Hover / Tap Tooltip */}
      <div className={`absolute bottom-full right-0 mb-2 w-56 p-2 rounded-xl glass border border-cyan-glow/30 shadow-2xl z-50 transition-all duration-200 pointer-events-none ${
        showTooltip ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-1 invisible'
      }`}>
        <div className="flex items-start gap-1.5 text-[9px] font-sans text-soft-silver leading-snug">
          <Mountain size={12} className="shrink-0 text-cyan-glow mt-0.5" />
          <span>{explanation}</span>
        </div>
      </div>
    </div>
  );
};
