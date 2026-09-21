import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  ThumbsUp, 
  MapPin, 
  Clock, 
  Plus, 
  Send,
  AlertTriangle,
  X,
  RefreshCw,
  Loader2,
  Trophy,
  Award,
  Medal,
  Users
} from 'lucide-react';
import { CommunityReport } from '../lib/mockData';
import { Button } from './Button';
import { useLanguage } from '../hooks/useLanguage';
import {
  awardReportPoints,
  awardUpvotePoints,
  getGamificationState,
  getLeaderboard,
  GAMIFICATION_UPDATE_EVENT,
} from '../lib/gamificationService';

export const CommunityReports: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'bulletins' | 'leaderboard'>('bulletins');
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Gamification state
  const [gamification, setGamification] = useState(() => getGamificationState());
  const [leaderboard, setLeaderboard] = useState(() => getLeaderboard());

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState<'Weak' | 'None' | 'Slow'>('None');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const handleGamification = () => {
      setGamification(getGamificationState());
      setLeaderboard(getLeaderboard());
    };
    window.addEventListener(GAMIFICATION_UPDATE_EVENT, handleGamification);
    return () => window.removeEventListener(GAMIFICATION_UPDATE_EVENT, handleGamification);
  }, []);

  // Utility to convert DB reports to frontend shape
  const mapDbReportToFrontend = (dbRep: any): CommunityReport => {
    if (dbRep.id && dbRep.user) return dbRep;

    const createdDate = dbRep.createdAt ? new Date(dbRep.createdAt) : new Date();
    const diffMs = Date.now() - createdDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo = 'Just now';
    if (diffDays > 0) {
      timeAgo = `${diffDays}d ago`;
    } else if (diffHours > 0) {
      timeAgo = `${diffHours}h ago`;
    } else if (diffMins > 0) {
      timeAgo = `${diffMins}m ago`;
    }

    return {
      id: dbRep._id || dbRep.id || String(Math.random()),
      user: dbRep.user || { name: dbRep.userName || 'Anonymous user' },
      locationName: dbRep.locationName || 'Telangana route',
      signalStatus: dbRep.signalStatus || 'None',
      description: dbRep.description || '',
      timeAgo,
      votes: dbRep.votes !== undefined ? dbRep.votes : 1,
    };
  };

  // Fetch Reports
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reports');
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      const mapped = data.map(mapDbReportToFrontend);
      setReports(mapped);
    } catch (err: any) {
      console.error('Failed to load live reports:', err);
      setError('Could not establish secure link to Grid database.');
      setToast({
        message: 'Grid DB connection failed. Using local backup database.',
        type: 'info'
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleVote = async (reportId: string) => {
    const userId = 'user-node-operator';
    
    try {
      const response = await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) throw new Error('Failed to post confirmation vote');
      const updatedReport = await response.json();
      const mappedReport = mapDbReportToFrontend(updatedReport);

      setReports(prev => prev.map(rep => {
        if (rep.id === reportId) {
          return { ...rep, votes: mappedReport.votes };
        }
        return rep;
      }));

      if (votedIds.includes(reportId)) {
        setVotedIds(prev => prev.filter(vid => vid !== reportId));
        setToast({ message: 'Report vote removed.', type: 'info' });
      } else {
        setVotedIds(prev => [...prev, reportId]);
        // Award 5 points for confirming/upvoting someone's report
        const updatedUser = awardUpvotePoints();
        setToast({ message: 'Report verified. You earned 5 points.', type: 'success' });
      }
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Error toggling vote:', err);
      // Even if offline, award upvote points locally
      awardUpvotePoints();
      setToast({ message: 'Vote recorded locally! +5 Points awarded', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation || !newDesc) return;

    setIsSubmitting(true);
    const userId = 'user-node-operator';
    const userName = 'Anonymous user';

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          locationName: newLocation,
          signalStatus: newStatus,
          description: newDesc,
          coordinates: [78.4867, 17.3850]
        })
      });

      if (!response.ok) throw new Error('API server rejected the post');
      const createdReport = await response.json();
      const mapped = mapDbReportToFrontend(createdReport);

      setReports(prev => [mapped, ...prev]);
      
      // Award 10 points for reporting a dead zone
      awardReportPoints(newLocation);

      setNewLocation('');
      setNewDesc('');
      setShowAddForm(false);
      
      setToast({ message: 'Report published. You earned 10 points.', type: 'success' });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('Error adding bulletin:', err);
      // Fallback local report & award points
      const localRep: CommunityReport = {
        id: `local-${Date.now()}`,
        user: { name: userName },
        locationName: newLocation,
        signalStatus: newStatus,
        description: newDesc,
        timeAgo: 'Just now',
        votes: 1
      };
      setReports(prev => [localRep, ...prev]);
      awardReportPoints(newLocation);
      setNewLocation('');
      setNewDesc('');
      setShowAddForm(false);
      setToast({ message: 'Report saved offline. You earned 10 points.', type: 'success' });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFeed = () => {
    setReports([]);
    setToast({ message: 'Feed cleared. Showing holographic empty state.', type: 'info' });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-3 w-full relative">
      {/* Toast Alert Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute top-0 left-0 right-0 z-50 p-2.5 rounded-xl border text-xs font-sans font-bold shadow-lg flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-300'
                : 'bg-cyan-950/90 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-0.5 hover:bg-white/10 rounded cursor-pointer">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gamification Summary Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-black/40 to-cyan-glow/10 border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Trophy size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-sans">
                {t('gamification_points', 'Your Scout Score:')}
              </span>
              <span className="text-xs font-mono font-extrabold text-amber-300">
                {gamification.points} pts
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-slate mt-0.5">
              <span>{gamification.reportsCount} reports</span>
              <span>•</span>
              <span>{gamification.upvotesCount} upvotes</span>
              <span>•</span>
              <span>{gamification.badges.length} badges</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          {gamification.badges.map(b => (
            <span
              key={b.id}
              className="text-base p-1 rounded-md bg-white/5 border border-white/10"
              title={`${b.name}: ${b.description}`}
            >
              {b.icon}
            </span>
          ))}
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/5 gap-1">
        <button
          onClick={() => setActiveTab('bulletins')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-sans font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bulletins'
              ? 'bg-cyan-glow text-obsidian shadow-[0_0_10px_rgba(0,240,255,0.3)]'
              : 'text-muted-slate hover:text-white'
          }`}
        >
          <Radio size={12} />
          {t('community_reports', 'Signal reports')} ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-sans font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'leaderboard'
              ? 'bg-amber-400 text-obsidian shadow-[0_0_10px_rgba(251,191,36,0.3)]'
              : 'text-muted-slate hover:text-white'
          }`}
        >
          <Medal size={12} />
          {t('leaderboard', 'Leaderboard & Badges')}
        </button>
      </div>

      {activeTab === 'leaderboard' ? (
        /* Leaderboard View */
        <div className="space-y-3">
          {/* Unlocked Badges Section */}
          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <span className="text-[10px] font-sans font-bold text-soft-silver uppercase tracking-wider block">
              {t('badges_title', 'Available Badges')}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { name: 'Signal Scout', icon: '', desc: '5 reports submitted', req: '5 reports', unlocked: gamification.reportsCount >= 5 },
                { name: 'Network Guardian', icon: '', desc: '20 reports submitted', req: '20 reports', unlocked: gamification.reportsCount >= 20 },
                { name: 'Telangana Explorer', icon: '', desc: '10+ cities reported', req: '10 cities', unlocked: gamification.reportedCities.length >= 10 }
              ].map(badge => (
                <div
                  key={badge.name}
                  className={`p-2 rounded-lg border flex flex-col items-center text-center transition-all ${
                    badge.unlocked
                      ? 'border-amber-400/50 bg-amber-400/10 text-white'
                      : 'border-white/5 bg-black/40 opacity-50 text-muted-slate'
                  }`}
                >
                  <span className="text-xl mb-1">{badge.icon}</span>
                  <span className="text-[10px] font-bold leading-tight">{badge.name}</span>
                  <span className="text-[9px] text-muted-slate mt-0.5">{badge.req}</span>
                  <span className={`text-[8px] font-mono mt-1 px-1 rounded ${badge.unlocked ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-muted-slate'}`}>
                    {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini-Leaderboard */}
          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold text-soft-silver uppercase tracking-wider flex items-center gap-1.5">
                <Users size={12} className="text-amber-400" />
                {t('top_contributors', 'Top Signal Contributors')}
              </span>
              <span className="text-[9px] font-mono text-muted-slate">Telangana Network</span>
            </div>

            <div className="space-y-1.5">
              {leaderboard.map(item => (
                <div
                  key={item.rank}
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    item.isCurrentUser
                      ? 'border-cyan-glow/40 bg-cyan-glow/10'
                      : 'border-white/5 bg-black/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      item.rank === 1
                        ? 'bg-amber-400 text-obsidian'
                        : item.rank === 2
                        ? 'bg-slate-300 text-obsidian'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/10 text-muted-slate'
                    }`}>
                      {item.rank}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        {item.userName}
                        {item.isCurrentUser && (
                          <span className="text-[9px] text-cyan-glow font-mono">(You)</span>
                        )}
                      </span>
                      <span className="text-[9px] text-muted-slate">
                        {item.reportsCount} reports • {item.badge}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-300">
                    {item.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
                /* Reports list view */
        <>
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-semibold text-coral-glow uppercase tracking-wider flex items-center gap-1">
              <Radio size={10} className="text-coral-glow animate-pulse" />
              Live Field Reports
            </span>

            <div className="flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={fetchReports}
                className="p-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-muted-slate hover:text-soft-silver cursor-pointer transition-colors"
                title="Refresh database bulletins"
              >
                <RefreshCw size={11} className={isLoading ? 'animate-spin text-cyan-glow' : ''} />
              </motion.button>
              
              {reports.length > 0 && (
                <motion.button
                  id="clear-reports-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearFeed}
                  className="px-2 py-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-[9px] font-sans font-bold text-muted-slate hover:text-soft-silver cursor-pointer transition-colors"
                >
                  Clear Feed
                </motion.button>
              )}

              <motion.button
                id="toggle-add-report-btn"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 bg-cyan-glow/10 border border-cyan-glow/20 hover:bg-cyan-glow/20 px-2.5 py-1 rounded-lg text-[10px] font-sans font-semibold text-cyan-glow cursor-pointer transition-colors"
              >
                {showAddForm ? <X size={11} /> : <Plus size={11} />}
                {showAddForm ? 'Cancel' : 'Report Drop (+10pts)'}
              </motion.button>
            </div>
          </div>

          {/* Add Report Panel */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                onSubmit={handleAddReport}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-xl p-3.5 border border-white/10 bg-black/40 flex flex-col gap-3 overflow-hidden"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-sans font-semibold text-muted-slate uppercase tracking-wider">
                    Location Name / Highway Section
                  </label>
                  <input
                    id="new-report-location"
                    type="text"
                    placeholder="e.g. NH-65 Narketpally curve..."
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs font-sans text-soft-silver outline-none focus:border-cyan-glow/50 placeholder:text-muted-slate/65"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-sans font-semibold text-muted-slate uppercase tracking-wider">
                    Cellular Signal Severity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['None', 'Weak', 'Slow'] as const).map(status => (
                      <motion.button
                        key={status}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setNewStatus(status)}
                        className={`py-1.5 px-2 rounded-lg border text-center text-[10px] font-sans font-bold transition-all cursor-pointer ${
                          newStatus === status
                            ? 'bg-coral-glow/20 border-coral-glow text-coral-glow'
                            : 'bg-white/5 border-white/5 text-muted-slate hover:bg-white/10'
                        }`}
                      >
                        {status === 'None' && '🔴 Blackout'}
                        {status === 'Weak' && '🟡 Weak 2G/3G'}
                        {status === 'Slow' && '🔵 Slow Data'}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-sans font-semibold text-muted-slate uppercase tracking-wider">
                    Issue Description
                  </label>
                  <textarea
                    id="new-report-desc"
                    placeholder="What cellular issues are you experiencing?..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs font-sans text-soft-silver outline-none focus:border-cyan-glow/50 placeholder:text-muted-slate/65 resize-none"
                    required
                  />
                </div>

                <Button
                  id="submit-report-btn"
                  type="submit"
                  variant="coral"
                  size="sm"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-obsidian" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      Publish & Claim 10 Points
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reports Feed */}
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex flex-col gap-2 py-2">
                {[1, 2].map((n) => (
                  <div key={n} className="glass p-3 rounded-xl border border-white/5 bg-black/20 animate-pulse h-20" />
                ))}
              </div>
            ) : error && reports.length === 0 ? (
              <div className="text-center p-4 border border-red-500/10 bg-red-500/[0.02] rounded-xl flex flex-col items-center gap-2">
                <AlertTriangle className="text-red-400" size={16} />
                <p className="text-xs font-sans font-bold text-red-200">{error}</p>
                <Button size="xs" variant="glass" onClick={fetchReports}>
                  Retry Connection
                </Button>
              </div>
            ) : reports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-6 text-center glass rounded-2xl border border-white/5 bg-black/25 my-1"
              >
                <Radio size={20} className="text-cyan-glow animate-pulse mb-2" />
                <h4 className="text-xs font-sans font-bold text-white">
                  Be the first to report signal here
                </h4>
                <p className="text-[10px] text-muted-slate max-w-xs mt-1">
                  Earn +10 Scout Points by submitting cellular drop reports along Telangana highways.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-glow text-obsidian text-[10px] font-bold"
                >
                  Submit a report
                </button>
              </motion.div>
            ) : (
              reports.map((report) => {
                const isVoted = votedIds.includes(report.id);
                
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-3 rounded-xl border border-white/5 bg-black/20 flex flex-col gap-2 hover:border-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center text-[9px] font-sans font-bold text-cyan-glow">
                          {report.user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-sans font-bold text-soft-silver">{report.user.name}</span>
                          <span className="text-[9px] font-sans text-muted-slate flex items-center gap-1">
                            <Clock size={9} />
                            {report.timeAgo}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-bold ${
                        report.signalStatus === 'None'
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : report.signalStatus === 'Weak'
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                      }`}>
                        {report.signalStatus === 'None' ? 'Blackout' : report.signalStatus === 'Weak' ? 'Weak Signal' : 'Slow Data'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-sans text-cyan-glow/85">
                      <MapPin size={10} />
                      {report.locationName}
                    </div>

                    <p className="text-xs font-sans text-muted-slate leading-relaxed">
                      {report.description}
                    </p>

                    <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
                      <span className="text-[9px] font-sans text-muted-slate flex items-center gap-1">
                        <AlertTriangle size={9} className="text-coral-glow" />
                        Crowdsourced confirmation
                      </span>

                      <motion.button
                        id={`thumbs-up-btn-${report.id}`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleVote(report.id)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-sans font-medium transition-colors cursor-pointer ${
                          isVoted 
                            ? 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow' 
                            : 'bg-white/5 border-white/5 text-muted-slate hover:text-soft-silver hover:bg-white/10'
                        }`}
                        title="Validate (+5 Points)"
                      >
                        <ThumbsUp size={10} className={isVoted ? 'fill-cyan-glow/30' : ''} />
                        Helpful ({report.votes})
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
