// Manual component initialization
console.log('Manual component initialization script loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Get the component loader from global scope
  const componentLoader = window.componentLoader;
  
  if (componentLoader) {
    console.log('Found component loader in global scope');
    
    // Manually initialize the component loader
    componentLoader.init();
  } else {
    console.error('Component loader not found in global scope');
  }
});