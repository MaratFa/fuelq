/**
 * Component loading system for FuelQuality website
 * Dynamically loads HTML components into placeholder elements
 */

function loadComponent(elementId, componentPath) {
  // Find the placeholder element
  const placeholder = document.getElementById(elementId);
  if (!placeholder) {
    console.error(`Element with ID "${elementId}" not found`);
    return;
  }

  console.log(`Loading component: ${componentPath}`);
  console.log(`Current URL: ${window.location.href}`);

  // Handle component paths based on the new src structure
  // If the path starts with "src/", use it directly
  // Otherwise, add "src/" prefix
  const cleanPath = componentPath.startsWith("src/")
    ? componentPath
    : "src/" + componentPath;

  // Construct the full URL using absolute path from root
  const fullUrl = window.location.origin + "/" + cleanPath;

  console.log(`Clean path: ${cleanPath}`);
  console.log(`Full URL: ${fullUrl}`);

  // Fetch the component HTML
  fetch(fullUrl)
    .then((response) => {
      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      // Insert the component HTML into the placeholder
      placeholder.innerHTML = html;

      // Fix navigation links to work correctly from any page
      const links = placeholder.querySelectorAll("a");
      const currentPath = window.location.pathname;

      links.forEach((link) => {
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

      // Dispatch a custom event to notify that the component has loaded
      const event = new CustomEvent("componentLoaded", {
        detail: { elementId, componentPath },
      });
      document.dispatchEvent(event);
    })
    .catch((error) => {
      console.error(`Error loading component from ${componentPath}:`, error);
      placeholder.innerHTML = `<div class="error">Failed to load component: ${error.message}</div>`;
    });
}

// Function to load multiple components
function loadComponents(components) {
  components.forEach(({ elementId, componentPath }) => {
    loadComponent(elementId, componentPath);
  });
}

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { loadComponent, loadComponents };
}

// Auto-load components when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Find all elements with data-component attribute
  const componentElements = document.querySelectorAll("[data-component]");

  console.log(`Found ${componentElements.length} component elements`);

  componentElements.forEach((element) => {
    const componentPath = element.getAttribute("data-component");
    console.log(`Element ID: ${element.id}, Component Path: ${componentPath}`);
    loadComponent(element.id, componentPath);
  });
});

// Export functions for global use
window.loadComponent = loadComponent;
window.loadComponents = loadComponents;
