import { useMemo } from 'react';

export interface RouteDeviationResult {
  isDeviated: boolean;
  distanceFromRoute: number; // in meters
  deviationPercentage: number; // 0 to 100+ %
  nearestPointIndex: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;
const DEVIATION_THRESHOLD_METERS = 200; // 200 meters trigger

/**
 * Calculates Great-Circle distance between two coordinates using Haversine formula
 * Returns distance in meters.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates perpendicular or nearest distance from point P to line segment AB in meters
 */
function distanceToSegmentMeters(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const dAB = haversineDistanceMeters(aLat, aLng, bLat, bLng);
  if (dAB === 0) return haversineDistanceMeters(pLat, pLng, aLat, aLng);

  // Approximate flat-earth projection for local segment cross-track
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cosLat = Math.cos(toRad((aLat + bLat) / 2));
  const px = (pLng - aLng) * cosLat;
  const py = pLat - aLat;
  const bx = (bLng - aLng) * cosLat;
  const by = bLat - aLat;

  const t = Math.max(0, Math.min(1, (px * bx + py * by) / (bx * bx + by * by)));
  const projLat = aLat + t * (bLat - aLat);
  const projLng = aLng + t * (bLng - aLng);

  return haversineDistanceMeters(pLat, pLng, projLat, projLng);
}

export function useRouteDeviation(
  currentLocation: Coordinates | null,
  routeCoordinates: [number, number][] | undefined | null,
  thresholdMeters: number = DEVIATION_THRESHOLD_METERS
): RouteDeviationResult {
  return useMemo(() => {
    if (!currentLocation || !routeCoordinates || routeCoordinates.length === 0) {
      return {
        isDeviated: false,
        distanceFromRoute: 0,
        deviationPercentage: 0,
        nearestPointIndex: -1,
      };
    }

    let minDistance = Infinity;
    let nearestIndex = 0;

    // 1. Point-to-point check
    for (let i = 0; i < routeCoordinates.length; i++) {
      const [rLat, rLng] = routeCoordinates[i];
      const d = haversineDistanceMeters(currentLocation.lat, currentLocation.lng, rLat, rLng);
      if (d < minDistance) {
        minDistance = d;
        nearestIndex = i;
      }
    }

    // 2. Segment check between consecutive points for continuous precision
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const [aLat, aLng] = routeCoordinates[i];
      const [bLat, bLng] = routeCoordinates[i + 1];
      const segDist = distanceToSegmentMeters(
        currentLocation.lat,
        currentLocation.lng,
        aLat,
        aLng,
        bLat,
        bLng
      );
      if (segDist < minDistance) {
        minDistance = segDist;
        nearestIndex = i;
      }
    }

    const roundedDistance = Math.round(minDistance);
    const isDeviated = roundedDistance > thresholdMeters;
    const deviationPercentage = Math.round(
      Math.min(250, (roundedDistance / thresholdMeters) * 100)
    );

    return {
      isDeviated,
      distanceFromRoute: roundedDistance,
      deviationPercentage,
      nearestPointIndex: nearestIndex,
    };
  }, [currentLocation?.lat, currentLocation?.lng, routeCoordinates, thresholdMeters]);
}
