/**
 * Module Initializer
 * Provides consistent initialization patterns for all modules
 */

import { registerModule } from './module-registry.js';

/**
 * Base Module Class
 * All modules should extend this class for consistent behavior
 */
class BaseModule {
  constructor(name, options = {}) {
    this.name = name;
    this.initialized = false;
    this.options = {
      autoInit: true,
      dependencies: [],
      ...options
    };

    // Register the module
    registerModule(this);
  }

  /**
   * Initialize the module
   * Should be overridden by child classes
   */
  init() {
    if (this.initialized) return;

    console.log(`Initializing module: ${this.name}`);

    // Check dependencies
    this.checkDependencies();

    // Call custom initialization
    this.onInit();

    // Mark as initialized
    this.initialized = true;

    console.log(`Module initialized: ${this.name}`);

    // Emit initialization event
    this.emitEvent('module:initialized', { name: this.name });
  }

  /**
   * Check if all dependencies are loaded
   */
  checkDependencies() {
    for (const dep of this.options.dependencies) {
      if (!window[dep]) {
        console.warn(`Dependency not found: ${dep} for module ${this.name}`);
      }
    }
  }

  /**
   * Custom initialization logic
   * Should be overridden by child classes
   */
  onInit() {
    // Override in child classes
  }

  /**
   * Emit a custom event
   * @param {string} eventName - The event name
   * @param {Object} data - Event data
   */
  emitEvent(eventName, data = {}) {
    const event = new CustomEvent(eventName, {
      detail: {
        module: this.name,
        timestamp: new Date(),
        ...data
      }
    });

    document.dispatchEvent(event);
  }

  /**
   * Add event listener with error handling
   * @param {string} element - Element selector or 'document'
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  safeAddEventListener(element, event, handler) {
    try {
      const el = element === 'document' ? document : document.querySelector(element);
      if (el) {
        el.addEventListener(event, handler);
      } else {
        console.warn(`Element not found: ${element} in module ${this.name}`);
      }
    } catch (error) {
      console.error(`Error adding event listener in module ${this.name}:`, error);
    }
  }

  /**
   * Handle errors consistently
   * @param {Error} error - The error to handle
   * @param {string} context - Context where error occurred
   */
  handleError(error, context = 'unknown') {
    console.error(`Error in module ${this.name} (${context}):`, error);

    // Emit error event
    this.emitEvent('module:error', { 
      error: error.message, 
      stack: error.stack,
      context
    });

    // Show user-friendly error notification
    this.showNotification(`An error occurred: ${error.message}`, 'error');
  }

  /**
   * Show notification to user
   * @param {string} message - Message to show
   * @param {string} type - Type of notification (info, success, error)
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.boxShadow = 'var(--card-shadow)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.backgroundColor = 'var(--success-color)';
        notification.style.color = 'white';
        break;
      case 'error':
        notification.style.backgroundColor = 'var(--error-color)';
        notification.style.color = 'white';
        break;
      default:
        notification.style.backgroundColor = 'var(--primary-color)';
        notification.style.color = 'white';
    }

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';

      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

/**
 * Module Factory
 * Creates and initializes modules with consistent pattern
 */
class ModuleFactory {
  /**
   * Create and initialize a module
   * @param {Class} ModuleClass - The module class
   * @param {Object} options - Module options
   * @returns {Object} The initialized module
   */
  static create(ModuleClass, options = {}) {
    try {
      const module = new ModuleClass(options);

      if (module.options.autoInit) {
        module.init();
      }

      return module;
    } catch (error) {
      console.error('Error creating module:', error);
      return null;
    }
  }

  /**
   * Initialize all registered modules
   */
  static initAll() {
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize all registered modules
      const modules = window.registeredModules || {};

      for (const moduleName in modules) {
        if (modules[moduleName].autoInit) {
          modules[moduleName].init();
        }
      }
    });
  }
}

// Export for use in other modules
export { BaseModule, ModuleFactory };
