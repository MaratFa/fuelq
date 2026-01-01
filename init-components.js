// Manual component loader initialization
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for modules to be loaded
  setTimeout(() => {
    // Get the component loader from the global scope
    const componentLoader = window.componentLoader;
    
    if (componentLoader) {
      console.log('Manually initializing component loader...');
      componentLoader.init();
    } else {
      console.error('Component loader not found in global scope');
    }
  }, 1000); // Wait 1 second for modules to load
});