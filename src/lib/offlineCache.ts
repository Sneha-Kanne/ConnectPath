import { RouteOption } from '../types';

export const CACHE_STORAGE_KEY = 'connectpath_cached_route';

export interface CachedRouteData {
  id: string;
  name: string;
  distance: number;
  duration: number;
  signalStrength: number;
  emergencySafetyRating: number;
  coordinates: [number, number][];
  description: string;
  bestProvider?: 'Jio' | 'Airtel' | 'Vi' | 'BSNL';
  routeHealth?: number;
  confidenceScore?: number;
  deadZonesCount?: number;
  deadZones?: {
    name: string;
    coordinates: [number, number];
    expectedDurationMins?: number;
    description?: string;
  }[];
  whyThisRoute?: string;
  dataSource?: 'opencellid' | 'predicted';
  towerCount?: number;
  timestamp: number; // Unix timestamp ms
  turnsCount: number; // Turn-by-turn waypoint changes
}

/**
 * Calculates bearing between two lat/lng coordinates in degrees
 */
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

/**
 * Estimates turn count by detecting heading changes > 28 degrees along polyline
 */
export function estimateTurnCount(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 3) return 2;

  let turns = 1; // start departure
  let prevBearing: number | null = null;

  // Sample every few points to avoid microscopic micro-turns on straight segments
  const sampleStep = Math.max(1, Math.floor(coordinates.length / 80));

  for (let i = 0; i < coordinates.length - sampleStep; i += sampleStep) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + sampleStep];
    const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

    if (prevBearing !== null) {
      let diff = Math.abs(bearing - prevBearing);
      if (diff > 180) diff = 360 - diff;
      if (diff > 28) {
        turns++;
        prevBearing = bearing;
      }
    } else {
      prevBearing = bearing;
    }
  }

  return Math.max(3, turns);
}

/**
 * Compresses coordinates array by rounding lat/lng to 5 decimal places (~1.1m precision)
 * and sub-sampling if point density is exceptionally large (> 1500 points) to save localStorage space.
 */
function compressCoordinates(coordinates: [number, number][]): [number, number][] {
  if (!coordinates || coordinates.length === 0) return [];

  const round5 = (num: number) => Math.round(num * 100000) / 100000;

  // If extremely large (e.g. > 1500 points), preserve end-points and simplify intermediate step
  const step = coordinates.length > 1500 ? 2 : 1;
  const result: [number, number][] = [];

  for (let i = 0; i < coordinates.length; i += step) {
    const pt = coordinates[i];
    result.push([round5(pt[0]), round5(pt[1])]);
  }

  // Ensure last coordinate is always preserved
  const last = coordinates[coordinates.length - 1];
  const lastRounded: [number, number] = [round5(last[0]), round5(last[1])];
  const finalInList = result[result.length - 1];
  if (finalInList[0] !== lastRounded[0] || finalInList[1] !== lastRounded[1]) {
    result.push(lastRounded);
  }

  return result;
}

/**
 * Saves the full route geometry + metadata to localStorage under key 'connectpath_cached_route'
 */
export function cacheRoute(route: RouteOption): CachedRouteData {
  if (!route) {
    throw new Error('No route provided to cacheRoute()');
  }

  const turns = estimateTurnCount(route.coordinates);
  const compressedCoords = compressCoordinates(route.coordinates);

  const cachedData: CachedRouteData = {
    id: route.id,
    name: route.name,
    distance: route.distance,
    duration: route.duration,
    signalStrength: route.signalStrength,
    emergencySafetyRating: route.emergencySafetyRating,
    coordinates: compressedCoords,
    description: route.description,
    bestProvider: route.bestProvider,
    routeHealth: route.routeHealth,
    confidenceScore: route.confidenceScore,
    deadZonesCount: route.deadZonesCount,
    deadZones: route.deadZones,
    whyThisRoute: route.whyThisRoute,
    dataSource: route.dataSource,
    towerCount: route.towerCount,
    timestamp: Date.now(),
    turnsCount: turns,
  };

  try {
    const serialized = JSON.stringify(cachedData);
    localStorage.setItem(CACHE_STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to write cached route to localStorage:', err);
    // If quota exceeded, try fallback with higher compression
    try {
      const ultraCompressedCoords = compressCoordinates(compressedCoords);
      cachedData.coordinates = ultraCompressedCoords;
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cachedData));
    } catch (e2) {
      console.error('Storage quota exceeded even after compression:', e2);
    }
  }

  return cachedData;
}

/**
 * Retrieves the cached route from localStorage
 */
export function getCachedRoute(): CachedRouteData | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed: CachedRouteData = JSON.parse(raw);
    if (parsed && parsed.name && Array.isArray(parsed.coordinates)) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse cached route:', err);
  }

  return null;
}

/**
 * Removes the cached route from localStorage
 */
export function clearCachedRoute(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear cached route:', err);
  }
}

/**
 * Checks if a route is currently cached in localStorage
 */
export function isRouteCached(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    return localStorage.getItem(CACHE_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Formats timestamp into human-readable representation like "Today at 4:15 PM" or "5 mins ago"
 */
export function formatCachedTimestamp(timestamp: number): string {
  if (!timestamp) return 'recently';

  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
