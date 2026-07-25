const CACHE_NAME = "goldmail-v3";
const APP_SHELL = [
  "/", "/dashboard", "/dashboard/new", "/dashboard/documents",
  "/dashboard/signatures", "/dashboard/settings", "/manifest.json",
  "/sql-wasm.wasm", "/sql-wasm-browser.wasm", "/favicon.ico",
  "/icons/icon-192.png", "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Une ressource indisponible ne doit pas empêcher l'installation entière du PWA.
      await Promise.allSettled(APP_SHELL.map((asset) => cache.add(asset)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin || new URL(event.request.url).pathname.startsWith("/api/")) return;
  event.respondWith(caches.match(event.request).then((cached) => {
    const network = fetch(event.request).then((response) => {
      if (response.ok && response.type === "basic") caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => cached);
    return cached || network;
  }));
});