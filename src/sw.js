/**
 * Service Worker for FuelQ Website
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'fuelq-v1.1.0';
const STATIC_CACHE = 'fuelq-static-v1.1.0';
const DYNAMIC_CACHE = 'fuelq-dynamic-v1.1.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/pages/forengineers.html',
  '/src/pages/contacts.html',
  '/src/pages/forum/index.html',
  '/src/assets/css/styles.css',
  '/src/assets/images/favicon.png',
  '/src/assets/images/hydrogen.png',
  '/src/assets/images/biofuels.png',
  '/src/assets/images/solar-wind.png',
  '/src/components/header/header.html',
  '/src/components/footer/footer.html',
  '/src/api/discovery',
  '/src/api/forum',
  '/src/assets/js/core/app.js',
  '/src/assets/js/components.js',
  '/src/assets/js/modules/navigation-controller.js',
  '/src/assets/js/modules/theme-manager.js'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS)
          .catch(error => {
            console.error('Service Worker: Failed to cache some assets:', error);
            // Continue with installation even if some assets fail to cache
            return Promise.resolve();
          });
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
              console.log('Service Worker: Clearing old cache');
              return caches.delete(cache)
                .catch(error => {
                  console.error('Service Worker: Failed to delete cache:', cache, error);
                  // Continue even if cache deletion fails
                  return Promise.resolve();
                });
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
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then(fetchResponse => {
            // Check if valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response
            const responseToCache = fetchResponse.clone();

            // Add to dynamic cache
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Service Worker: Failed to cache resource:', event.request.url, error);
              });

            return fetchResponse;
          })
          .catch(error => {
            console.error('Service Worker: Fetch failed for:', event.request.url, error);
            // Return a basic offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return new Response('<h1>Offline</h1><p>You are currently offline. Please check your connection.</p>', {
                headers: { 'Content-Type': 'text/html' }
              });
            }
            // For other requests, just let the error propagate
            throw error;
          });
      })
      .catch(() => {
        // Return a fallback page when offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

/**
 * Background sync for form submissions when offline
 */
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

/**
 * Function to sync contact form submissions
 */
function syncContactForm() {
  return getAllPendingContactForms()
    .then(forms => {
      return Promise.all(forms.map(form => {
        return fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        })
        .then(response => {
          if (response.ok) {
            // Remove from pending submissions
            return removePendingContactForm(form.id);
          }
          throw new Error('Failed to submit form');
        });
      }));
    })
    .then(() => {
      console.log('All contact forms synced successfully');
    })
    .catch(error => {
      console.error('Error syncing contact forms:', error);
    });
}

/**
 * Get all pending contact form submissions from IndexedDB
 */
function getAllPendingContactForms() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fuelq-offline', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['contact-forms'], 'readonly');
      const store = transaction.objectStore('contact-forms');
      const getAllRequest = store.getAll();

      getAllRequest.onerror = () => reject(getAllRequest.error);
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('contact-forms')) {
        db.createObjectStore('contact-forms', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Remove a pending contact form from IndexedDB
 */
function removePendingContactForm(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fuelq-offline', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['contact-forms'], 'readwrite');
      const store = transaction.objectStore('contact-forms');
      const deleteRequest = store.delete(id);

      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    };
  });
}
