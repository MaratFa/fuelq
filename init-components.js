// Manual component loader initialization
document.addEventListener('DOMContentLoaded', () => {
  // Get the component loader from the global scope
  const componentLoader = window.componentLoader;
  
  if (componentLoader) {
    console.log('Manually initializing component loader...');
    componentLoader.init();
  } else {
    console.error('Component loader not found in global scope');
  }
});