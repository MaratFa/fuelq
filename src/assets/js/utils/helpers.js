// Helper functions for the FuelQuality website

/**
 * Debounce function to limit the rate at which a function can fire.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} - The debounced function.
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The time frame in milliseconds.
 * @returns {Function} - The throttled function.
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if an element is in the viewport.
 * @param {Element} element - The element to check.
 * @param {number} threshold - The percentage of the element that must be visible.
 * @returns {boolean} - Whether the element is in the viewport.
 */
function isInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const vertInView =
    rect.top <= windowHeight * (1 - threshold) &&
    rect.top + rect.height >= windowHeight * threshold;
  const horInView =
    rect.left <= windowWidth * (1 - threshold) &&
    rect.left + rect.width >= windowWidth * threshold;

  return vertInView && horInView;
}

/**
 * Smooth scroll to an element.
 * @param {Element|string} target - The element or selector to scroll to.
 * @param {number} duration - The duration of the scroll animation in milliseconds.
 * @param {number} offset - The offset from the top of the element.
 */
function smoothScrollTo(target, duration = 500, offset = 0) {
  // Get target element
  const targetElement =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!targetElement) return;

  // Calculate target position
  const targetPosition =
    targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  // Animation function
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  // Easing function
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  // Start animation
  requestAnimationFrame(animation);
}

/**
 * Format a date string.
 * @param {Date|string} date - The date to format.
 * @param {string} format - The format string (e.g., 'YYYY-MM-DD').
 * @returns {string} - The formatted date string.
 */
function formatDate(date, format = "YYYY-MM-DD") {
  // Convert string to Date if needed
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Get date components
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  // Replace format tokens
  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * Get a relative time string (e.g., '2 hours ago').
 * @param {Date|string} date - The date to compare.
 * @returns {string} - The relative time string.
 */
function getRelativeTime(date) {
  // Convert string to Date if needed
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  // Calculate difference in seconds
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  // Define time intervals
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  // Find the appropriate interval
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);

    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  // If less than a minute
  return "just now";
}

/**
 * Sanitize HTML to prevent XSS attacks.
 * @param {string} html - The HTML string to sanitize.
 * @returns {string} - The sanitized HTML string.
 */
function sanitizeHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.textContent = html;
  return tempDiv.innerHTML;
}

/**
 * Generate a random ID.
 * @param {number} length - The length of the ID.
 * @returns {string} - The random ID.
 */
function generateRandomId(length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Check if the device is a mobile device.
 * @returns {boolean} - Whether the device is a mobile device.
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get the current viewport size.
 * @returns {Object} - An object with width and height properties.
 */
function getViewportSize() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * Load an external script.
 * @param {string} src - The source URL of the script.
 * @param {boolean} async - Whether to load the script asynchronously.
 * @returns {Promise} - A promise that resolves when the script is loaded.
 */
function loadScript(src, async = true) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = async;

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

/**
 * Load an external stylesheet.
 * @param {string} href - The href URL of the stylesheet.
 * @returns {Promise} - A promise that resolves when the stylesheet is loaded.
 */
function loadStylesheet(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;

    link.onload = resolve;
    link.onerror = reject;

    document.head.appendChild(link);
  });
}

// Export all functions
export {
  debounce,
  throttle,
  isInViewport,
  smoothScrollTo,
  formatDate,
  getRelativeTime,
  sanitizeHTML,
  generateRandomId,
  isMobileDevice,
  getViewportSize,
  loadScript,
  loadStylesheet,
};
