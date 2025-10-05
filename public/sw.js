// Simple service worker for PWA support
const CACHE_NAME = 'ev-bunker-v1';
const urlsToCache = [
  '/',
  '/assets/logo.png'
];

// Add install event listener
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to install service worker:', error);
      })
  );
});

// Add activate event listener
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

// Add fetch event listener
self.addEventListener('fetch', (event) => {
  // Simple cache-first strategy for static assets
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
        .catch((error) => {
          console.error('Fetch failed:', error);
          // Try to fetch the resource from the network
          return fetch(event.request).catch(() => {
            // If both cache and network fail, do nothing
            return new Response('', { status: 404 });
          });
        })
    );
  }
});

// Add message event listener for communication with the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});