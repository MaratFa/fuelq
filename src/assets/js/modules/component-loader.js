/**
 * Component Loader
 * Dynamically loads HTML components into placeholder elements
 */

export class ComponentLoader {
  constructor() {
    this.loadedComponents = new Set();
    this.loadingPromises = new Map();
  }

  /**
   * Initialize the component loader
   */
  init() {
    console.log('Component loader initializing...');
    
    // Use a longer timeout to ensure DOM is fully loaded
    setTimeout(() => {
      // Find all elements with data-component attribute
      const componentElements = document.querySelectorAll('[data-component]');
      console.log(`Found ${componentElements.length} component elements to load`);
      console.log('Component elements:', componentElements);
      console.log('Document ready state:', document.readyState);
      console.log('Document HTML:', document.documentElement.outerHTML.substring(0, 1000));
      
      // Check if elements are actually in the DOM
      if (componentElements.length === 0) {
        console.warn('No component elements found in DOM');
        console.log('Looking for elements with ID header-placeholder');
        const headerElement = document.getElementById('header-placeholder');
        if (headerElement) {
          console.log('Header placeholder found, but no data-component attribute');
          console.log('Header placeholder element:', headerElement);
        } else {
          console.warn('Header placeholder element not found');
        }
      }

      // Load each component
      componentElements.forEach(element => {
        const componentPath = element.getAttribute('data-component');
        console.log(`Loading component: ${element.id} from ${componentPath}`);
        console.log(`Element details:`, {
          id: element.id,
          tagName: element.tagName,
          className: element.className,
          hasDataComponent: element.hasAttribute('data-component'),
          dataComponent: element.getAttribute('data-component')
        });
        this.loadComponent(element.id, componentPath);
      });
    }, 500); // Increased timeout
  }

  /**
   * Load a single component
   * @param {string} elementId - ID of the placeholder element
   * @param {string} componentPath - Path to the component HTML file
   * @returns {Promise} Promise that resolves when component is loaded
   */
  async loadComponent(elementId, componentPath) {
    // Find the placeholder element
    const placeholder = document.getElementById(elementId);
    if (!placeholder) {
      console.error(`Element with ID "${elementId}" not found`);
      return Promise.reject(new Error(`Element with ID "${elementId}" not found`));
    }

    // Check if component is already loading
    if (this.loadingPromises.has(componentPath)) {
      return this.loadingPromises.get(componentPath);
    }

    // Create a promise for the loading process
    const loadingPromise = this._fetchComponent(componentPath)
      .then(html => {
        // Debug logging
        console.log(`Inserting component HTML into placeholder #${elementId}`);
        console.log(`HTML content: ${html.substring(0, 100)}...`);
        
        // Insert the component HTML
        placeholder.innerHTML = html;
        
        // Debug logging
        console.log(`Component inserted. Placeholder now contains: ${placeholder.innerHTML.substring(0, 100)}...`);

        // Fix navigation links
        this._fixNavigationLinks(placeholder);

        // Mark component as loaded
        this.loadedComponents.add(componentPath);

        // Dispatch component loaded event
        this._dispatchComponentLoadedEvent(elementId, componentPath);

        return { elementId, componentPath };
      })
      .catch(error => {
        console.error(`Error loading component from ${componentPath}:`, error);
        placeholder.innerHTML = `<div class="error">Failed to load component: ${error.message}</div>`;
        throw error;
      })
      .finally(() => {
        // Remove from loading promises
        this.loadingPromises.delete(componentPath);
      });

    // Store the loading promise
    this.loadingPromises.set(componentPath, loadingPromise);

    return loadingPromise;
  }

  /**
   * Fetch component HTML from server
   * @private
   */
  _fetchComponent(componentPath) {
    // Fix path to ensure it starts with /src/ if it doesn't already
    if (!componentPath.startsWith('/') && !componentPath.startsWith('http')) {
      // If path is relative, convert to absolute with /src/ prefix
      if (componentPath.startsWith('../../components/')) {
        componentPath = componentPath.replace('../../components/', '/src/components/');
      } else if (componentPath.startsWith('../src/components/')) {
        componentPath = componentPath.replace('../src/components/', '/src/components/');
      } else if (componentPath.startsWith('../components/')) {
        componentPath = componentPath.replace('../components/', '/src/components/');
      } else if (componentPath.startsWith('src/components/')) {
        componentPath = componentPath.replace('src/components/', '/src/components/');
      } else if (!componentPath.startsWith('/src/components/')) {
        componentPath = '/src/' + componentPath;
      }
    }

    // Construct the full URL using absolute path from root
    const fullUrl = window.location.origin + componentPath;
    
    // Debug logging
    console.log(`Loading component from: ${fullUrl}`);

    return fetch(fullUrl)
      .then(response => {
        if (!response.ok) {
          console.error(`Failed to load component: ${response.status} from ${fullUrl}`);
          throw new Error(`Failed to load component: ${response.status}`);
        }
        console.log(`Successfully loaded component from: ${fullUrl}`);
        return response.text();
      });
  }

  /**
   * Fix navigation links to work correctly from any page
   * @private
   */
  _fixNavigationLinks(container) {
    const links = container.querySelectorAll("a");
    const currentPath = window.location.pathname;

    links.forEach(link => {
      const href = link.getAttribute("href");
      if (href && !href.startsWith("http") && !href.startsWith("#")) {
        // Skip absolute paths (starting with /)
        if (href.startsWith("/")) {
          return;
        }

        // Determine the correct path based on current location
        if (currentPath.includes("/src/pages/forum/")) {
          // We're in the forum directory (2 levels deep)
          if (href.startsWith("src/")) {
            link.setAttribute("href", "../../" + href);
          } else if (!href.startsWith("../")) {
            link.setAttribute("href", "../../" + href);
          }
        } else if (currentPath.includes("/src/pages/")) {
          // We're in the pages directory (1 level deep)
          if (href.startsWith("src/")) {
            link.setAttribute("href", "../" + href);
          } else if (!href.startsWith("../")) {
            link.setAttribute("href", "../" + href);
          }
        }
        // If we're at root, keep the path as is
      }
    });
  }

  /**
   * Dispatch a custom event when a component is loaded
   * @private
   */
  _dispatchComponentLoadedEvent(elementId, componentPath) {
    const event = new CustomEvent("componentLoaded", {
      detail: { elementId, componentPath }
    });
    document.dispatchEvent(event);
  }
}

// Register the module
import { registerModule } from '../core/module-registry.js';

// Create and register the component loader
const componentLoader = new ComponentLoader();
registerModule('componentLoader', componentLoader);

// Test that the module is loaded
console.log('ComponentLoader module registered successfully');
console.log('Component loader methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(componentLoader)));

// Make it globally accessible for debugging
window.componentLoader = componentLoader;
window.componentLoader = componentLoader;
