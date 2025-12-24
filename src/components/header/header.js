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

  // Mobile menu toggle
  menuToggle = document.getElementById('menu-toggle');
  topnav = document.querySelector('.topnav');

  // Initialize mobile menu state
  if (window.innerWidth <= 768 && menuToggle && topnav) {
    topnav.style.display = 'none';
    menuToggle.textContent = '☰';
    console.log('Mobile menu initialized - hidden');
  } else if (menuToggle && topnav) {
    menuToggle.textContent = '✕';
    console.log('Desktop menu initialized - visible');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      console.log('Menu toggle clicked');
      if (topnav.style.display === 'none') {
        topnav.style.display = 'flex';
        menuToggle.textContent = '✕';
        console.log('Menu opened');
      } else {
        topnav.style.display = 'none';
        menuToggle.textContent = '☰';
        console.log('Menu closed');
      }
    });
  }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', initHeader);

// Declare variables in global scope to make them accessible
let menuToggle, topnav;

// Handle window resize for responsive menu
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768 && menuToggle && topnav) {
    topnav.style.display = 'none';
    menuToggle.textContent = '☰';
    console.log('Window resized to mobile - menu hidden');
  } else if (menuToggle && topnav) {
    topnav.style.display = 'flex';
    menuToggle.textContent = '✕';
    console.log('Window resized to desktop - menu visible');
  }
});