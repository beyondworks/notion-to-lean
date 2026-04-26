const CACHE_VERSION = "nolio-pwa-v26-20260426-tabbar-zlayer";
const APP_SHELL = [
  "/manifest.json",
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/vendor/react.production.min.js",
  "/vendor/react-dom.production.min.js",
  "/vendor/babel.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_APP_CACHE") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((clients) => {
        clients.forEach((client) => {
          const url = new URL(client.url);
          if (url.origin === location.origin && (url.pathname === "/app" || url.pathname.startsWith("/design/"))) {
            client.navigate(client.url);
          }
        });
      })
  );
});

/** Content-hash paths are immutable and safe to cache-first */
function isImmutableAsset(pathname) {
  return pathname.startsWith("/_next/static/");
}

async function putOk(req, res) {
  if (res && res.ok && res.type !== "opaque") {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(req, res.clone());
  }
  return res;
}

function networkFirst(req, fallbackPath) {
  return fetch(req)
    .then((res) => putOk(req, res))
    .catch(() => caches.match(req).then((cached) => cached || (fallbackPath ? caches.match(fallbackPath) : null)));
}

function cacheFirst(req) {
  return caches.match(req).then((cached) => {
    if (cached) return cached;
    return fetch(req).then((res) => putOk(req, res));
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== location.origin) return;
  if (req.method !== "GET") return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, "/offline.html"));
    return;
  }

  if (isImmutableAsset(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(networkFirst(req));
});
