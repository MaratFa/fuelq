
// Footer component TypeScript

/**
 * Function to initialize footer component
 */
function initFooter(): void {
  // Get current year
  const currentYear: number = new Date().getFullYear();

  // Find year elements in footer
  const yearElements: NodeListOf<Element> = document.querySelectorAll('footer .current-year');

  // Update year elements
  yearElements.forEach((element: Element) => {
    (element as HTMLElement).textContent = currentYear.toString();
  });

  // Add smooth scrolling to footer links
  const footerLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('footer a[href^="#"]');

  footerLinks.forEach((link: HTMLAnchorElement) => {
    link.addEventListener('click', (event: Event) => {
      event.preventDefault();

      const targetId: string | null = link.getAttribute('href');
      const targetElement: Element | null = targetId ? document.querySelector(targetId) : null;

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
