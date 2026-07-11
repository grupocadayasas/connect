const CACHE_NAME="cadaya-connect-v21";
const STATIC_ASSETS=[
"./styles-cadaya-v3.css?v=20260710-21",
"./site-config.js?v=20260710-21",
"./app-cadaya-v3.js?v=20260710-21",
"./manifest.webmanifest","./grupo-cadaya.vcf","./robots.txt","./sitemap.xml",
"./assets/logo-cadaya.png","./assets/hero-bodega-v14.webp",
"./assets/vivedog-product-v14.webp","./assets/cannabis-product-v14.webp",
"./assets/icon-192.png","./assets/icon-512.png","./assets/og-cadaya-v14.webp",
"./assets/qr-cadaya-premium-logo.png?v=20260710-11",
"./assets/logo-purina-oficial.webp",
"./assets/logo-dog-chow-oficial.webp",
"./assets/logo-cat-chow-oficial.webp",
"./assets/logo-felix-oficial.webp",
"./assets/logo-fancy-feast-oficial.webp",
"./assets/logo-excellent-oficial.webp",
"./assets/logo-pro-plan-oficial.webp"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(STATIC_ASSETS)))});
self.addEventListener("message",e=>{if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{const r=e.request;if(r.mode==="navigate"){e.respondWith(fetch(r).then(resp=>{const copy=resp.clone();caches.open(CACHE_NAME).then(c=>c.put("./index.html",copy));return resp}).catch(()=>caches.match("./index.html")));return}if(r.method!=="GET")return;e.respondWith(caches.match(r).then(cached=>cached||fetch(r).then(resp=>{const copy=resp.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));return resp})))});
