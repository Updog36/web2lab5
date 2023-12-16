const staticDiktafon = "diktafon-v1"
const assets = [
  "manifest.json",
  "index.html",
  "style.css",
  "/js/app.js",
  "/js/recorder.js",
  "/icons/microphone-342.png",
  "/icons/microphone-342(128).png",
  "/icons/microphone-342(256).png"
]

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(staticDiktafon);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(assets);
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(staticDiktafon);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })(),
  );
});

