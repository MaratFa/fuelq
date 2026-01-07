/**
 * Discovery Page Controller
 * Manages the discovery page functionality
 */

import { registerModule } from '../core/module-registry.js';

class DiscoveryPageController {
  constructor() {
    this.name = 'discoveryPage';
    this.initialized = false;
  }

  /**
   * Initialize the discovery page controller
   */
  init() {
    if (this.initialized) return;

    console.log('Initializing Discovery Page Controller...');

    // Initialize page-specific functionality
    this.initPageEvents();

    // Mark as initialized
    this.initialized = true;

    console.log('Discovery Page Controller initialized');
  }

  /**
   * Initialize page-specific events
   */
  initPageEvents() {
    // View all buttons
    document.querySelectorAll('.view-all-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.target.closest('.trending-section, .experts-section, .content-section');
        if (section) {
          console.log('View all clicked for section:', section.className);
          // In a real implementation, this would navigate to a full page view
        }
      });
    });

    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('Refresh button clicked');
        // In a real implementation, this would refresh the content
        window.location.reload();
      });
    }
  }
}

// Create and register the controller
const discoveryPageController = new DiscoveryPageController();
registerModule('discoveryPage', discoveryPageController);

export default discoveryPageController;
