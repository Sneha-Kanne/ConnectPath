/**
 * ConnectPath Offline Tile & Map Storage Service
 * Pre-downloads and stores OpenStreetMap tile image blobs into IndexedDB / CacheStorage
 * for true offline map viewing and navigation even when entirely disconnected.
 */

const DB_NAME = 'connectpath_offline_maps_db';
const DB_VERSION = 1;
const TILE_STORE_NAME = 'map_tiles';
const REGION_STORE_NAME = 'downloaded_regions';
const TILE_CACHE_NAME = 'offline-tiles-v1';

export interface DownloadedRegion {
  id: string;
  name: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  minZoom: number;
  maxZoom: number;
  tileCount: number;
  sizeBytes: number;
  downloadedAt: number;
}

export interface TileDownloadProgress {
  total: number;
  completed: number;
  percent: number;
  bytesDownloaded: number;
  currentUrl?: string;
  errorCount: number;
  status: 'idle' | 'downloading' | 'completed' | 'error' | 'cancelled';
}

/**
 * Open IndexedDB database
 */
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TILE_STORE_NAME)) {
        db.createObjectStore(TILE_STORE_NAME, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(REGION_STORE_NAME)) {
        db.createObjectStore(REGION_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Converts Latitude, Longitude, and Zoom to OpenStreetMap Tile X/Y coordinates
 */
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n);
  return {
    x: Math.max(0, Math.min(n - 1, x)),
    y: Math.max(0, Math.min(n - 1, y))
  };
}

export function getTilesForBounds(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  minZoom: number,
  maxZoom: number,
): string[] {
  const urls: string[] = [];

  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const topLeft = latLngToTile(maxLat, minLng, zoom);
    const bottomRight = latLngToTile(minLat, maxLng, zoom);
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        urls.push(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`);
      }
    }
  }

  return urls;
}

export async function downloadOfflineMap(
  name: string,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  minZoom: number,
  maxZoom: number,
  onProgress?: (percentage: number) => void,
): Promise<string> {
  const cache = await caches.open('offline-tiles-v1');
  const tileUrls = getTilesForBounds(
    bounds.minLat,
    bounds.maxLat,
    bounds.minLng,
    bounds.maxLng,
    minZoom,
    maxZoom,
  );
  let completed = 0;
  let cachedCount = 0;

  for (const tileUrl of tileUrls) {
    const response = await fetch(tileUrl);
    if (response.ok) {
      await cache.put(tileUrl, response.clone());
      cachedCount++;
    }
    completed++;
    onProgress?.(Math.round((completed / tileUrls.length) * 100));
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return `${name} downloaded successfully. ${cachedCount} tiles cached.`;
}

/**
 * Generates all Tile Keys/URLs covering a bounding box across specified zoom levels
 */
export function getTileKeysForBounds(
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  minZoom: number = 8,
  maxZoom: number = 14
): { key: string; url: string; z: number; x: number; y: number }[] {
  const tiles: { key: string; url: string; z: number; x: number; y: number }[] = [];

  for (let z = minZoom; z <= maxZoom; z++) {
    const minTile = latLngToTile(bounds.maxLat, bounds.minLng, z);
    const maxTile = latLngToTile(bounds.minLat, bounds.maxLng, z);

    const startX = Math.min(minTile.x, maxTile.x);
    const endX = Math.max(minTile.x, maxTile.x);
    const startY = Math.min(minTile.y, maxTile.y);
    const endY = Math.max(minTile.y, maxTile.y);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${z}/${x}/${y}`;
        const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
        tiles.push({ key, url, z, x, y });
      }
    }
  }

  return tiles;
}

/**
 * Generates tiles along a route corridor instead of filling its entire bounding rectangle.
 */
export function getTileKeysForRoute(
  coordinates: [number, number][],
  minZoom: number = 8,
  maxZoom: number = 12,
  paddingTiles: number = 1
): { key: string; url: string; z: number; x: number; y: number }[] {
  if (!coordinates.length) return [];

  const tilesByKey = new Map<string, { key: string; url: string; z: number; x: number; y: number }>();

  for (let z = minZoom; z <= maxZoom; z++) {
    for (let index = 0; index < coordinates.length - 1; index++) {
      const [startLat, startLng] = coordinates[index];
      const [endLat, endLng] = coordinates[index + 1];
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(endLat - startLat), Math.abs(endLng - startLng)) * 100));

      for (let step = 0; step <= steps; step++) {
        const progress = step / steps;
        const lat = startLat + (endLat - startLat) * progress;
        const lng = startLng + (endLng - startLng) * progress;
        const centerTile = latLngToTile(lat, lng, z);

        for (let x = centerTile.x - paddingTiles; x <= centerTile.x + paddingTiles; x++) {
          for (let y = centerTile.y - paddingTiles; y <= centerTile.y + paddingTiles; y++) {
            const tileLimit = Math.pow(2, z) - 1;
            if (x < 0 || y < 0 || x > tileLimit || y > tileLimit) continue;
            const key = `${z}/${x}/${y}`;
            if (!tilesByKey.has(key)) {
              tilesByKey.set(key, {
                key,
                url: `https://tile.openstreetmap.org/${key}.png`,
                z,
                x,
                y,
              });
            }
          }
        }
      }
    }
  }

  return Array.from(tilesByKey.values());
}

/**
 * Estimates tile count and approximate download size before starting a download.
 */
export function estimateTileCount(
  coordinates: [number, number][],
  minZoom: number = 9,
  maxZoom: number = 13,
  paddingDeg: number = 0.035
): { tileCount: number; estimatedMB: string } {
  const tiles = getTileKeysForRoute(coordinates, minZoom, maxZoom);
  // Average OSM tile is ~12-15 KB
  const estimatedBytes = tiles.length * 13 * 1024;
  return {
    tileCount: tiles.length,
    estimatedMB: formatBytes(estimatedBytes),
  };
}

/**
 * Calculates bounding box for a given polyline route with added padding
 */
export function calculateRouteBoundingBox(
  coordinates: [number, number][],
  paddingDeg: number = 0.04
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  if (!coordinates || coordinates.length === 0) {
    // Default to Hyderabad Telangana bounding area
    return {
      minLat: 17.20 - paddingDeg,
      maxLat: 17.60 + paddingDeg,
      minLng: 78.20 - paddingDeg,
      maxLng: 78.70 + paddingDeg,
    };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return {
    minLat: minLat - paddingDeg,
    maxLat: maxLat + paddingDeg,
    minLng: minLng - paddingDeg,
    maxLng: maxLng + paddingDeg,
  };
}

/**
 * Stores a single tile blob in IndexedDB and Service Worker CacheStorage.
 * Saves under all three OSM subdomain variants (a/b/c) so the Service Worker
 * can intercept regardless of which subdomain Leaflet requests.
 */
export async function saveTileToOfflineStore(key: string, blob: Blob): Promise<void> {
  let cacheSaved = false;
  let indexedDbSaved = false;

  // 1. Save to CacheStorage under all 3 subdomain URLs so SW intercept always hits
  if ('caches' in window) {
    try {
      const cache = await caches.open(TILE_CACHE_NAME);
      const responseHeaders = {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'X-ConnectPath-Offline': 'true',
      };
      const subdomains = ['a', 'b', 'c'];
      const response = new Response(blob, { headers: responseHeaders });
      for (const subdomain of subdomains) {
        const tileUrl = `https://${subdomain}.tile.openstreetmap.org/${key}.png`;
        await cache.put(tileUrl, response.clone());
      }
      cacheSaved = true;
    } catch (err) {
      console.warn('[offlineTileService] CacheStorage save failed:', err);
    }
  }

  // 2. Also save blob to IndexedDB as backup (for getTileFromOfflineStore)
  try {
    const db = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(TILE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(TILE_STORE_NAME);
      store.put({ key, blob, timestamp: Date.now() });
      tx.oncomplete = () => {
        indexedDbSaved = true;
        resolve();
      };
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Tile transaction aborted'));
    });
  } catch (err) {
    console.warn('[offlineTileService] IndexedDB save failed:', err);
  }

  if (!cacheSaved && !indexedDbSaved) {
    throw new Error(`Tile ${key} could not be saved to offline storage`);
  }
}

/**
 * Retrieves a tile blob from IndexedDB if offline
 */
export async function getTileFromOfflineStore(key: string): Promise<Blob | null> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(TILE_STORE_NAME, 'readonly');
      const store = tx.objectStore(TILE_STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Downloads all tiles for a route's bounding corridor with progress callback.
 * Uses concurrent batches of 6 to stay within browser connection limits.
 */
export async function downloadRouteOfflineMap(
  regionName: string,
  coordinates: [number, number][],
  minZoom: number = 9,
  maxZoom: number = 13,
  onProgress?: (progress: TileDownloadProgress) => void
): Promise<DownloadedRegion> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('You are offline. Connect to the internet before downloading a map.');
  }

  const bounds = calculateRouteBoundingBox(coordinates, 0.035);
  const tiles = getTileKeysForRoute(coordinates, minZoom, maxZoom);

  const regionId = `region-${Date.now()}`;
  let completed = 0;
  let errorCount = 0;
  let totalBytes = 0;

  // Fire initial progress event
  if (onProgress) {
    onProgress({
      total: tiles.length,
      completed: 0,
      percent: 0,
      bytesDownloaded: 0,
      errorCount: 0,
      status: 'downloading',
    });
  }

  // Keep requests gentle because the public OSM tile service is rate limited.
  const chunkSize = 3;

  for (let i = 0; i < tiles.length; i += chunkSize) {
    const chunk = tiles.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (tile) => {
        try {
          // Use cache: 'no-store' to bypass browser HTTP cache so blobs are fresh
          const resp = await fetch(tile.url, {
            mode: 'cors',
            cache: 'no-store',
          });
          if (resp.ok) {
            const blob = await resp.blob();
            totalBytes += blob.size;
            await saveTileToOfflineStore(tile.key, blob);
          } else {
            errorCount++;
            console.warn(`[offlineTileService] Tile fetch ${resp.status}: ${tile.url}`);
          }
        } catch (err) {
          errorCount++;
          console.warn('[offlineTileService] Tile fetch error:', tile.url, err);
        } finally {
          completed++;
          if (onProgress) {
            const percent = Math.min(100, Math.round((completed / tiles.length) * 100));
            onProgress({
              total: tiles.length,
              completed,
              percent,
              bytesDownloaded: totalBytes,
              currentUrl: tile.url,
              errorCount,
              status: completed >= tiles.length ? 'completed' : 'downloading',
            });
          }
        }
      })
    );
  }

  const region: DownloadedRegion = {
    id: regionId,
    name: regionName || 'Corridor Offline Map',
    bounds,
    minZoom,
    maxZoom,
    tileCount: completed - errorCount,
    sizeBytes: totalBytes,
    downloadedAt: Date.now(),
  };

  if (region.tileCount === 0) {
    throw new Error('No map tiles were downloaded. Check the network connection and tile access.');
  }

  // Record region metadata in IndexedDB
  try {
    const db = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(REGION_STORE_NAME, 'readwrite');
      tx.objectStore(REGION_STORE_NAME).put(region);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Offline region transaction aborted'));
    });
  } catch (err) {
    console.warn('[offlineTileService] Could not save region record:', err);
  }

  return region;
}

/**
 * Returns all downloaded offline map regions
 */
export async function getDownloadedRegions(): Promise<DownloadedRegion[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(REGION_STORE_NAME, 'readonly');
      const store = tx.objectStore(REGION_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Clears all cached offline map tiles and region records
 */
export async function clearOfflineMapStorage(): Promise<void> {
  if ('caches' in window) {
    try {
      await caches.delete(TILE_CACHE_NAME);
    } catch {}
  }

  try {
    const db = await openOfflineDB();
    const tx = db.transaction([TILE_STORE_NAME, REGION_STORE_NAME], 'readwrite');
    tx.objectStore(TILE_STORE_NAME).clear();
    tx.objectStore(REGION_STORE_NAME).clear();
  } catch (err) {
    console.warn('[offlineTileService] Could not clear offline tile store:', err);
  }
}

/**
 * Format bytes to readable MB/KB string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}
