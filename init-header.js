// Manual header component initialization
document.addEventListener('DOMContentLoaded', () => {
  // Get the component loader from the global scope
  const componentLoader = window.componentLoader;
  
  if (componentLoader) {
    console.log('Manually initializing component loader...');
    componentLoader.init();
    
    // Manually load the header component
    console.log('Manually loading header component...');
    componentLoader.loadComponent('header-placeholder', '/src/components/header/header.html');
  } else {
    console.error('Component loader not found in global scope');
  }
});