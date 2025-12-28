// Scroll animations for FuelQ website

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeScrollAnimations();
});

// Function to initialize scroll animations
function initializeScrollAnimations() {
  // Find all elements with animate-on-scroll class
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  // Create an Intersection Observer to detect when elements come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation class when element comes into view
        entry.target.classList.add('animated');

        // Add specific animation based on data-animation attribute if present
        const animationType = entry.target.getAttribute('data-animation');
        if (animationType) {
          entry.target.classList.add(`animated-${animationType}`);
        }

        // Stop observing the element once it's animated
        observer.unobserve(entry.target);
      }
    });
  }, { 
    // Start animation when element is 10% visible
    threshold: 0.1,
    // Add some margin to start animation slightly before element is in view
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe each animated element
  animatedElements.forEach(element => {
    // Set initial state
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    // Start observing
    observer.observe(element);
  });
}

// Function to add parallax effect to elements
function initializeParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    parallaxElements.forEach(element => {
      const speed = element.getAttribute('data-parallax') || 0.5;
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// Initialize parallax effects
document.addEventListener('DOMContentLoaded', initializeParallax);

// Function to add counter animation
function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-counter'));
        const duration = parseInt(counter.getAttribute('data-duration') || 2000);
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
            counter.classList.add('counted');
          }
        };

        updateCounter();
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });
}

// Initialize counter animations
document.addEventListener('DOMContentLoaded', animateCounters);

// Function to add fade-in animation to images
function animateImages() {
  const images = document.querySelectorAll('img[data-fade-in]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Add fade-in effect
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.8s ease';

        // Start loading the image if it has data-src attribute (lazy loading)
        if (img.hasAttribute('data-src')) {
          img.src = img.getAttribute('data-src');

          img.onload = () => {
            img.style.opacity = '1';
          };
        } else {
          img.style.opacity = '1';
        }

        imageObserver.unobserve(img);
      }
    });
  }, { threshold: 0.1 });

  images.forEach(img => {
    imageObserver.observe(img);
  });
}

// Initialize image animations
document.addEventListener('DOMContentLoaded', animateImages);

// Utility function to add staggered animation to a list of elements
function staggerAnimation(elements, delay = 100) {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('animated');
    }, index * delay);
  });
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeScrollAnimations,
    initializeParallax,
    animateCounters,
    animateImages,
    staggerAnimation
  };
}
