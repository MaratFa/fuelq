/**
 * Component Loader
 * Handles loading and initialization of all UI components
 */

import { getModule } from './core/module-registry.js';

// Component registry
const componentRegistry = new Map();

/**
 * Register a component
 * @param {string} name - Component name
 * @param {Object} component - Component object with init method
 */
export function registerComponent(name, component) {
  componentRegistry.set(name, component);
  console.log(`Component registered: ${name}`);
}

/**
 * Get a registered component
 * @param {string} name - Component name
 * @returns {Object|null} The component or null if not found
 */
export function getComponent(name) {
  return componentRegistry.get(name);
}

/**
 * Initialize all components on the page
 */
export function initComponents() {
  console.log('Initializing components...');

  // Find all elements with data-component attribute
  const componentElements = document.querySelectorAll('[data-component]');

  componentElements.forEach(element => {
    const componentName = element.getAttribute('data-component');
    const componentPath = element.getAttribute('data-component');

    // Load component if not already loaded
    if (!componentRegistry.has(componentName)) {
      loadComponent(componentName, componentPath);
    }

    // Initialize component
    const component = componentRegistry.get(componentName);
    if (component && typeof component.init === 'function') {
      component.init(element);
    }
  });

  console.log('All components initialized');
}

/**
 * Load a component dynamically
 * @param {string} name - Component name
 * @param {string} path - Path to component files
 */
async function loadComponent(name, path) {
  try {
    // Load component HTML
    const response = await fetch(path + '/' + name + '.html');
    const html = await response.text();

    // Find all elements with this component name
    const elements = document.querySelectorAll(`[data-component="${path}/${name}"]`);

    // Replace elements with component HTML
    elements.forEach(element => {
      element.innerHTML = html;

      // Load component CSS if exists
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path + '/' + name + '.css';
      document.head.appendChild(link);

      // Load component JS if exists
      import(path + '/' + name + '.js')
        .then(module => {
          // Register component
          if (module.default) {
            registerComponent(name, module.default);
          }
        })
        .catch(error => {
          console.warn(`Failed to load component JS for ${name}:`, error);
        });
    });
  } catch (error) {
    console.error(`Failed to load component ${name}:`, error);
  }
}

// Initialize components when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponents);
} else {
  // DOM is already ready
  initComponents();
}
