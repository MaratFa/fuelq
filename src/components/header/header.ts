
// Header component TypeScript

// Declare global variables
export {}; // Make this a module
declare global {
  interface Window {
    initHeader: () => void;
  }
}

// Global variables for menu toggle
let menuToggle: HTMLElement | null;
let topnav: HTMLElement | null;

/**
 * Function to initialize header component
 */
function initHeader(): void {
  // Get current page path
  const currentPath: string = window.location.pathname;

  // Handle authentication links
  const loginLink: HTMLElement | null = document.getElementById('login-link');
  const cabinetLink: HTMLElement | null = document.getElementById('cabinet-link');

  // Check if user is authenticated
  const isAuthenticated: boolean = localStorage.getItem('auth_token') !== null;

  if (isAuthenticated) {
    // User is logged in
    if (loginLink) loginLink.style.display = 'none';
    if (cabinetLink) cabinetLink.style.display = 'block';
  } else {
    // User is not logged in
    if (loginLink) loginLink.style.display = 'block';
    if (cabinetLink) cabinetLink.style.display = 'none';
  }

  // Find all navigation links
  const navLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('.topnav a');

  // Set active class based on current page
  navLinks.forEach((link: HTMLAnchorElement) => {
    const linkPath: string | null = link.getAttribute('href');

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
    // Check for exact match or if current page contains link path (but not for home)
    else if (linkPath && linkPath !== 'index.html' && linkPath !== '/index.html') {
      // Remove leading slash for comparison
      const cleanLinkPath: string = linkPath.startsWith('/') ? linkPath.substring(1) : linkPath;
      const cleanCurrentPath: string = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;

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
    if (menuToggle) menuToggle.textContent = '☰';
    console.log('Mobile menu initialized');
  } else if (menuToggle && topnav) {
    if (menuToggle) menuToggle.textContent = '✕';
    console.log('Desktop menu initialized');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      console.log('Menu toggle clicked');
      if (topnav) {
        topnav.classList.toggle('responsive');

        // Update menu icon based on state
        if (topnav.classList.contains('responsive')) {
          if (menuToggle) menuToggle.textContent = '✕';
          console.log('Menu opened');
        } else {
          if (menuToggle) menuToggle.textContent = '☰';
          console.log('Menu closed');
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event: MouseEvent) {
      const target: HTMLElement = event.target as HTMLElement;
      const isClickInside: boolean = topnav ? topnav.contains(target) : false || menuToggle ? menuToggle.contains(target) : false;

      if (!isClickInside && topnav && topnav.classList.contains('responsive')) {
        topnav.classList.remove('responsive');
        if (menuToggle) if (menuToggle) menuToggle.textContent = '☰';
      }
    });
  }
}

// Make initHeader function globally available
window.initHeader = initHeader;

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', initHeader);

// Handle window resize for responsive menu
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && menuToggle && topnav && topnav.classList.contains('responsive')) {
    topnav.classList.remove('responsive');
    if (menuToggle) menuToggle.textContent = '☰';
    console.log('Window resized to desktop - menu closed');
  }
});
