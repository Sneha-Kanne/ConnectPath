import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ThumbsUp, AlertTriangle, X, Radio, Award } from 'lucide-react';
import { RouteOption } from '../types';
import { saveFeedback, logCompletedJourney } from '../lib/feedbackService';
import { awardReportPoints } from '../lib/gamificationService';
import { useLanguage } from '../hooks/useLanguage';

interface JourneyFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteOption | null;
  onSubmitted?: () => void;
}

export const JourneyFeedbackModal: React.FC<JourneyFeedbackModalProps> = ({
  isOpen,
  onClose,
  route,
  onSubmitted,
}) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<'Exactly as predicted' | 'Better than expected' | 'Worse than expected'>('Exactly as predicted');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !route) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      saveFeedback(
        route.id,
        route.name,
        selectedOption,
        route.signalStrength,
        notes
      );
      // Also record journey in MongoDB and analytics store
      logCompletedJourney(
        route.id,
        route.name,
        route.distance || 25,
        route.duration || 35,
        route.deadZonesCount ? route.deadZonesCount * 3 : 0,
        route.bestProvider || 'Jio',
        route.signalStrength || 85
      );
      // Award 10 gamification points for providing verification report
      awardReportPoints('Telangana Highway Feedback');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSubmitted?.();
        onClose();
      }, 1500);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass rounded-2xl border border-cyan-glow/30 bg-obsidian/95 shadow-2xl p-5 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-glow/10 text-cyan-glow">
                <Radio size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-glow uppercase tracking-wider block">
                  {t('journey_completed', 'Journey Completed')}
                </span>
                <h3 className="text-xs font-bold text-white truncate max-w-[260px]">
                  {route.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-slate hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-sm font-bold text-white">
                  {t('feedback_submitted', 'Thanks. Your feedback has been recorded.')}
              </h4>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Award size={12} /> +10 Community Scout Points Awarded!
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {t('feedback_modal_title', 'How was the signal quality on this route?')}
                </h4>
                <p className="text-[11px] text-muted-slate mt-0.5">
                  {t('feedback_modal_subtitle', 'Tell us how the signal was on this route.')}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {[
                  {
                    value: 'Exactly as predicted' as const,
                    label: t('feedback_exact', 'Exactly as predicted'),
                    desc: 'Dead zones & 5G fidelity matched the map',
                    icon: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
                    activeBg: 'border-emerald-500/50 bg-emerald-500/10 text-white'
                  },
                  {
                    value: 'Better than expected' as const,
                    label: t('feedback_better', 'Better than expected'),
                    desc: 'Higher signal bars & fewer drops than predicted',
                    icon: <ThumbsUp size={16} className="text-cyan-glow shrink-0" />,
                    activeBg: 'border-cyan-glow/50 bg-cyan-glow/10 text-white'
                  },
                  {
                    value: 'Worse than expected' as const,
                    label: t('feedback_worse', 'Worse than expected'),
                    desc: 'Unpredicted dead zones or dropped calls',
                    icon: <AlertTriangle size={16} className="text-coral-glow shrink-0" />,
                    activeBg: 'border-coral-glow/50 bg-coral-glow/10 text-white'
                  }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedOption(opt.value)}
                    className={`w-full p-3 rounded-xl border flex items-start gap-3 text-left transition-all cursor-pointer ${
                      selectedOption === opt.value
                        ? opt.activeBg
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-soft-silver'
                    }`}
                  >
                    {opt.icon}
                    <div className="flex-1">
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-muted-slate">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Optional notes */}
              <div>
                <label className="text-[10px] font-sans font-semibold text-muted-slate uppercase tracking-wider block mb-1">
                  Optional Observations (Towers, carrier, km marker)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. 5G was strong until the ghat curve..."
                  className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-muted-slate focus:outline-none focus:border-cyan-glow/50"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-slate hover:text-white"
                >
                  Skip
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-xl bg-cyan-glow text-obsidian text-xs font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  {isSubmitting ? 'Submitting...' : t('feedback_submit', 'Submit Accuracy Feedback')}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
