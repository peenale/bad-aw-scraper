const CACHE_NAME = 'animeworld-v1';
const ASSETS_TO_CACHE = [
  './',
  './app.html',
  './pages/search.html',
  './pages/title.html',
  './manifest.json',
  './images/logo192.png',
  './images/logo512.png',
  './images/back.svg',
  './js/scraper.js',
  './css/style.css'
];

// 1. INSTALL: Save the core UI files immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Force the new SW to take over immediately
});

// 2. FETCH: The "Cache-First" Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached file if it exists, otherwise fetch from internet
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // OPTIONAL: Add new files to cache as we find them (Dynamic Caching)
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});