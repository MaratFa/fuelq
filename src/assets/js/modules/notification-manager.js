/**
 * Notification Manager
 * Handles displaying notification messages to users
 */

export class NotificationManager {
  constructor() {
    this.notifications = [];
    this.container = null;
  }

  /**
   * Initialize the notification manager
   */
  init() {
    // Create notification container if it doesn't exist
    this.createNotificationContainer();
  }

  /**
   * Create a container for notifications
   */
  createNotificationContainer() {
    this.container = document.querySelector('.notification-container');

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a notification message
   * @param {string} message - The message to display
   * @param {string} type - The type of notification (success, error, info, warning)
   * @param {number} duration - How long to show the notification (ms)
   * @param {boolean} dismissible - Whether the notification can be manually dismissed
   * @returns {HTMLElement} The notification element
   */
  showNotification(message, type = 'info', duration = 5000, dismissible = true) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Create content container
    const content = document.createElement('div');
    content.className = 'notification-content';

    // Add icon based on type
    const icon = this.getNotificationIcon(type);
    content.appendChild(icon);

    // Add message
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    content.appendChild(messageElement);

    // Add dismiss button if dismissible
    if (dismissible) {
      const dismissButton = document.createElement('button');
      dismissButton.className = 'notification-close';
      dismissButton.innerHTML = '&times;';
      dismissButton.addEventListener('click', () => {
        this.dismissNotification(notification);
      });
      content.appendChild(dismissButton);
    }

    // Add content to notification
    notification.appendChild(content);

    // Add to container
    this.container.appendChild(notification);

    // Track notification
    this.notifications.push(notification);

    // Show notification with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismissNotification(notification);
      }, duration);
    }

    return notification;
  }

  /**
   * Dismiss a notification
   * @param {HTMLElement} notification - The notification to dismiss
   */
  dismissNotification(notification) {
    // Check if notification exists and is still in the DOM
    if (!notification || !notification.parentNode) return;

    // Add hide animation
    notification.classList.remove('show');
    notification.classList.add('hide');

    // Remove after animation completes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }

      // Remove from tracking array
      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 300);
  }

  /**
   * Get the appropriate icon for a notification type
   * @param {string} type - The notification type
   * @returns {HTMLElement} The icon element
   */
  getNotificationIcon(type) {
    const icon = document.createElement('i');
    icon.className = 'notification-icon fas';

    switch (type) {
      case 'success':
        icon.classList.add('fa-check-circle');
        break;
      case 'error':
        icon.classList.add('fa-exclamation-circle');
        break;
      case 'warning':
        icon.classList.add('fa-exclamation-triangle');
        break;
      case 'info':
      default:
        icon.classList.add('fa-info-circle');
        break;
    }

    return icon;
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications() {
    // Create a copy of the array to avoid issues during iteration
    const notifications = [...this.notifications];

    // Dismiss each notification
    notifications.forEach(notification => {
      this.dismissNotification(notification);
    });
  }
}
