// Manual component initialization
console.log('Manual component initialization script loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for modules to be loaded
  setTimeout(() => {
    // Get the component loader from global scope
    const componentLoader = window.componentLoader;
    
    if (componentLoader) {
      console.log('Found component loader in global scope');
      
      // Manually initialize the component loader
      componentLoader.init();
    } else {
      console.error('Component loader not found in global scope');
    }
  }, 1000); // Wait 1 second for modules to load
});