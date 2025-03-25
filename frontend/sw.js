// This code executes in its own worker or thread
const urlsToCache = [
  // HTML, CSS, JS files
  "index.html",
  "/favicon/favicon.ico",
  "/style-v5.css",
  "/post2scoreboard.js",
  "/hall.js",
  "/game-v7.js",
  "/confetti.min.js",
  "/sin-slavy.html",
  // Images
  "/images/tutorial.gif",
  // Game data files
  "/data/5x5_1-5_levels.json",
  "/data/5x5_1-7_levels.json",
  "/data/5x5_1-9_levels.json",
  "/data/5x5_-1-9_levels.json",
  "/data/5x5_-1-12_levels.json",
  "/data/5x5_-1-19_levels.json",
  "/data/5x5_-9-19_levels.json",
  "/data/5x5_-19-19_levels.json",
  // Web manifest
  "/favicon/site.webmanifest",
  // fonts
  "/fonts/Roboto-Black.woff",
  "/fonts/Roboto-Black.woff2",
  "/fonts/Roboto-Black.svg",
  "/fonts/Roboto-BoldItalic.woff",
  "/fonts/Roboto-BoldItalic.woff2",
  "/fonts/Roboto-BoldItalic.svg",
  "/fonts/Roboto-Bold.woff",
  "/fonts/Roboto-Bold.woff2",
  "/fonts/Roboto-Bold.svg",
  "/fonts/Roboto-BoldItalic.woff",
  "/fonts/Roboto-BoldItalic.woff2",
  "/fonts/Roboto-BoldItalic.svg",
  "/fonts/Roboto-Italic.woff",
  "/fonts/Roboto-Italic.woff2",
  "/fonts/Roboto-Italic.svg",
  "/fonts/Roboto-Light.woff",
  "/fonts/Roboto-Light.woff2",
  "/fonts/Roboto-Light.svg",
  "/fonts/Roboto-LightItalic.woff",
  "/fonts/Roboto-LightItalic.woff2",
  "/fonts/Roboto-LightItalic.svg",
  "/fonts/Roboto-Medium.woff",
  "/fonts/Roboto-Medium.woff2",
  "/fonts/Roboto-Medium.svg",
  "/fonts/Roboto-MediumItalic.woff",
  "/fonts/Roboto-MediumItalic.woff2",
  "/fonts/Roboto-MediumItalic.svg",
  "/fonts/Roboto-Regular.woff",
  "/fonts/Roboto-Regular.woff2",
  "/fonts/Roboto-Regular.svg",
  "/fonts/Roboto-Thin.woff",
  "/fonts/Roboto-Thin.woff2",
  "/fonts/Roboto-Thin.svg",
  "/fonts/Roboto-ThinItalic.woff",
  "/fonts/Roboto-ThinItalic.woff2",
  "/fonts/Roboto-ThinItalic.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open("pwa-assets");
      return cache.addAll(urlsToCache);
    })()
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response immediately if available
      const fetchPromise = fetch(event.request)
        .then((response) => {
          // Don't cache responses that aren't successful
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }
          // Clone and cache the new response for next time
          const responseToCache = response.clone();
          caches.open("pwa-assets").then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Falls back to cached response on network failure
        });

      return cachedResponse || fetchPromise;
    })
  );
});
