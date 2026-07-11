const CACHE_NAME = "cadaya-connect-v16";
const STATIC_ASSETS = [
  "./styles-cadaya-v3.css?v=20260710-16",
  "./site-config.js?v=20260710-16",
  "./app-cadaya-v3.js?v=20260710-16",
  "./manifest.webmanifest",
  "./grupo-cadaya.vcf",
  "./robots.txt",
  "./sitemap.xml",
  "./assets/logo-cadaya.png",
  "./assets/hero-bodega-v14.webp",
  "./assets/vivedog-product-v14.webp",
  "./assets/cannabis-product-v14.webp",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/og-cadaya-v14.webp",
  "./assets/qr-cadaya-premium-logo.png?v=20260710-11"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      })
    )
  );
});
