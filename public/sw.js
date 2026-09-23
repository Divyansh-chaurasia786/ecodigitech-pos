const CACHE_NAME = "ecodigitech-pos-v2";

// 1. Install event: Do NOT skipWaiting automatically. Wait for explicit user action!
self.addEventListener("install", (event) => {
  // Service worker installed and waiting for user confirmation
});

// 2. Listen for explicit user confirmation message from app UI
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 3. Activate event: Clean up old caches without hijacking active window tabs
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 4. Fetch event: Network-first caching strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass service worker cache for localhost / dev mode or API calls to ensure instant live updates
  if (
    url.hostname === "localhost" ||
    url.hostname.endsWith(".localhost") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/")
  ) {
    return; // Direct network fetch, no caching delay
  }

  // Production Network-First Strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
