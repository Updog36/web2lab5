const staticDiktafon = "diktafon-v1"
const assets = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/record.js",
  "/icons/microphone-342.png",
  "/icons/microphone-342(128).png"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDiktafon).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })