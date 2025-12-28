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
    // Find all elements with data-component attribute
    const componentElements = document.querySelectorAll('[data-component]');

    // Load each component
    componentElements.forEach(element => {
      const componentPath = element.getAttribute('data-component');
      this.loadComponent(element.id, componentPath);
    });
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
        // Insert the component HTML
        placeholder.innerHTML = html;

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
    // Handle component paths based on the new src structure
    const cleanPath = componentPath.startsWith("src/")
      ? componentPath
      : "src/" + componentPath;

    // Construct the full URL using absolute path from root
    const fullUrl = window.location.origin + "/" + cleanPath;

    return fetch(fullUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load component: ${response.status}`);
        }
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
