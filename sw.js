// This code executes in its own worker or thread
const urlsToCache = [
  // TODO: specific all files
  "index.html",
  "/favicon/favicon.ico",
  "/style.css",
  "/post2scoreboard.js",
  "/hall.js",
  "/game.js",
  "/sin-slavy.html",
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
  event.waitUntil(async () => {
    const cache = await caches.open("pwa-assets");
    return cache.addAll(urlsToCache);
  });
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // It can update the cache to serve updated content on the next request
      return cachedResponse || fetch(event.request);
    })
  );
});
