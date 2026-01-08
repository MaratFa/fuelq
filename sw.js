/**
 * Service Worker for FuelQ Website
 * Temporary file in root directory for backward compatibility
 * This file simply redirects to the actual service worker in src/sw.js
 * Updated to redirect to v1.1.1
 */

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      // After unregistering, try to register the real service worker
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          // Navigate to the same page to trigger registration of the real service worker
          if (client.url && client.focus) {
            client.navigate(client.url);
          }
        });
      });
    })
  );
});
