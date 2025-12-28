/**
 * Main application entry point
 * Initializes all modules and components
 */

// Import modules
import { AnimationController } from './modules/animation-controller.js';
import { ComponentLoader } from './modules/component-loader.js';
import { NavigationController } from './modules/navigation-controller.js';
import { FormValidator } from './modules/form-validator.js';
import { NotificationManager } from './modules/notification-manager.js';
import { Analytics } from './modules/analytics.js';

// Import page-specific controllers
import { initHomePage } from './pages/home.js';
import { initEngineersPage } from './pages/engineers.js';
import { initContactsPage } from './pages/contacts.js';
import { initForumPage } from './pages/forum.js';

/**
 * Application class
 */
class App {
  constructor() {
    this.modules = {};
    this.pageInitializers = {
      '/index.html': initHomePage,
      '/src/pages/forengineers.html': initEngineersPage,
      '/src/pages/contacts.html': initContactsPage,
      '/src/pages/forum/index.html': initForumPage
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    // Initialize core modules
    this.modules.animation = new AnimationController();
    this.modules.componentLoader = new ComponentLoader();
    this.modules.navigation = new NavigationController();
    this.modules.formValidator = new FormValidator();
    this.modules.notifications = new NotificationManager();
    this.modules.analytics = new Analytics();

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    // Initialize all modules
    Object.values(this.modules).forEach(module => {
      if (typeof module.init === 'function') {
        module.init();
      }
    });

    // Initialize page-specific functionality
    const path = window.location.pathname;
    const pageInitializer = this.pageInitializers[path];

    if (pageInitializer) {
      pageInitializer(this.modules);
    }

    // Log page view for analytics
    this.modules.analytics.logPageView(path);
  }
}

// Create and initialize the application
const app = new App();
app.init().catch(error => console.error('Failed to initialize app:', error));
