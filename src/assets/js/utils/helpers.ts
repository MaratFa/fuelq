/**
 * Helper Utilities
 * Common utility functions used across the application
 */

/**
 * Debounce function to limit how often a function can be called
 * @param func - Function to debounce
 * @param wait - Time in milliseconds to wait
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function(...args: Parameters<T>) {
    const context = func;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Throttle function to limit how often a function can be called
 * @param func - Function to throttle
 * @param limit - Time in milliseconds to limit
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(...args: Parameters<T>) {
    const context = func;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if an element is in the viewport
 * @param element - Element to check
 * @param threshold - Percentage of element that must be visible
 * @returns Whether element is in viewport
 */
export function isInViewport(element: Element, threshold: number = 0): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
  const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);

  return vertInView && horInView;
}

/**
 * Animate an element using CSS transitions
 * @param element - Element to animate
 * @param properties - CSS properties to animate
 * @param options - Animation options
 * @returns Promise that resolves when animation completes
 */
export function animateElement(element: HTMLElement, properties: Record<string, string>, options: { duration?: number; easing?: string } = {}): Promise<void> {
  return new Promise(resolve => {
    // Set transition properties
    const duration = options.duration || 300;
    const easing = options.easing || 'ease';

    element.style.transition = `all ${duration}ms ${easing}`;

    // Apply properties
    Object.keys(properties).forEach(prop => {
      (element.style as any)[prop] = properties[prop];
    });

    // Resolve after animation completes
    setTimeout(resolve, duration);
  });
}

/**
 * Create an intersection observer with common options
 * @param callback - Callback function
 * @param options - Observer options
 * @returns Intersection observer instance
 */
export function createIntersectionObserver(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

/**
 * Format a number with commas
 * @param num - Number to format
 * @returns Formatted number
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a date to a readable string
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return dateObj.toLocaleDateString(undefined, { ...defaultOptions, ...options });
}

/**
 * Generate a random ID
 * @param length - Length of ID
 * @returns Random ID
 */
export function generateId(length: number = 8): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/**
 * Check if device is mobile
 * @returns Whether device is mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get current breakpoint based on window width
 * @returns Current breakpoint
 */
export function getCurrentBreakpoint(): string {
  const width = window.innerWidth;

  if (width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  return 'xl';
}

/**
 * Load an image and return a promise
 * @param src - Image source
 * @returns Promise that resolves with image element
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Get value of a CSS custom property
 * @param property - CSS property name (without --)
 * @param element - Element to get property from (default: document.documentElement)
 * @returns Property value
 */
export function getCSSVariable(property: string, element: Element = document.documentElement): string {
  return getComputedStyle(element).getPropertyValue(`--${property}`).trim();
}

/**
 * Set value of a CSS custom property
 * @param property - CSS property name (without --)
 * @param value - Property value
 * @param element - Element to set property on (default: document.documentElement)
 */
export function setCSSVariable(property: string, value: string, element: HTMLElement = document.documentElement): void {
  element.style.setProperty(`--${property}`, value);
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Whether copy was successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
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
