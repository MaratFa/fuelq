/**
 * Main TypeScript file for the FuelQ website
 * Contains common functionality used across multiple pages
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize common components
  initializeComponents();

  // Initialize navigation
  initializeNavigation();

  // Initialize theme
  initializeTheme();

  // Initialize animations
  initializeAnimations();
});

/**
 * Initialize common components
 */
function initializeComponents(): void {
  // Initialize tooltips
  initializeTooltips();

  // Initialize modals
  initializeModals();

  // Initialize dropdowns
  initializeDropdowns();

  // Initialize form validation
  initializeFormValidation();
}

/**
 * Initialize tooltips
 */
function initializeTooltips(): void {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');

  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', (e: Event) => {
      const target = e.target as HTMLElement;
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = target.getAttribute('data-tooltip') || '';

      document.body.appendChild(tooltip);

      const rect = target.getBoundingClientRect();
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

      setTimeout(() => tooltip.classList.add('visible'), 10);
    });

    element.addEventListener('mouseleave', () => {
      const tooltip = document.querySelector('.tooltip');
      if (tooltip) {
        tooltip.classList.remove('visible');
        setTimeout(() => tooltip.remove(), 300);
      }
    });
  });
}

/**
 * Initialize modals
 */
function initializeModals(): void {
  const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
  const closeButtons = document.querySelectorAll('.modal-close, .modal .close');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal-trigger');
      const modal = document.getElementById(modalId || '');

      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');

      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Close modals when clicking outside
  document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      const modal = target.closest('.modal');

      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
}

/**
 * Initialize dropdowns
 */
function initializeDropdowns(): void {
  const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');

  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const dropdownId = trigger.getAttribute('data-dropdown-trigger');
      const dropdown = document.getElementById(dropdownId || '');

      if (dropdown) {
        // Close other dropdowns
        document.querySelectorAll('.dropdown.active').forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('active');
          }
        });

        dropdown.classList.toggle('active');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.active').forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  });
}

/**
 * Initialize form validation
 */
function initializeFormValidation(): void {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    form.addEventListener('submit', (e: Event) => {
      let isValid = true;

      // Validate required fields
      const requiredFields = form.querySelectorAll('[required]');

      requiredFields.forEach(field => {
        const inputElement = field as HTMLInputElement;
        if (!inputElement.value.trim()) {
          isValid = false;
          showFieldError(inputElement, 'This field is required');
        } else {
          clearFieldError(inputElement);

          // Validate specific field types
          if (inputElement.type === 'email' && !isValidEmail(inputElement.value)) {
            isValid = false;
            showFieldError(inputElement, 'Please enter a valid email address');
          } else if (inputElement.type === 'tel' && !isValidPhone(inputElement.value)) {
            isValid = false;
            showFieldError(inputElement, 'Please enter a valid phone number');
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
      }
    });

    // Clear errors on input
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        clearFieldError(input as HTMLElement);
      });
    });
  });
}

/**
 * Show field error
 * @param {HTMLElement} field - The field with error
 * @param {string} message - Error message
 */
function showFieldError(field: HTMLElement, message: string): void {
  clearFieldError(field);

  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = message;

  if (field.parentNode) {
    field.parentNode.appendChild(errorElement);
  }
  field.classList.add('error');
}

/**
 * Clear field error
 * @param {HTMLElement} field - The field to clear error from
 */
function clearFieldError(field: HTMLElement): void {
  const errorElement = field.parentNode?.querySelector('.field-error');

  if (errorElement) {
    errorElement.remove();
  }

  field.classList.remove('error');
}

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if phone is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone is valid
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Initialize navigation
 */
function initializeNavigation(): void {
  // Mobile menu toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
  }

  // Active navigation highlighting
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e: Event) => {
      e.preventDefault();

      const targetId = link.getAttribute('href')?.substring(1) || '';
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Initialize theme
 */
function initializeTheme(): void {
  const themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    // Set initial theme
    const savedTheme = localStorage.getItem('fuelq-theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    // Update toggle button
    updateThemeToggle(savedTheme);

    // Handle theme toggle
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('fuelq-theme', newTheme);

      updateThemeToggle(newTheme);
    });
  }
}

/**
 * Update theme toggle button
 * @param {string} theme - Current theme
 */
function updateThemeToggle(theme: string): void {
  const themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    const icon = themeToggle.querySelector('i');

    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    }
  }
}

/**
 * Initialize animations
 */
function initializeAnimations(): void {
  // Intersection Observer for scroll animations
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const animation = entry.target.getAttribute('data-animate');
          if (animation) {
            entry.target.classList.add(animation);
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  // Parallax effect for hero sections
  const heroSections = document.querySelectorAll('.hero-parallax');

  if (heroSections.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      heroSections.forEach(section => {
        const speed = parseFloat(section.getAttribute('data-speed') || '0.5');
        const yPos = -(scrollY * speed);

        (section as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    });
  }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, warning, error)
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 3000): void {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  // Add icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case 'warning':
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-times-circle"></i>';
      break;
    default:
      icon = '<i class="fas fa-info-circle"></i>';
  }

  notification.innerHTML = `${icon} <span>${message}</span>`;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('visible'), 10);

  // Remove after duration
  setTimeout(() => {
    notification.classList.remove('visible');

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number;

  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for use in other modules
export {
  initializeComponents,
  initializeNavigation,
  initializeTheme,
  initializeAnimations
};
