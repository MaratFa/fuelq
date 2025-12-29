// Main JavaScript file for FuelQ website

// Initialize the website when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  // Initialize all components
  initializeComponents();

  // Initialize animations
  initializeAnimations();

  // Initialize any page-specific functionality
  initializePageSpecific();
});

// Function to initialize components
function initializeComponents() {
  // Components are already loaded by components.js
  // No need to duplicate the loading logic here
  console.log('Components initialized');
}

// Function to initialize animations
function initializeAnimations() {
  // Add scroll animations to elements with animate-on-scroll class
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  // Create an Intersection Observer to detect when elements come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Observe each animated element
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

// Function to initialize page-specific functionality
function initializePageSpecific() {
  // Get current page path
  const path = window.location.pathname;

  // Initialize page-specific scripts based on the current path
  if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
    initializeHomePage();
  } else if (path.includes('forengineers.html')) {
    initializeEngineersPage();
  } else if (path.includes('forum')) {
    initializeForumPage();
  } else if (path.includes('contacts.html')) {
    initializeContactsPage();
  }
}

// Home page specific initialization
function initializeHomePage() {
  // Add any home page specific functionality here
  console.log('Home page initialized');
}

// Engineers page specific initialization
function initializeEngineersPage() {
  // Side navigation
  const openMenu = document.getElementById('open-menu');
  const closeBtn = document.getElementById('close-btn');
  const sideNav = document.getElementById('mySidenav');

  if (openMenu && sideNav) {
    openMenu.addEventListener('click', function() {
      sideNav.style.width = '250px';
    });
  }

  if (closeBtn && sideNav) {
    closeBtn.addEventListener('click', function() {
      sideNav.style.width = '0';
    });
  }

  // Close side navigation when clicking outside
  document.addEventListener('click', function(event) {
    if (sideNav && event.target !== sideNav && !sideNav.contains(event.target) && 
        event.target !== openMenu && !openMenu.contains(event.target)) {
      sideNav.style.width = '0';
    }
  });

  console.log('Engineers page initialized');
}

// Forum page specific initialization
function initializeForumPage() {
  // Forum functionality is handled by forum.js
  console.log('Forum page initialized');
}

// Contacts page specific initialization
function initializeContactsPage() {
  // Contact form functionality
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();

      // Get form values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      // Simple validation
      if (!name || !email || !subject || !message) {
        alert('Please fill in all required fields');
        return;
      }

      // Show success message
      const formContainer = document.querySelector('.form-container');
      if (formContainer) {
        formContainer.innerHTML = `
          <div class="form-success">
            <i class="fas fa-check-circle"></i>
            <h3>Thank you for your message!</h3>
            <p>We've received your inquiry and will respond as soon as possible.</p>
            <button class="btn-primary" onclick="location.reload()">Send Another Message</button>
          </div>
        `;
      }
    });
  }

  console.log('Contacts page initialized');
}
