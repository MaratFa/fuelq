// Component system for FuelQ website

// Component registry to store loaded components
const componentRegistry = {};

// Function to register a component
function registerComponent(name, element) {
  componentRegistry[name] = element;
  console.log(`Component registered: ${name}`);
}

// Function to get a component by name
function getComponent(name) {
  return componentRegistry[name];
}

// Function to load a component
function loadComponent(path, placeholder) {
  fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load component: ${path}`);
      }
      return response.text();
    })
    .then(html => {
      placeholder.innerHTML = html;

      // Extract component name from path
      const componentName = path.split('/').pop().split('.')[0];

      // Register the component
      registerComponent(componentName, placeholder);

      // Dispatch an event to notify that the component has been loaded
      const event = new CustomEvent('componentLoaded', {
        detail: { path, placeholder, componentName }
      });
      document.dispatchEvent(event);
    })
    .catch(error => {
      console.error('Error loading component:', error);
      placeholder.innerHTML = `<div class="component-error">Failed to load component: ${path}</div>`;
    });
}

// Function to initialize all components on the page
function initializeComponents() {
  // Find all component placeholders
  const componentPlaceholders = document.querySelectorAll('[data-component]');

  // Load each component
  componentPlaceholders.forEach(placeholder => {
    const componentPath = placeholder.getAttribute('data-component');
    loadComponent(componentPath, placeholder);
  });
}

// Auto-initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', initializeComponents);

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    registerComponent,
    getComponent,
    loadComponent,
    initializeComponents
  };
}
