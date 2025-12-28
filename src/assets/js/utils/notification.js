// Notification utility for displaying messages to users

/**
 * Show a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info, warning)
 * @param {number} duration - How long to show the notification in milliseconds (default: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i> ';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle"></i> ';
      break;
    case 'warning':
      icon = '<i class="fas fa-exclamation-triangle"></i> ';
      break;
    case 'info':
    default:
      icon = '<i class="fas fa-info-circle"></i> ';
      break;
  }

  notification.innerHTML = icon + message;

  // Add to document
  document.body.appendChild(notification);

  // Show notification with a small delay for the transition to work
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Hide notification after duration
  setTimeout(() => {
    notification.classList.remove('show');

    // Remove from document after transition
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);
}

/**
 * Show a success notification
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the notification in milliseconds
 */
function showSuccessNotification(message, duration) {
  showNotification(message, 'success', duration);
}

/**
 * Show an error notification
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the notification in milliseconds
 */
function showErrorNotification(message, duration) {
  showNotification(message, 'error', duration);
}

/**
 * Show an info notification
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the notification in milliseconds
 */
function showInfoNotification(message, duration) {
  showNotification(message, 'info', duration);
}

/**
 * Show a warning notification
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the notification in milliseconds
 */
function showWarningNotification(message, duration) {
  showNotification(message, 'warning', duration);
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
    showWarningNotification
  };
}
