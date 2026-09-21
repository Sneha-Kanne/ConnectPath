import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, CheckCircle2, TrendingUp, Radio, Award } from 'lucide-react';
import { AccuracyStats } from '../types';
import { computeAccuracyStats, FEEDBACK_UPDATE_EVENT } from '../lib/feedbackService';
import { useLanguage } from '../hooks/useLanguage';

interface PredictionAccuracyProps {
  onClose?: () => void;
}

export const PredictionAccuracy: React.FC<PredictionAccuracyProps> = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AccuracyStats>(() => computeAccuracyStats());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(computeAccuracyStats());
    };
    window.addEventListener(FEEDBACK_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(FEEDBACK_UPDATE_EVENT, handleUpdate);
  }, []);

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Header Metric Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-glow/15 via-black/40 to-black/60 border border-cyan-glow/30 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-cyan-glow text-[11px] font-mono uppercase tracking-wider mb-1">
              <ShieldCheck size={14} />
              <span>{t('overall_accuracy', 'Overall Prediction Accuracy')}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {stats.overallAccuracyPercent}%
              </span>
              <span className="text-xs text-muted-slate font-sans">
                across {stats.totalReports} verified reports
              </span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow">
            <Target size={28} className="animate-pulse" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-glow to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${stats.overallAccuracyPercent}%` }}
          />
        </div>
      </div>

      {/* Accuracy by Corridor Breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-sans font-bold text-soft-silver uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={13} className="text-cyan-glow" />
          {t('accuracy_by_route', 'Accuracy by route')}
        </h4>
        <div className="space-y-2">
          {stats.routeAccuracies.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white truncate max-w-[220px]">
                  {item.routeName}
                </span>
                <span className="text-[10px] text-muted-slate">
                  {item.reportCount} user field tests
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-glow h-full rounded-full"
                    style={{ width: `${item.accuracyPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-cyan-glow w-10 text-right">
                  {item.accuracyPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback History */}
      <div className="space-y-2">
        <h4 className="text-xs font-sans font-bold text-soft-silver uppercase tracking-wider flex items-center gap-1.5">
          <Radio size={13} className="text-emerald-400" />
          {t('recent_history', 'Recent Signal Verifications')}
        </h4>
        <div className="space-y-2">
          {stats.recentFeedback.map(fb => (
            <div
              key={fb.id}
              className="p-3 rounded-xl border border-white/5 bg-black/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-soft-silver truncate max-w-[200px]">
                  {fb.routeName}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    fb.feedback === 'Exactly as predicted'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : fb.feedback === 'Better than expected'
                      ? 'bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20'
                      : 'bg-coral-glow/10 text-coral-glow border border-coral-glow/20'
                  }`}
                >
                  <CheckCircle2 size={10} />
                  {fb.feedback}
                </span>
              </div>
              {fb.actualSignalNotes && (
                <p className="text-[11px] text-muted-slate italic">
                  "{fb.actualSignalNotes}"
                </p>
              )}
              <div className="flex items-center justify-between text-[9px] text-muted-slate/70 font-mono pt-0.5">
                <span>Predicted Score: {fb.predictedScore}%</span>
                <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community incentive note */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300">
        <Award size={16} className="shrink-0" />
        <span>Earn 10 Scout Points every time you confirm signal prediction after your trip!</span>
      </div>
    </div>
  );
};
