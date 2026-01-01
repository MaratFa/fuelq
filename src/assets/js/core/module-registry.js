/**
 * Module Registry
 * Central registry for managing all application modules
 */

// Registry to store loaded modules
const moduleRegistry = new Map();

/**
 * Register a module
 * @param {string} name - Module name
 * @param {Function} module - Module constructor or factory function
 */
export function registerModule(name, module) {
  moduleRegistry.set(name, module);
  console.log(`Module registered: ${name}`);
}

/**
 * Get a registered module
 * @param {string} name - Module name
 * @returns {Object|null} The module instance or null if not found
 */
export function getModule(name) {
  return moduleRegistry.get(name);
}

/**
 * Load a module dynamically
 * @param {string} path - Path to the module file
 * @param {string} name - Name to register the module with
 * @returns {Promise} Promise that resolves with the module
 */
export async function loadModule(path, name) {
  try {
    const module = await import(path);

    // If the module exports a default, use that
    const moduleExport = module.default || module;

    // Register the module
    registerModule(name, moduleExport);

    return moduleExport;
  } catch (error) {
    console.error(`Failed to load module ${name} from ${path}:`, error);
    throw error;
  }
}

/**
 * Initialize all registered modules
 * @param {Object} config - Configuration object for modules
 */
export function initializeModules(config = {}) {
  console.log('Initializing modules...');
  
  // Initialize all modules
  moduleRegistry.forEach((module, name) => {
    console.log(`Checking module: ${name}`);
    if (typeof module.init === 'function') {
      console.log(`Initializing module: ${name}`);
      const moduleConfig = config[name] || {};
      module.init(moduleConfig);
    }
  });
  console.log('All modules initialized');
}

/**
 * Get all registered module names
 * @returns {Array} Array of module names
 */
export function getModuleNames() {
  return Array.from(moduleRegistry.keys());
}
