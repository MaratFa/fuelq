
/**
 * Module Loader
 * Handles dynamic loading of modules based on page requirements
 */

import { loadModule, initializeModules } from './module-registry.js';

// Define interfaces for type safety
interface ModuleInfo {
  path: string;
  name: string;
}

interface PageModules {
  [key: string]: ModuleInfo[];
}

interface ModuleConfig {
  [key: string]: any;
}

// Configuration for page-specific modules
const pageModules: PageModules = {
  '/index.html': [
    { path: '../modules/animation-controller.js', name: 'animation' },
    { path: '../pages/home-page-controller.js', name: 'homePage' }
  ],
  '/src/pages/forengineers.html': [
    { path: '../pages/engineers-page-controller.js', name: 'engineersPage' },
    { path: '../modules/data-visualizer.js', name: 'dataVisualizer' }
  ],
  '/src/pages/forum/index.html': [
    { path: '../modules/forum-controller.js', name: 'forum' }
  ],
  '/src/pages/contacts.html': [
    { path: '../modules/contact-form-handler.js', name: 'contactForm' }
  ],
  '/src/pages/discovery.html': [
    { path: '../pages/discovery-page-controller.js', name: 'discoveryPage' }
  ],
  '/src/pages/cabinet.html': [
    { path: '../pages/cabinet.js', name: 'cabinet' }
  ]
};

// Core modules that should be loaded on all pages
const coreModules: ModuleInfo[] = [
  { path: '../components.js', name: 'components' },
  { path: '../modules/navigation-controller.js', name: 'navigation' },
  { path: '../modules/theme-manager.js', name: 'themeManager' }
];

/**
 * Load core modules
 * @returns {Promise} Promise that resolves when all core modules are loaded
 */
export async function loadCoreModules(): Promise<any[]> {
  console.log('Loading core modules...');
  console.log('Core modules list:', coreModules);
  const loadPromises = coreModules.map(async ({ path, name }) => {
    try {
      console.log(`Loading core module: ${name} from ${path}`);
      const module = await loadModule(path, name);
      console.log(`Successfully loaded core module: ${name}`);
      return module;
    } catch (error) {
      console.warn(`Failed to load core module ${name}:`, error);
      return null;
    }
  });

  return Promise.all(loadPromises);
}

/**
 * Load page-specific modules
 * @param {string} pagePath - Current page path
 * @returns {Promise} Promise that resolves when all page modules are loaded
 */
export async function loadPageModules(pagePath: string): Promise<any[]> {
  const modules = pageModules[pagePath] || [];
  const loadPromises = modules.map(async ({ path, name }) => {
    try {
      return await loadModule(path, name);
    } catch (error) {
      console.warn(`Failed to load page module ${name}:`, error);
      return null;
    }
  });

  return Promise.all(loadPromises);
}

/**
 * Initialize module system
 * @param {Object} config - Configuration for modules
 */
export async function initModuleSystem(config: ModuleConfig = {}): Promise<void> {
  // Load core modules first
  await loadCoreModules();

  // Get current page path
  const pagePath = window.location.pathname;

  // Load page-specific modules
  await loadPageModules(pagePath);

  // Initialize all modules
  initializeModules(config);

  console.log('Module system initialized');
}

/**
 * Lazy load a module when needed
 * @param {string} path - Path to module
 * @param {string} name - Name to register module with
 * @returns {Promise} Promise that resolves with loaded module
 */
export function lazyLoadModule(path: string, name: string): Promise<any> {
  return loadModule(path, name);
}
