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
    
    // Check if link matches current page
    if (
      (currentPath.endsWith('/') && linkPath === 'index.html') ||
      currentPath.includes(linkPath)
    ) {
      link.classList.add('active');
    }
  });
  
  // Mobile menu toggle (if needed in future)
  const menuToggle = document.getElementById('menu-toggle');
  const topnav = document.querySelector('.topnav');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      topnav.classList.toggle('responsive');
    });
  }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', initHeader);
