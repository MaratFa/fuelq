// Initialize header component
import { getModule } from "./src/assets/js/core/module-registry.js";
import { registerComponent } from "./src/assets/js/components.js";

// Import the header component
import("./src/components/header/header.js")
  .then(() => {
    // Register the header component
    registerComponent("header", {
      init: window.initHeader || function() {
        // Fallback initialization if initHeader is not available
        console.log("Header component initialized");
      }
    });
  })
  .catch(error => {
    console.error("Failed to load header component:", error);
  });