/**
 * Main Application Entry Point
 * Initializes the module system and application
 */

import { initModuleSystem } from './module-loader.js';
import stateManager from './state-manager.js';
import serviceWorkerManager from './service-worker-manager.js';

// Application configuration
const appConfig = {
  // State manager configuration
  stateManager: {
    persistState: true
  },
  
  // Service worker configuration
  serviceWorkerManager: {
    swPath: '/sw.js'
  },
  
  // Theme manager configuration
  themeManager: {
    showToggle: true
  },
  // Component loader configuration
  componentLoader: {
    basePath: 'components/',
    errorTemplate: '<div class="component-error">Failed to load component</div>'
  },
  
  // Components configuration
  components: {
    autoLoad: true
  },

  // Analytics configuration
  analytics: {
    trackingId: 'UA-XXXXXXXXX-X',
    autoTrack: true
  },

  // Animation configuration
  animation: {
    duration: 300,
    easing: 'ease-out',
    threshold: 0.1
  },

  // Navigation configuration
  navigation: {
    highlightActive: true,
    smoothScroll: true,
    mobileBreakpoint: 768
  }
};

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Initialize state manager
    stateManager.init(appConfig.stateManager);
    
    // Initialize service worker manager
    serviceWorkerManager.init(appConfig.serviceWorkerManager);
    
    // Initialize the module system
    await initModuleSystem(appConfig);

    // Add global error handling
    window.addEventListener('error', handleGlobalError);

    // Add unhandled promise rejection handling
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);

    // Show a user-friendly error message
    const errorElement = document.createElement('div');
    errorElement.className = 'app-error';
    errorElement.textContent = 'Application failed to load. Please refresh the page.';
    document.body.prepend(errorElement);
  }
}

/**
 * Handle global errors
 * @param {ErrorEvent} event - Error event
 */
function handleGlobalError(event) {
  console.error('Global error:', event.error);

  // In production, you might want to send this to an error tracking service
  if (typeof appConfig.analytics !== 'undefined' && appConfig.analytics.errorTracking) {
    // Track error with analytics service
  }
}

/**
 * Handle unhandled promise rejections
 * @param {PromiseRejectionEvent} event - Promise rejection event
 */
function handleUnhandledRejection(event) {
  console.error('Unhandled promise rejection:', event.reason);

  // Prevent the default browser behavior
  event.preventDefault();

  // In production, you might want to send this to an error tracking service
  if (typeof appConfig.analytics !== 'undefined' && appConfig.analytics.errorTracking) {
    // Track error with analytics service
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM is already ready
  initApp();
}

// Export for potential use in other modules
export { appConfig };
