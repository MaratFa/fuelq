
// Engineers page specific animations and interactions

document.addEventListener('DOMContentLoaded', function() {
  // Scroll animations for elements
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');

        // Add staggered animation to child elements
        const children = entry.target.querySelectorAll('.spec-item, .implementation-card');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('animate');
          }, index * 100);
        });
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Interactive table highlighting
  const tableRows = document.querySelectorAll('.comparison-table tbody tr');

  tableRows.forEach(row => {
    row.addEventListener('mouseenter', function() {
      this.classList.add('highlight');
    });

    row.addEventListener('mouseleave', function() {
      this.classList.remove('highlight');
    });
  });

  // Card hover effects
  const fuelCards = document.querySelectorAll('.fuel-card');

  fuelCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '';
    });
  });
});
