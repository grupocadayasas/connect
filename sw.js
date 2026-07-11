const CACHE_NAME = "cadaya-connect-v9";
const ASSETS = [
  "./",
  "./index.html",
  "./styles-cadaya-v3.css?v=20260710-9",
  "./app-cadaya-v3.js?v=20260710-9",
  "./manifest.webmanifest",
  "./grupo-cadaya.vcf",
  "./assets/logo-cadaya.png",
  "./assets/hero-bodega-v3.jpg?v=20260710-3",
  "./assets/vivedog-product.jpg",
  "./assets/cannabis-product.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/og-cadaya.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
