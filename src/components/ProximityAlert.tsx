import React, { useEffect, useMemo } from 'react';
import { Radio, AlertOctagon, Navigation, ShieldCheck } from 'lucide-react';

export interface DeadZoneInfo {
  name: string;
  coordinates: [number, number];
  expectedDurationMins?: number;
  description?: string;
}

export interface ProximityAlertProps {
  userLocation: { lat: number; lng: number } | null;
  deadZones?: DeadZoneInfo[];
  isTracking?: boolean;
  thresholdKm?: number;
  onCacheRoute?: () => void;
  onProximityChange?: (state: {
    isInProximity: boolean;
    distanceKm: number;
    deadZoneName: string;
    expectedDurationMins: number;
  }) => void;
}

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (degree: number) => (degree * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export const ProximityAlert: React.FC<ProximityAlertProps> = ({
  userLocation,
  deadZones = [],
  isTracking = false,
  thresholdKm = 2.0,
  onCacheRoute,
  onProximityChange,
}) => {
  // Find nearest dead zone
  const nearestDeadZone = useMemo(() => {
    if (!userLocation || !deadZones || deadZones.length === 0) {
      return null;
    }

    let minDistance = Infinity;
    let closestZone: DeadZoneInfo | null = null;

    for (const zone of deadZones) {
      const distance = calculateHaversineDistanceKm(
        userLocation.lat,
        userLocation.lng,
        zone.coordinates[0],
        zone.coordinates[1]
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestZone = zone;
      }
    }

    if (!closestZone) return null;

    return {
      zone: closestZone,
      distanceKm: minDistance,
      isInProximity: minDistance <= thresholdKm,
    };
  }, [userLocation, deadZones, thresholdKm]);

  // Synchronize with parent state
  useEffect(() => {
    if (!onProximityChange) return;

    if (!isTracking || !nearestDeadZone) {
      onProximityChange({
        isInProximity: false,
        distanceKm: 0,
        deadZoneName: '',
        expectedDurationMins: 0,
      });
      return;
    }

    onProximityChange({
      isInProximity: nearestDeadZone.isInProximity,
      distanceKm: nearestDeadZone.distanceKm,
      deadZoneName: nearestDeadZone.zone.name,
      expectedDurationMins: nearestDeadZone.zone.expectedDurationMins || 5,
    });
  }, [isTracking, nearestDeadZone, onProximityChange]);

  if (!isTracking || !userLocation || !nearestDeadZone) {
    return null;
  }

  // Floating live proximity telemetry pill on bottom right above map
  return (
    <div className="hidden sm:flex items-center gap-2 bg-obsidian/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-2xl z-30 pointer-events-none text-[10px] font-sans">
      {nearestDeadZone.isInProximity ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-glow opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-glow" />
          </span>
          <AlertOctagon size={12} className="text-coral-glow animate-pulse" />
          <span className="font-extrabold text-coral-glow tracking-wider uppercase">
            Proximity Alert:
          </span>
          <span className="text-soft-silver">
            {nearestDeadZone.zone.name} in{' '}
            <span className="font-mono text-white font-bold">{nearestDeadZone.distanceKm} km</span>
          </span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
          <Navigation size={11} className="text-cyan-glow" />
          <span className="font-bold text-muted-slate uppercase tracking-wider">
            GPS Monitored:
          </span>
          <span className="text-soft-silver">
            Nearest dropout {nearestDeadZone.distanceKm} km away ({nearestDeadZone.zone.name})
          </span>
        </>
      )}
    </div>
  );
};
