const staticDiktafon = "diktafon-v1"
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/js/app.js",
  "/js/recorder.js",
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

self.addEventListener("fetch", (event) => {
  event.respondWith(
      caches
          .match(event.request)
          .then((response) => {
              if (response) {
                  console.log("Found " + event.request.url + " in cache!");
                  //return response;
              }
              console.log(
                  "----------------->> Network request for ",
                  event.request.url
              );
              return fetch(event.request).then((response) => {
                  console.log("response.status = " + response.status);
                  if (response.status === 404) {
                      return caches.match("index.html");
                  }
                  return caches.open(staticCacheName).then((cache) => {
                      console.log(">>> Caching: " + event.request.url);
                      cache.put(event.request.url, response.clone());
                      return response;
                  });
              });
          })
          .catch((error) => {
              console.log("Error", event.request.url, error);
              return caches.match("index.html");
          })
  );
});
