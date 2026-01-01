/**
 * Service Worker Manager
 * Handles service worker registration and communication
 */

class ServiceWorkerManager {
  constructor() {
    this.name = 'serviceWorkerManager';
    this.swRegistration = null;
    this.initialized = false;
  }

  /**
   * Initialize the service worker manager
   * @param {Object} config - Configuration object
   */
  init(config = {}) {
    if (this.initialized) return;

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        this.registerServiceWorker(config.swPath || '/sw.js');
      });
    }

    this.initialized = true;
    console.log('Service worker manager initialized');
  }

  /**
   * Register the service worker
   * @param {string} swPath - Path to the service worker file
   */
  async registerServiceWorker(swPath) {
    try {
      this.swRegistration = await navigator.serviceWorker.register(swPath);
      console.log('Service Worker registered with scope:', this.swRegistration.scope);

      // Check for updates
      this.checkForUpdates();

      // Setup message listener
      this.setupMessageListener();
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Check for service worker updates
   */
  checkForUpdates() {
    if (!this.swRegistration) return;

    this.swRegistration.addEventListener('updatefound', () => {
      const newWorker = this.swRegistration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available
          this.showUpdateNotification();
        }
      });
    });
  }

  /**
   * Show update notification to user
   */
  showUpdateNotification() {
    // Get the notification manager module
    import('../modules/notification-manager.js')
      .then(module => {
        const notificationManager = module.default;

        notificationManager.show({
          type: 'info',
          title: 'App Update Available',
          message: 'A new version of the app is available. Would you like to update now?',
          actions: [
            {
              label: 'Update',
              action: () => this.applyUpdate()
            },
            {
              label: 'Later',
              action: () => notificationManager.hide()
            }
          ]
        });
      })
      .catch(error => {
        console.error('Failed to load notification manager:', error);
      });
  }

  /**
   * Apply the service worker update
   */
  applyUpdate() {
    if (!this.swRegistration || !this.swRegistration.waiting) return;

    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page to activate the new service worker
    window.location.reload();
  }

  /**
   * Setup message listener for service worker communication
   */
  setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', event => {
      const message = event.data;

      switch (message.type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated:', message.payload);
          break;

        case 'OFFLINE_MODE':
          console.log('App is now in offline mode');
          // Update UI to reflect offline status
          this.updateOfflineStatus(true);
          break;

        case 'ONLINE_MODE':
          console.log('App is back online');
          // Update UI to reflect online status
          this.updateOfflineStatus(false);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    });
  }

  /**
   * Update UI to reflect online/offline status
   * @param {boolean} isOffline - Whether the app is offline
   */
  updateOfflineStatus(isOffline) {
    const statusElement = document.getElementById('connection-status');

    if (statusElement) {
      statusElement.textContent = isOffline ? 'Offline' : 'Online';
      statusElement.className = isOffline ? 'offline' : 'online';
    }
  }

  /**
   * Send a message to the service worker
   * @param {*} message - Message to send
   */
  sendMessage(message) {
    if (!this.swRegistration || !this.swRegistration.active) {
      console.warn('No active service worker to send message to');
      return;
    }

    this.swRegistration.active.postMessage(message);
  }

  /**
   * Get the current service worker version
   * @returns {Promise<string>} Service worker version
   */
  async getVersion() {
    return new Promise((resolve) => {
      if (!this.swRegistration || !this.swRegistration.active) {
        resolve(null);
        return;
      }

      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'VERSION') {
          resolve(event.data.version);
        } else {
          resolve(null);
        }
      };

      this.swRegistration.active.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000);
    });
  }
}

// Export as singleton
export default new ServiceWorkerManager();
