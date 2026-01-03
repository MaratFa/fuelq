// Header component JavaScript

// Function to initialize header component
function initHeader() {
  // Get current page path
  const currentPath = window.location.pathname;

  // Find all navigation links
  const navLinks = document.querySelectorAll('.topnav a');

  // Set active class based on current page
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');

    // Debug logging
    console.log('Current path:', currentPath);
    console.log('Link path:', linkPath);

    // Check if link matches current page
    // First remove any existing active class
    link.classList.remove('active');

    // Special handling for home page
    if ((currentPath.endsWith('/') || currentPath.endsWith('index.html')) && 
        (linkPath === 'index.html' || linkPath === '/index.html')) {
      console.log('Setting active for home page:', linkPath);
      link.classList.add('active');
    }
    // Check for exact match or if current page contains the link path (but not for home)
    else if (linkPath !== 'index.html' && linkPath !== '/index.html') {
      // Remove leading slash for comparison
      const cleanLinkPath = linkPath.startsWith('/') ? linkPath.substring(1) : linkPath;
      const cleanCurrentPath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;

      if (cleanCurrentPath.includes(cleanLinkPath)) {
        console.log('Setting active for:', linkPath);
        link.classList.add('active');
      }
    }
  });

  // Mobile menu toggle - using global variables
  menuToggle = document.getElementById('menu-toggle');
  topnav = document.querySelector('.topnav');

  // Initialize mobile menu state
  if (window.innerWidth <= 768 && menuToggle && topnav) {
    menuToggle.textContent = '☰';
    console.log('Mobile menu initialized');
  } else if (menuToggle && topnav) {
    menuToggle.textContent = '✕';
    console.log('Desktop menu initialized');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      console.log('Menu toggle clicked');
      topnav.classList.toggle('responsive');
      
      // Update menu icon based on state
      if (topnav.classList.contains('responsive')) {
        menuToggle.textContent = '✕';
        console.log('Menu opened');
      } else {
        menuToggle.textContent = '☰';
        console.log('Menu closed');
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInside = topnav.contains(event.target) || menuToggle.contains(event.target);
      
      if (!isClickInside && topnav.classList.contains('responsive')) {
        topnav.classList.remove('responsive');
        menuToggle.textContent = '☰';
      }
    });
  }
}

// Declare variables in global scope to make them accessible
let menuToggle, topnav;

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', initHeader);

// Handle window resize for responsive menu
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && menuToggle && topnav && topnav.classList.contains('responsive')) {
    topnav.classList.remove('responsive');
    menuToggle.textContent = '☰';
    console.log('Window resized to desktop - menu closed');
  }
});