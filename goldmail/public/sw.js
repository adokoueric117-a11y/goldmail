const CACHE_NAME = "goldmail-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/dashboard",
  "/dashboard/new",
  "/dashboard/signatures",
  "/dashboard/settings",
  "/manifest.json",
  "/sql-wasm.wasm",
  "/sql-wasm-browser.wasm",
  "/favicon.ico",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg"
];

// Install: pre-cache core App Shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[SW] Cache addAll warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for app assets, Network-only for /api/send-email
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or API send-email (network only)
  if (event.request.method !== "GET" || url.pathname.startsWith("/api/send-email")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
