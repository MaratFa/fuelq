/**
 * Service Worker Updates
 * Enhanced offline capabilities and caching strategies
 */

// Cache version
const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `fuelq-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `fuelq-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `fuelq-images-${CACHE_VERSION}`;

// Files to cache on install
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
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== STATIC_CACHE && 
                cache !== DYNAMIC_CACHE && 
                cache !== IMAGE_CACHE) {
              console.log('Service Worker: Clearing old cache', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle different request types
  if (event.request.url.includes('/api/')) {
    // Handle API requests
    event.respondWith(handleApiRequest(event));
  } else if (isImageRequest(event.request)) {
    // Handle image requests with specific cache
    event.respondWith(handleImageRequest(event));
  } else {
    // Handle other requests
    event.respondWith(handleRequest(event));
  }
});

/**
 * Handle API requests with network-first strategy
 * @param {FetchEvent} event - The fetch event
 * @returns {Promise<Response>} The response
 */
function handleApiRequest(event) {
  return fetch(event.request)
    .then(response => {
      // Clone the response
      const responseClone = response.clone();

      // Cache successful responses
      if (response.ok) {
        caches.open(DYNAMIC_CACHE)
          .then(cache => cache.put(event.request, responseClone));
      }

      return response;
    })
    .catch(() => {
      // Return cached response if network fails
      return caches.match(event.request)
        .then(response => {
          return response || new Response(JSON.stringify({ 
            error: 'Network unavailable', 
            offline: true 
          }), {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    });
}

/**
 * Handle image requests with cache-first strategy
 * @param {FetchEvent} event - The fetch event
 * @returns {Promise<Response>} The response
 */
function handleImageRequest(event) {
  return caches.match(event.request)
    .then(response => {
      // Return cached image if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then(response => {
          // Clone the response
          const responseClone = response.clone();

          // Cache successful responses
          if (response.ok) {
            caches.open(IMAGE_CACHE)
              .then(cache => cache.put(event.request, responseClone));
          }

          return response;
        });
    });
}

/**
 * Handle general requests with stale-while-revalidate strategy
 * @param {FetchEvent} event - The fetch event
 * @returns {Promise<Response>} The response
 */
function handleRequest(event) {
  return caches.match(event.request)
    .then(response => {
      // Return cached version immediately
      const cachedResponse = response;

      // Fetch from network in background
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // Cache the new response
          if (networkResponse.ok) {
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(event.request, networkResponse.clone()));
          }

          return networkResponse;
        });

      // Return cached response immediately
      return cachedResponse || fetchPromise;
    });
}

/**
 * Check if request is for an image
 * @param {Request} request - The request object
 * @returns {boolean} Whether the request is for an image
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Background sync for form submissions when offline
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  } else if (event.tag === 'forum-post-sync') {
    event.waitUntil(syncForumPosts());
  } else if (event.tag === 'chat-message-sync') {
    event.waitUntil(syncChatMessages());
  }
});

/**
 * Sync contact form submissions
 * @returns {Promise} The sync operation
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
      showNotification('Your contact form has been submitted', 'success');
    })
    .catch(error => {
      console.error('Error syncing contact forms:', error);
    });
}

/**
 * Sync forum posts
 * @returns {Promise} The sync operation
 */
function syncForumPosts() {
  return getAllPendingForumPosts()
    .then(posts => {
      return Promise.all(posts.map(post => {
        return fetch('/api/forum/threads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${post.token}`
          },
          body: JSON.stringify({
            title: post.title,
            content: post.content,
            category: post.category
          })
        })
        .then(response => {
          if (response.ok) {
            // Remove from pending submissions
            return removePendingForumPost(post.id);
          }
          throw new Error('Failed to submit post');
        });
      }));
    })
    .then(() => {
      console.log('All forum posts synced successfully');
      showNotification('Your forum post has been published', 'success');
    })
    .catch(error => {
      console.error('Error syncing forum posts:', error);
    });
}

/**
 * Sync chat messages
 * @returns {Promise} The sync operation
 */
function syncChatMessages() {
  return getAllPendingChatMessages()
    .then(messages => {
      return Promise.all(messages.map(message => {
        return fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${message.token}`
          },
          body: JSON.stringify({
            roomId: message.roomId,
            content: message.content
          })
        })
        .then(response => {
          if (response.ok) {
            // Remove from pending submissions
            return removePendingChatMessage(message.id);
          }
          throw new Error('Failed to send message');
        });
      }));
    })
    .then(() => {
      console.log('All chat messages synced successfully');
      showNotification('Your chat messages have been sent', 'success');
    })
    .catch(error => {
      console.error('Error syncing chat messages:', error);
    });
}

/**
 * Get all pending contact form submissions from IndexedDB
 * @returns {Promise<Array>} The pending form submissions
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
 * Get all pending forum posts from IndexedDB
 * @returns {Promise<Array>} The pending forum posts
 */
function getAllPendingForumPosts() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fuelq-offline', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['forum-posts'], 'readonly');
      const store = transaction.objectStore('forum-posts');
      const getAllRequest = store.getAll();

      getAllRequest.onerror = () => reject(getAllRequest.error);
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('forum-posts')) {
        db.createObjectStore('forum-posts', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Get all pending chat messages from IndexedDB
 * @returns {Promise<Array>} The pending chat messages
 */
function getAllPendingChatMessages() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fuelq-offline', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['chat-messages'], 'readonly');
      const store = transaction.objectStore('chat-messages');
      const getAllRequest = store.getAll();

      getAllRequest.onerror = () => reject(getAllRequest.error);
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('chat-messages')) {
        db.createObjectStore('chat-messages', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Remove a pending contact form from IndexedDB
 * @param {number} id - The form ID
 * @returns {Promise} The remove operation
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

/**
 * Remove a pending forum post from IndexedDB
 * @param {number} id - The post ID
 * @returns {Promise} The remove operation
 */
function removePendingForumPost(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fuelq-offline', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['forum-posts'], 'readwrite');
      const store = transaction.objectStore('forum-posts');
      const deleteRequest = store.delete(id);

      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    };
  });
}

/**
 * Remove a pending chat message from IndexedDB
 * @param {number} id - The message ID
 * @returns {Promise} The remove operation
 */
function removePendingChatMessage(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fuelq-offline', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['chat-messages'], 'readwrite');
      const store = transaction.objectStore('chat-messages');
      const deleteRequest = store.delete(id);

      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    };
  });
}

/**
 * Show notification to the user
 * @param {string} message - The notification message
 * @param {string} type - The notification type
 */
function showNotification(message, type = 'info') {
  // This would be implemented in the main application
  console.log(`[${type.toUpperCase()}] ${message}`);
}
