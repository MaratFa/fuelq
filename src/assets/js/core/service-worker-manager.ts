
/**
 * Service Worker Manager
 * Handles service worker registration and communication
 */

interface ServiceWorkerConfig {
  swPath?: string;
}

interface NotificationAction {
  label: string;
  action: () => void;
}

interface NotificationOptions {
  type: string;
  title: string;
  message: string;
  actions: NotificationAction[];
}

class ServiceWorkerManager {
  name: string;
  swRegistration: ServiceWorkerRegistration | null;
  initialized: boolean;

  constructor() {
    this.name = 'serviceWorkerManager';
    this.swRegistration = null;
    this.initialized = false;
  }

  /**
   * Initialize service worker manager
   * @param {Object} config - Configuration object
   */
  init(config: ServiceWorkerConfig = {}): void {
    if (this.initialized) return;

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Always use service worker in src directory
        const swPath = '/src/sw.ts';
        this.registerServiceWorker(swPath);
      });
    }

    this.initialized = true;
    console.log('Service worker manager initialized');
  }

  /**
   * Register service worker
   * @param {string} swPath - Path to service worker file
   */
  async registerServiceWorker(swPath: string): Promise<void> {
    try {
      this.swRegistration = await navigator.serviceWorker.register(swPath);
      console.log('Service Worker registered with scope:', this.swRegistration.scope);

      // Check for updates
      this.checkForUpdates();

      // Setup message listener
      this.setupMessageListener();
    } catch (error) {
      console.error('Service Worker registration failed:', error);

      // Use same path as fallback
      const fallbackPath = '/src/sw.ts';

      console.log(`Trying fallback path: ${fallbackPath}`);
      try {
        this.swRegistration = await navigator.serviceWorker.register(fallbackPath);
        console.log('Service Worker registered with fallback path, scope:', this.swRegistration.scope);

        // Check for updates
        this.checkForUpdates();

        // Setup message listener
        this.setupMessageListener();
      } catch (fallbackError) {
        console.error('Fallback service worker registration also failed:', fallbackError);
      }
    }
  }

  /**
   * Check for service worker updates
   */
  checkForUpdates(): void {
    if (!this.swRegistration) return;

    this.swRegistration.addEventListener('updatefound', () => {
      const newWorker = this.swRegistration!.installing;

      newWorker!.addEventListener('statechange', () => {
        if (newWorker!.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available
          this.showUpdateNotification();
        }
      });
    });
  }

  /**
   * Show update notification to user
   */
  showUpdateNotification(): void {
    // Get notification manager module
    import('../modules/notification-manager.js')
      .then(module => {
        const notificationManager: any = module.default;

        notificationManager.show({
          type: 'info',
          title: 'App Update Available',
          message: 'A new version of app is available. Would you like to update now?',
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
        } as NotificationOptions);
      })
      .catch(error => {
        console.error('Failed to load notification manager:', error);
      });
  }

  /**
   * Apply service worker update
   */
  applyUpdate(): void {
    if (!this.swRegistration || !this.swRegistration.waiting) return;

    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload page to activate new service worker
    window.location.reload();
  }

  /**
   * Setup message listener for service worker communication
   */
  setupMessageListener(): void {
    navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
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
   * @param {boolean} isOffline - Whether app is offline
   */
  updateOfflineStatus(isOffline: boolean): void {
    const statusElement = document.getElementById('connection-status');

    if (statusElement) {
      statusElement.textContent = isOffline ? 'Offline' : 'Online';
      statusElement.className = isOffline ? 'offline' : 'online';
    }
  }

  /**
   * Send a message to service worker
   * @param {*} message - Message to send
   */
  sendMessage(message: any): void {
    if (!this.swRegistration || !this.swRegistration.active) {
      console.warn('No active service worker to send message to');
      return;
    }

    this.swRegistration.active.postMessage(message);
  }

  /**
   * Get current service worker version
   * @returns {Promise<string>} Service worker version
   */
  async getVersion(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.swRegistration || !this.swRegistration.active) {
        resolve(null);
        return;
      }

      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event: MessageEvent) => {
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
