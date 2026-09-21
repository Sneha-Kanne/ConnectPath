export interface CellTower {
  lat: number;
  lng: number;
  mcc?: number;
  mnc?: number;
  lac?: number;
  cellid?: number;
  range?: number;
  radio?: string;
}

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface RouteDeadZone {
  name: string;
  coordinates: [number, number];
  expectedDurationMins: number;
  description: string;
}

const CACHE_PREFIX = 'connectpath_towers_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Great-circle distance between two points in km using the Haversine formula
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
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
  return R * c;
}

/**
 * Retrieves cached cell tower data for a specific bounding box from localStorage
 */
function getCachedTowers(cacheKey: string): CellTower[] | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.towers)) {
      return parsed.towers;
    }
  } catch (err) {
    console.warn('Failed to read towers from cache:', err);
  }
  return null;
}

/**
 * Stores cell tower data in localStorage with a 24h expiration timestamp
 */
function setCachedTowers(cacheKey: string, towers: CellTower[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const payload = {
      timestamp: Date.now(),
      towers,
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to write towers to cache:', err);
  }
}

/**
 * Fetches cell towers within the bounding box using OpenCelliD API with client-side caching.
 * Endpoint: https://opencellid.org/cell/getInArea?key=YOUR_API_KEY&BBOX=minLon,minLat,maxLon,maxLat&format=json
 */
export async function getTowersInArea(bbox: BoundingBox): Promise<CellTower[]> {
  const minLon = bbox.minLng.toFixed(4);
  const minLat = bbox.minLat.toFixed(4);
  const maxLon = bbox.maxLng.toFixed(4);
  const maxLat = bbox.maxLat.toFixed(4);

  const cacheKey = `${CACHE_PREFIX}${minLon}_${minLat}_${maxLon}_${maxLat}`;
  const cached = getCachedTowers(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey =
    ((import.meta as any).env && (import.meta as any).env.VITE_OPENCELLID_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_OPENCELLID_KEY) ||
    '';

  // If no API key configured, throw so routingService falls back gracefully to predicted data
  if (!apiKey) {
    throw new Error('No OpenCelliD API key configured in VITE_OPENCELLID_KEY');
  }

  // Attempt fetch via server proxy or direct OpenCelliD API
  let responseData: any = null;

  try {
    // 1. Try local server-side proxy route first (prevents CORS issues in browser)
    const proxyUrl = `/api/celltowers?minLon=${minLon}&minLat=${minLat}&maxLon=${maxLon}&maxLat=${maxLat}&key=${encodeURIComponent(apiKey)}`;
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      responseData = await proxyRes.json();
    }
  } catch {
    // Fall back to direct OpenCelliD request
  }

  if (!responseData) {
    // 2. Direct OpenCelliD API call
    const openCellIdUrl = `https://opencellid.org/cell/getInArea?key=${apiKey}&BBOX=${minLon},${minLat},${maxLon},${maxLat}&format=json`;
    const res = await fetch(openCellIdUrl);
    if (!res.ok) {
      throw new Error(`OpenCelliD query returned status ${res.status}: ${res.statusText}`);
    }
    responseData = await res.json();
  }

  // OpenCelliD format: { cells: [ { lat, lon, mcc, mnc, lac, cellid, range, radio, ... } ], count }
  let rawCells: any[] = [];
  if (Array.isArray(responseData)) {
    rawCells = responseData;
  } else if (responseData && Array.isArray(responseData.cells)) {
    rawCells = responseData.cells;
  }

  const towers: CellTower[] = rawCells
    .filter((c: any) => typeof c.lat === 'number' && (typeof c.lon === 'number' || typeof c.lng === 'number'))
    .map((c: any) => ({
      lat: c.lat,
      lng: c.lon ?? c.lng,
      mcc: c.mcc,
      mnc: c.mnc,
      lac: c.lac,
      cellid: c.cellid,
      range: c.range,
      radio: c.radio,
    }));

  if (towers.length > 0) {
    setCachedTowers(cacheKey, towers);
  }

  return towers;
}

/**
 * Calculates signal strength (0 - 100) based on distance to the nearest cell tower.
 * Closer tower = stronger signal.
 */
export function calculateSignalStrength(
  userLat: number,
  userLng: number,
  towers: CellTower[]
): number {
  if (!towers || towers.length === 0) return 0;

  let minDistance = Infinity;
  for (const tower of towers) {
    const dist = haversineDistanceKm(userLat, userLng, tower.lat, tower.lng);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  // Mathematical signal attenuation profile:
  // <= 0.4 km: 95 - 100%
  // 0.4 km - 1.2 km: 80 - 95%
  // 1.2 km - 2.0 km: 50 - 80%
  // 2.0 km - 3.5 km: 20 - 50%
  // > 3.5 km: 0 - 20%
  if (minDistance <= 0.4) {
    return Math.round(95 + (0.4 - minDistance) * 12.5);
  } else if (minDistance <= 1.2) {
    const ratio = (1.2 - minDistance) / 0.8;
    return Math.round(80 + ratio * 15);
  } else if (minDistance <= 2.0) {
    const ratio = (2.0 - minDistance) / 0.8;
    return Math.round(50 + ratio * 30);
  } else if (minDistance <= 3.5) {
    const ratio = (3.5 - minDistance) / 1.5;
    return Math.round(15 + ratio * 35);
  } else {
    return Math.max(0, Math.round(15 - (minDistance - 3.5) * 5));
  }
}

/**
 * Identifies route segments where no cell tower is within 2km.
 */
export function findDeadZones(
  routeCoordinates: [number, number][],
  towers: CellTower[]
): RouteDeadZone[] {
  if (!routeCoordinates || routeCoordinates.length === 0) return [];
  if (!towers || towers.length === 0) {
    // If no towers at all in area, entire route is in attenuation
    const mid = routeCoordinates[Math.floor(routeCoordinates.length / 2)];
    return [
      {
        name: 'Uncharted Cellular Gap',
        coordinates: mid,
        expectedDurationMins: 8,
        description: 'No registered carrier towers detected within 2km perimeter.',
      },
    ];
  }

  const deadZonePoints: { coord: [number, number]; index: number; dist: number }[] = [];

  for (let i = 0; i < routeCoordinates.length; i++) {
    const [lat, lng] = routeCoordinates[i];
    let nearestDist = Infinity;

    for (const tower of towers) {
      const dist = haversineDistanceKm(lat, lng, tower.lat, tower.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
      }
    }

    // Segment where no tower is within 2km
    if (nearestDist > 2.0) {
      deadZonePoints.push({ coord: [lat, lng], index: i, dist: nearestDist });
    }
  }

  if (deadZonePoints.length === 0) return [];

  // Group continuous dead zone clusters
  const clusters: { coord: [number, number]; index: number; dist: number }[][] = [];
  let currentCluster: { coord: [number, number]; index: number; dist: number }[] = [];

  for (let i = 0; i < deadZonePoints.length; i++) {
    const p = deadZonePoints[i];
    if (currentCluster.length === 0) {
      currentCluster.push(p);
    } else {
      const last = currentCluster[currentCluster.length - 1];
      if (p.index - last.index <= 2) {
        currentCluster.push(p);
      } else {
        clusters.push(currentCluster);
        currentCluster = [p];
      }
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  return clusters.map((cluster, i) => {
    const centerPoint = cluster[Math.floor(cluster.length / 2)];
    const maxDist = Math.max(...cluster.map((c) => c.dist));
    const estMins = Math.max(2, Math.round(cluster.length * 1.5));

    return {
      name: `Cellular Valley Segment #${i + 1}`,
      coordinates: centerPoint.coord,
      expectedDurationMins: estMins,
      description: `Nearest cellular tower is ${maxDist.toFixed(1)} km away. Signal drops to near zero bars.`,
    };
  });
}
