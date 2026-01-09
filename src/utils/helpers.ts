/**
 * Utility functions for the FuelQ application
 */

/**
 * Show a notification message to the user
 * @param message The message to display
 * @param type The type of notification (success, error, warning, info)
 */
export function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add to the DOM
  document.body.appendChild(notification);

  // Add show class for animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Remove after a delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * Handle errors consistently across the application
 * @param error The error to handle
 * @param context The context where the error occurred
 */
export function handleError(error: any, context: string): void {
  console.error(`Error in ${context}:`, error);
  showNotification(
    error.message || `An error occurred in ${context}`,
    'error'
  );
}

/**
 * Format a date for display
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Truncate text to a specified length
 * @param text The text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate a random ID
 * @returns Random string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounce function calls
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;

  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}
