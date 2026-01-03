/**
 * Service Worker for FuelQ Website
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'fuelq-v1.0.0';
const STATIC_CACHE = 'fuelq-static-v1.0.0';
const DYNAMIC_CACHE = 'fuelq-dynamic-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pages/forengineers.html',
  '/pages/contacts.html',
  '/pages/forum/index.html',
  '/assets/css/styles.css',
  '/assets/images/favicon.png',
  '/assets/images/hydrogen.png',
  '/assets/images/biofuels.png',
  '/assets/images/solar-wind.png',
  '/components/header/header.html',
  '/components/footer/footer.html'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', event => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event - serve from cache when offline
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // Handle different types of requests
  if (url.pathname.includes('/assets/')) {
    // Static assets - cache first strategy
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.includes('/components/')) {
    // Components - cache first strategy
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    // HTML pages - network first strategy
    event.respondWith(networkFirst(request));
  } else {
    // Other requests - network first strategy
    event.respondWith(networkFirst(request));
  }
});

/**
 * Message event - handle messages from the app
 */
self.addEventListener('message', event => {
  const message = event.data;

  switch (message.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION',
        version: CACHE_NAME
      });
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
});

/**
 * Cache first strategy
 * @param {Request} request - Request object
 * @returns {Promise<Response>} Response from cache or network
 */
function cacheFirst(request) {
  return caches.match(request)
    .then(response => {
      if (response) {
        // Return cached response
        return response;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response since it can only be consumed once
          const responseToCache = response.clone();

          // Add to dynamic cache
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(request, responseToCache);
            });

          return response;
        });
    });
}

/**
 * Network first strategy
 * @param {Request} request - Request object
 * @returns {Promise<Response>} Response from network or cache
 */
function networkFirst(request) {
  return fetch(request)
    .then(response => {
      // Check if valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Clone response since it can only be consumed once
      const responseToCache = response.clone();

      // Add to dynamic cache
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          cache.put(request, responseToCache);
        });

      return response;
    })
    .catch(() => {
      // Network failed, try cache
      return caches.match(request);
    });
}

/**
 * Check online status
 */
function checkOnlineStatus() {
  return self.clients.matchAll()
    .then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: navigator.onLine ? 'ONLINE_MODE' : 'OFFLINE_MODE'
        });
      });
    });
}

// Listen for online/offline events
self.addEventListener('online', checkOnlineStatus);
self.addEventListener('offline', checkOnlineStatus);