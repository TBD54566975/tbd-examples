// Service Worker

const cacheName = "dwa-starter-vanillajs-vite-v1"; // Name of the cache
const cacheAssets = ["/", "style.css", "main.js"]; // Assets to cache

// Installation
self.addEventListener("install", (e) => {
  console.log("Service Worker installed");

  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("Service Worker: Caching files");
        cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener("activate", (e) => {
  console.log("Service Worker activated");

  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            console.log("Service Worker: Clearing old cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );

  // Claim control immediately after activation
  return self.clients.claim();
});

// Fetch event to serve cached assets when offline
self.addEventListener("fetch", (e) => {
  console.log("Service Worker: Fetching");
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// Listen for message from main.js to skip waiting and activate new SW immediately
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
