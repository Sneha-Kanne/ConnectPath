// ConnectPath Service Worker - Resilient offline shell and map tiles
const SHELL_CACHE = 'connectpath-shell-v1';
const TILE_CACHE = 'connectpath-offline-tiles-v1';
const OFFLINE_PIXEL = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);

const offlineTileResponse = () => new Response(OFFLINE_PIXEL, {
  headers: { 'Content-Type': 'image/png' },
});

// Cache each shell file independently so one missing asset cannot abort install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      for (const request of ['/', '/index.html', '/manifest.json']) {
        try {
          await cache.add(request);
        } catch (error) {
          console.warn(`[ConnectPath SW] Could not cache ${request}`, error);
        }
      }
      await self.skipWaiting();
    })()
  );
});

// 2. Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== SHELL_CACHE && key !== TILE_CACHE)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch: Intercept requests and serve offline maps
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (
    event.request.method === 'GET' &&
    (url.hostname === 'tile.openstreetmap.org' || url.hostname.endsWith('.tile.openstreetmap.org'))
  ) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok || networkResponse.type === 'opaque') {
            await cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          return offlineTileResponse();
        }
      })
    );
    return;
  }

  // Network-first for app requests, with runtime caching for offline startup.
  if (url.origin === self.location.origin && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      }).catch(() => caches.match(event.request).then((cachedResponse) =>
        cachedResponse || caches.match('/index.html')
      ))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});