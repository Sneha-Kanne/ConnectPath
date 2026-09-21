import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Compass,
  Zap,
  Radio,
  Clock,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { JourneyRecord } from '../types';
import { getStoredJourneys } from '../lib/feedbackService';
import { useLanguage } from '../hooks/useLanguage';

export const UserAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const [journeys, setJourneys] = useState<JourneyRecord[]>(() => getStoredJourneys());

  useEffect(() => {
    setJourneys(getStoredJourneys());
  }, []);

  // Compute metrics
  const totalDistance = Math.round(
    journeys.reduce((sum, j) => sum + (j.distanceKm || 0), 0) * 10
  ) / 10;

  const totalDeadZoneMins = journeys.reduce((sum, j) => sum + (j.deadZoneMins || 0), 0);

  const routesTakenCount = journeys.length;

  // Carrier distribution
  const carrierCounts: Record<string, number> = {};
  for (const j of journeys) {
    carrierCounts[j.carrier] = (carrierCounts[j.carrier] || 0) + 1;
  }

  let topCarrier = 'Jio';
  let maxCarrierCount = 0;
  for (const [c, count] of Object.entries(carrierCounts)) {
    if (count > maxCarrierCount) {
      maxCarrierCount = count;
      topCarrier = c;
    }
  }

  // Chart data: last 10 journeys formatted
  const chartData = [...journeys]
    .reverse()
    .slice(-10)
    .map((j, i) => ({
      index: `#${i + 1}`,
      name: j.routeName.length > 18 ? `${j.routeName.slice(0, 18)}...` : j.routeName,
      fullName: j.routeName,
      signalStrength: j.avgSignalPercent,
      deadZones: j.deadZoneMins,
      carrier: j.carrier,
      distance: j.distanceKm,
      date: j.date,
    }));

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass p-2.5 rounded-xl border border-cyan-glow/30 bg-obsidian/95 shadow-xl text-left">
          <p className="text-[11px] font-bold text-white mb-0.5">{data.fullName}</p>
          <div className="flex items-center gap-2 text-[10px] text-cyan-glow font-mono">
            <span>Signal: {data.signalStrength}%</span>
            <span>•</span>
            <span>Carrier: {data.carrier}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-muted-slate font-sans mt-0.5">
            <span>Dead zones: {data.deadZones} mins</span>
            <span>•</span>
            <span>{data.distance} km</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-sans font-bold text-white tracking-wide flex items-center gap-1.5">
            <Activity size={16} className="text-cyan-glow" />
            {t('analytics_title', 'Travel history')}
          </h3>
          <p className="text-[11px] text-muted-slate">
            {t('analytics_subtitle', 'Your routes, network use, and time spent without signal')}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow text-[10px] font-mono font-bold">
          LIVE
        </span>
      </div>

      {/* Metric 4-Card Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Distance */}
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-slate mb-1">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">
              {t('total_distance', 'Total Distance')}
            </span>
            <Compass size={14} className="text-cyan-glow" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-extrabold text-white">
              {totalDistance}
            </span>
            <span className="text-[10px] font-sans text-cyan-glow font-bold">km</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-glow h-full rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Total Dead Zone Time */}
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-slate mb-1">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">
              {t('dead_zone_time', 'Time in Dead Zones')}
            </span>
            <Clock size={14} className="text-coral-glow" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-extrabold text-coral-glow">
              {totalDeadZoneMins}
            </span>
            <span className="text-[10px] font-sans text-muted-slate font-bold">mins</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-coral-glow h-full rounded-full" style={{ width: '28%' }} />
          </div>
        </div>

        {/* Routes Taken */}
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-slate mb-1">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">
              {t('routes_completed', 'Routes Taken')}
            </span>
            <Layers size={14} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-extrabold text-white">
              {routesTakenCount}
            </span>
            <span className="text-[10px] font-sans text-emerald-400 font-bold">trips</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Most Used Carrier */}
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-slate mb-1">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">
              {t('top_carrier', 'Most Used Carrier')}
            </span>
            <Radio size={14} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-extrabold text-amber-300 truncate">
              {topCarrier} 5G
            </span>
          </div>
          <div className="text-[9px] text-muted-slate mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {Math.round((maxCarrierCount / (routesTakenCount || 1)) * 100)}% of trips
          </div>
        </div>
      </div>

      {/* Signal Quality Trend Chart (Last 10 Journeys) */}
      <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-white">
            <TrendingUp size={14} className="text-cyan-glow" />
            <span>{t('signal_trend_title', 'Signal Quality Trend (Last 10 Journeys)')}</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-glow">0-100% Signal</span>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-48 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="index"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="signalStrength"
                stroke="#00F0FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#signalGradient)"
                dot={{ r: 3, fill: '#00F0FF', stroke: '#0B0F17', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#00F0FF', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carrier Allocation Bar */}
      <div className="p-3 rounded-xl border border-white/5 bg-black/30 space-y-2">
        <span className="text-[10px] font-sans font-bold text-soft-silver uppercase tracking-wider block">
          Carrier Coverage Mix
        </span>
        <div className="flex gap-2">
          {['Jio', 'Airtel', 'Vi', 'BSNL'].map((carrier) => {
            const count = carrierCounts[carrier] || 0;
            const pct = Math.round((count / (routesTakenCount || 1)) * 100);
            return (
              <div
                key={carrier}
                className="flex-1 p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center"
              >
                <span className="text-[11px] font-bold text-white">{carrier}</span>
                <span className="text-[10px] font-mono text-cyan-glow">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
