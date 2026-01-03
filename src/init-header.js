// Manual header component initialization
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for modules to be loaded
  setTimeout(() => {
    // Get the component loader from the global scope
    const componentLoader = window.componentLoader;

    if (componentLoader) {
      console.log('Manually initializing component loader...');
      componentLoader.init();

      // Manually load the header component
      console.log('Manually loading header component...');
      componentLoader.loadComponent('header-placeholder', 'components/header/header.html');
    } else {
      console.error('Component loader not found in global scope');
    }
  }, 1000); // Wait 1 second for modules to load
});