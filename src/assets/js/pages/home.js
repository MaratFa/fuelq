// Home page specific JavaScript

// Function to initialize home page
function initHomePage() {
  // Animate hero elements on page load
  const heroElements = document.querySelectorAll('.hero-content > *');
  
  // Add animation class with delay for each element
  heroElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('animate-in');
    }, index * 200);
  });
  
  // Handle smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
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
  
  // Animate energy cards on scroll
  const energyCards = document.querySelectorAll('.energy-card');
  
  // Create intersection observer for animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe each energy card
  energyCards.forEach(card => {
    cardObserver.observe(card);
  });
  
  // Animate community stats on scroll
  const communityStats = document.querySelectorAll('.stat-item');
  
  // Create intersection observer for stats
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Get the stat number element
        const statNumber = entry.target.querySelector('.stat-number');
        
        if (statNumber) {
          // Get the final number
          const finalNumber = statNumber.textContent;
          const numericValue = parseInt(finalNumber.replace(/\D/g, ''));
          
          // Animate the number
          animateNumber(statNumber, 0, numericValue, 1500, finalNumber.replace(/\d+/g, ''));
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe each stat item
  communityStats.forEach(stat => {
    statsObserver.observe(stat);
  });
}

// Function to animate a number from start to end
function animateNumber(element, start, end, duration, suffix = '') {
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Use easeOutQuart for easing
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(start + (end - start) * easeOutQuart);
    
    element.textContent = currentValue + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', initHomePage);
