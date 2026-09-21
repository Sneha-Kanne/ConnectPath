import React from 'react';
import { Wifi, Activity } from 'lucide-react';
import { RouteOption } from '../types';

interface ConnectivityTimelineProps {
  route: RouteOption;
}

export const ConnectivityTimeline: React.FC<ConnectivityTimelineProps> = ({ route }) => {
  // Signal points based on route type
  const signalPoints = route.id === 'fastest'
    ? [90, 75, 40, 10, 45, 80, 50, 15, 60, 95] // fastest has deep drops
    : route.id === 'connectivity'
    ? [95, 90, 85, 95, 90, 98, 92, 95, 90, 98] // connectivity is stable
    : [88, 80, 65, 75, 85, 80, 70, 88, 92, 96]; // emergency is balanced

  const pointsCount = signalPoints.length;
  const width = 360;
  const height = 48;

  const svgPath = signalPoints.map((val, i) => {
    const x = (i / (pointsCount - 1)) * width;
    const y = height - (val / 100) * height + 4;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const fillPath = `${svgPath} L ${width} ${height} L 0 ${height} Z`;
  const lineColor = route.id === 'fastest' ? 'var(--red)' : 'var(--accent)';

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-1.5 w-full"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        className="flex items-center justify-between text-[10px] font-semibold"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <span className="flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
          <Wifi size={12} />
          Signal along route
        </span>
        <span className="flex items-center gap-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
          <Activity size={10} style={{ color: 'var(--accent)' }} />
          Avg {route.signalStrength}%
        </span>
      </div>

      <div
        className="relative w-full h-14 rounded-lg overflow-hidden py-1 px-1"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="signal-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="50%" stopColor={lineColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#signal-gradient)" />
          <path
            d={svgPath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Timeline markers */}
        <div
          className="absolute inset-x-3 bottom-0.5 flex justify-between text-[8px] font-sans select-none"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>Start</span>
          <span>{Math.round(route.duration / 2)} min</span>
          <span>{route.duration} min</span>
        </div>

        {/* Dead zone marker */}
        {route.id === 'fastest' && (
          <div className="absolute left-[33%] top-2 flex flex-col items-center pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)' }} />
            <span className="text-[7px] font-semibold mt-0.5" style={{ color: 'var(--red)' }}>
              dead zone
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


