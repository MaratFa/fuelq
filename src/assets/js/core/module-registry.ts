
/**
 * Module Registry
 * Central registry for managing all application modules
 */

// Define interface for module
interface Module {
  init?(config?: any): void;
  [key: string]: any;
}

// Registry to store loaded modules
const moduleRegistry = new Map<string, Module>();

/**
 * Register a module
 * @param {string} name - Module name
 * @param {Function} module - Module constructor or factory function
 */
export function registerModule(name: string, module: Module): void {
  moduleRegistry.set(name, module);
  console.log(`Module registered: ${name}`);
}

/**
 * Get a registered module
 * @param {string} name - Module name
 * @returns {Object|null} The module instance or null if not found
 */
export function getModule(name: string): Module | undefined {
  return moduleRegistry.get(name);
}

/**
 * Load a module dynamically
 * @param {string} path - Path to module file
 * @param {string} name - Name to register module with
 * @returns {Promise} Promise that resolves with module
 */
export async function loadModule(path: string, name: string): Promise<Module> {
  try {
    const module = await import(path);

    // If module exports a default, use that
    const moduleExport: Module = module.default || module;

    // Register module
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
export function initializeModules(config: Record<string, any> = {}): void {
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
export function getModuleNames(): string[] {
  return Array.from(moduleRegistry.keys());
}
