// Footer component JavaScript

// Function to initialize footer component
function initFooter() {
  // Get current year
  const currentYear = new Date().getFullYear();

  // Find year elements in footer
  const yearElements = document.querySelectorAll('footer .current-year');

  // Update year elements
  yearElements.forEach(element => {
    element.textContent = currentYear;
  });

  // Add smooth scrolling to footer links
  const footerLinks = document.querySelectorAll('footer a[href^="#"]');

  footerLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', initFooter);