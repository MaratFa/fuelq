/**
 * Helper Utilities
 * Common utility functions used across the application
 */

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Time in milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time in milliseconds to limit
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if an element is in the viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Percentage of element that must be visible
 * @returns {boolean} Whether element is in viewport
 */
export function isInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
  const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);

  return vertInView && horInView;
}

/**
 * Animate an element using CSS transitions
 * @param {Element} element - Element to animate
 * @param {Object} properties - CSS properties to animate
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function animateElement(element, properties, options = {}) {
  return new Promise(resolve => {
    // Set transition properties
    const duration = options.duration || 300;
    const easing = options.easing || 'ease';

    element.style.transition = `all ${duration}ms ${easing}`;

    // Apply properties
    Object.keys(properties).forEach(prop => {
      element.style[prop] = properties[prop];
    });

    // Resolve after animation completes
    setTimeout(resolve, duration);
  });
}

/**
 * Create an intersection observer with common options
 * @param {Function} callback - Callback function
 * @param {Object} options - Observer options
 * @returns {IntersectionObserver} Intersection observer instance
 */
export function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return dateObj.toLocaleDateString(undefined, { ...defaultOptions, ...options });
}

/**
 * Generate a random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/**
 * Check if the device is mobile
 * @returns {boolean} Whether the device is mobile
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get the current breakpoint based on window width
 * @returns {string} Current breakpoint
 */
export function getCurrentBreakpoint() {
  const width = window.innerWidth;

  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  return 'xl';
}

/**
 * Load an image and return a promise
 * @param {string} src - Image source
 * @returns {Promise<HTMLImageElement>} Promise that resolves with the image element
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Get the value of a CSS custom property
 * @param {string} property - CSS property name (without --)
 * @param {Element} element - Element to get property from (default: document.documentElement)
 * @returns {string} Property value
 */
export function getCSSVariable(property, element = document.documentElement) {
  return getComputedStyle(element).getPropertyValue(`--${property}`).trim();
}

/**
 * Set the value of a CSS custom property
 * @param {string} property - CSS property name (without --)
 * @param {string} value - Property value
 * @param {Element} element - Element to set property on (default: document.documentElement)
 */
export function setCSSVariable(property, value, element = document.documentElement) {
  element.style.setProperty(`--${property}`, value);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether the copy was successful
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
