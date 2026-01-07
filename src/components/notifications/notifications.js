/**
 * Notifications Component
 * Handles notification display, filtering, and settings
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize notifications
    initNotifications();
});

/**
 * Initialize notifications functionality
 */
function initNotifications() {
    // Initialize notification filters
    initNotificationFilters();

    // Initialize notification actions
    initNotificationActions();

    // Initialize notification settings modal
    initNotificationSettingsModal();

    // Initialize real-time notifications
    initRealTimeNotifications();

    // Load notifications
    loadNotifications();
}

/**
 * Initialize notification filters
 */
function initNotificationFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get filter type
            const filterType = button.getAttribute('data-filter');

            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Apply filter
            filterNotifications(filterType);
        });
    });
}

/**
 * Filter notifications
 * @param {string} filterType - The type of filter to apply
 */
function filterNotifications(filterType) {
    const notificationItems = document.querySelectorAll('.notification-item');

    notificationItems.forEach(item => {
        // Show all notifications
        if (filterType === 'all') {
            item.style.display = 'flex';
            return;
        }

        // Check if notification matches filter
        let shouldShow = false;

        switch (filterType) {
            case 'unread':
                shouldShow = item.classList.contains('unread');
                break;
            case 'mentions':
                shouldShow = item.querySelector('.notification-mention') !== null;
                break;
            case 'replies':
                shouldShow = item.querySelector('.notification-reply') !== null;
                break;
            case 'likes':
                shouldShow = item.querySelector('.notification-like') !== null;
                break;
            case 'badges':
                shouldShow = item.querySelector('.notification-badge') !== null;
                break;
        }

        // Show or hide notification
        item.style.display = shouldShow ? 'flex' : 'none';
    });

    // Check if there are any visible notifications
    const visibleNotifications = Array.from(notificationItems).filter(
        item => item.style.display !== 'none'
    );

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = visibleNotifications.length > 0 ? 'block' : 'none';
    }

    // Show/hide empty state
    let emptyState = document.querySelector('.empty-notifications');

    if (visibleNotifications.length === 0) {
        // Create empty state if it doesn't exist
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-notifications';
            emptyState.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-bell-slash"></i>
                </div>
                <h3>No ${filterType} notifications</h3>
                <p>Check back later or adjust your notification settings</p>
            `;

            const notificationsList = document.querySelector('.notifications-list');
            notificationsList.appendChild(emptyState);
        }
    } else {
        // Remove empty state if it exists
        if (emptyState) {
            emptyState.remove();
        }
    }
}

/**
 * Initialize notification actions
 */
function initNotificationActions() {
    // Mark all as read button
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }

    // Individual mark as read buttons
    const markReadBtns = document.querySelectorAll('.mark-read');
    markReadBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const notificationItem = e.target.closest('.notification-item');
            if (notificationItem) {
                markNotificationAsRead(notificationItem);
            }
        });
    });

    // Load more button
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreNotifications);
    }
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsAsRead() {
    const unreadNotifications = document.querySelectorAll('.notification-item.unread');

    if (unreadNotifications.length === 0) {
        showNotification('All notifications are already marked as read', 'info');
        return;
    }

    // Show loading state
    const markAllReadBtn = document.getElementById('mark-all-read');
    const originalText = markAllReadBtn.innerHTML;
    markAllReadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Marking...';
    markAllReadBtn.disabled = true;

    // Send to server
    fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
        }
        return response.json();
    })
    .then(data => {
        // Update UI
        unreadNotifications.forEach(notification => {
            notification.classList.remove('unread');
            const markReadBtn = notification.querySelector('.mark-read');
            if (markReadBtn) {
                markReadBtn.style.display = 'none';
            }
        });

        // Update notification count in header
        updateNotificationCount(0);

        showNotification('All notifications marked as read', 'success');
    })
    .catch(error => {
        console.error('Error marking all notifications as read:', error);
        showNotification('Failed to mark all notifications as read', 'error');
    })
    .finally(() => {
        // Reset button state
        markAllReadBtn.innerHTML = originalText;
        markAllReadBtn.disabled = false;
    });
}

/**
 * Mark a notification as read
 * @param {HTMLElement} notificationItem - The notification item element
 */
function markNotificationAsRead(notificationItem) {
    const notificationId = notificationItem.getAttribute('data-notification-id');

    if (!notificationId) {
        // If no ID, just update UI
        notificationItem.classList.remove('unread');
        const markReadBtn = notificationItem.querySelector('.mark-read');
        if (markReadBtn) {
            markReadBtn.style.display = 'none';
        }
        return;
    }

    // Send to server
    fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }
        return response.json();
    })
    .then(data => {
        // Update UI
        notificationItem.classList.remove('unread');
        const markReadBtn = notificationItem.querySelector('.mark-read');
        if (markReadBtn) {
            markReadBtn.style.display = 'none';
        }

        // Update notification count in header
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        updateNotificationCount(unreadCount);
    })
    .catch(error => {
        console.error('Error marking notification as read:', error);
        showNotification('Failed to mark notification as read', 'error');
    });
}

/**
 * Load more notifications
 */
function loadMoreNotifications() {
    // Show loading state
    const loadMoreBtn = document.getElementById('load-more');
    const originalText = loadMoreBtn.innerHTML;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadMoreBtn.disabled = true;

    // Get current page
    const currentPage = parseInt(loadMoreBtn.getAttribute('data-page') || '1');
    const nextPage = currentPage + 1;

    // Get current filter
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

    // Send to server
    fetch(`/api/notifications?page=${nextPage}&filter=${activeFilter}`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load more notifications');
        }
        return response.json();
    })
    .then(data => {
        if (data.notifications && data.notifications.length > 0) {
            // Add notifications to list
            const notificationsList = document.querySelector('.notifications-list');

            data.notifications.forEach(notification => {
                const notificationElement = createNotificationElement(notification);
                notificationsList.appendChild(notificationElement);
            });

            // Update page number
            loadMoreBtn.setAttribute('data-page', nextPage.toString());

            // Check if there are more notifications to load
            if (!data.hasMore) {
                loadMoreBtn.style.display = 'none';
            }
        } else {
            // No more notifications
            loadMoreBtn.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error loading more notifications:', error);
        showNotification('Failed to load more notifications', 'error');
    })
    .finally(() => {
        // Reset button state
        loadMoreBtn.innerHTML = originalText;
        loadMoreBtn.disabled = false;
    });
}

/**
 * Initialize notification settings modal
 */
function initNotificationSettingsModal() {
    const settingsBtn = document.getElementById('notification-settings');
    const modal = document.getElementById('notification-settings-modal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const saveBtn = modal.querySelector('.save-btn');

    // Open modal
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            modal.style.display = 'flex';

            // Load current settings
            loadNotificationSettings();
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Save settings
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNotificationSettings);
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Load notification settings
 */
function loadNotificationSettings() {
    fetch('/api/notifications/settings', {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load notification settings');
        }
        return response.json();
    })
    .then(settings => {
        // Update UI with settings
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            const settingName = checkbox.getAttribute('data-setting');
            if (settingName && settings[settingName] !== undefined) {
                checkbox.checked = settings[settingName];
            }
        });
    })
    .catch(error => {
        console.error('Error loading notification settings:', error);
        showNotification('Failed to load notification settings', 'error');
    });
}

/**
 * Save notification settings
 */
function saveNotificationSettings() {
    // Get all settings
    const settings = {};
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        const settingName = checkbox.getAttribute('data-setting');
        if (settingName) {
            settings[settingName] = checkbox.checked;
        }
    });

    // Show loading state
    const saveBtn = modal.querySelector('.save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;

    // Send to server
    fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save notification settings');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        modal.style.display = 'none';

        showNotification('Notification settings saved successfully', 'success');
    })
    .catch(error => {
        console.error('Error saving notification settings:', error);
        showNotification('Failed to save notification settings', 'error');
    })
    .finally(() => {
        // Reset button state
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });
}

/**
 * Initialize real-time notifications
 */
function initRealTimeNotifications() {
    // Check if browser supports WebSocket
    if (!window.WebSocket) {
        console.warn('Browser does not support WebSocket');
        return;
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;

    const socket = new WebSocket(wsUrl);

    // Connection opened
    socket.addEventListener('open', () => {
        console.log('Connected to notification WebSocket');

        // Subscribe to notifications
        socket.send(JSON.stringify({
            action: 'subscribe',
            type: 'notifications'
        }));
    });

    // Message received
    socket.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'notification') {
                // Handle new notification
                handleNewNotification(data.notification);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    // Connection closed
    socket.addEventListener('close', () => {
        console.log('Disconnected from notification WebSocket');

        // Try to reconnect after 5 seconds
        setTimeout(() => {
            initRealTimeNotifications();
        }, 5000);
    });

    // Connection error
    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

/**
 * Handle new notification
 * @param {Object} notification - The new notification data
 */
function handleNewNotification(notification) {
    // Add notification to list
    const notificationsList = document.querySelector('.notifications-list');
    const notificationElement = createNotificationElement(notification);

    // Add to beginning of list
    notificationsList.insertBefore(notificationElement, notificationsList.firstChild);

    // Update notification count in header
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    updateNotificationCount(unreadCount);

    // Show browser notification if allowed
    if (notification.settings && notification.settings.browser) {
        showBrowserNotification(notification);
    }
}

/**
 * Create notification element
 * @param {Object} notification - The notification data
 * @returns {HTMLElement} - The notification element
 */
function createNotificationElement(notification) {
    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
    notificationItem.setAttribute('data-notification-id', notification.id);

    // Determine icon type
    let iconClass, iconElement;

    switch (notification.type) {
        case 'mention':
            iconClass = 'notification-mention';
            iconElement = '<i class="fas fa-at"></i>';
            break;
        case 'reply':
            iconClass = 'notification-reply';
            iconElement = '<i class="fas fa-reply"></i>';
            break;
        case 'like':
            iconClass = 'notification-like';
            iconElement = '<i class="fas fa-heart"></i>';
            break;
        case 'badge':
            iconClass = 'notification-badge';
            iconElement = '<i class="fas fa-award"></i>';
            break;
        default:
            iconClass = 'notification-system';
            iconElement = '<i class="fas fa-info-circle"></i>';
    }

    // Format time
    const timeAgo = formatTimeAgo(notification.timestamp);

    // Build HTML
    notificationItem.innerHTML = `
        <div class="notification-icon ${iconClass}">
            ${iconElement}
        </div>
        <div class="notification-content">
            <p>${notification.content}</p>
            <span class="notification-time">${timeAgo}</span>
        </div>
        <div class="notification-actions-item">
            <button class="action-btn mark-read" style="${notification.read ? 'display: none;' : ''}">
                <i class="fas fa-check"></i>
            </button>
        </div>
    `;

    // Add event listener to mark as read button
    const markReadBtn = notificationItem.querySelector('.mark-read');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', () => {
            markNotificationAsRead(notificationItem);
        });
    }

    return notificationItem;
}

/**
 * Format time ago
 * @param {number} timestamp - The timestamp in milliseconds
 * @returns {string} - The formatted time ago string
 */
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
    }

    return 'Just now';
}

/**
 * Show browser notification
 * @param {Object} notification - The notification data
 */
function showBrowserNotification(notification) {
    // Check if browser supports notifications and permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title || 'FuelQ Notification', {
            body: notification.text,
            icon: '/src/assets/images/favicon.png',
            tag: notification.id
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        // Request permission
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showBrowserNotification(notification);
            }
        });
    }
}

/**
 * Update notification count in header
 * @param {number} count - The unread notification count
 */
function updateNotificationCount(count) {
    const notificationCount = document.querySelector('.notification-count');

    if (notificationCount) {
        if (count > 0) {
            notificationCount.textContent = count > 99 ? '99+' : count;
            notificationCount.style.display = 'flex';
        } else {
            notificationCount.style.display = 'none';
        }
    }
}

/**
 * Load notifications
 */
function loadNotifications() {
    // Show loading state
    const notificationsList = document.querySelector('.notifications-list');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <p>Loading notifications...</p>
    `;
    notificationsList.appendChild(loadingIndicator);

    // Get current filter
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

    // Send to server
    fetch(`/api/notifications?filter=${activeFilter}`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load notifications');
        }
        return response.json();
    })
    .then(data => {
        // Remove loading indicator
        loadingIndicator.remove();

        // Clear current notifications
        notificationsList.innerHTML = '';

        if (data.notifications && data.notifications.length > 0) {
            // Add notifications to list
            data.notifications.forEach(notification => {
                const notificationElement = createNotificationElement(notification);
                notificationsList.appendChild(notificationElement);
            });

            // Update load more button
            const loadMoreBtn = document.getElementById('load-more');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = data.hasMore ? 'block' : 'none';
                loadMoreBtn.setAttribute('data-page', '1');
            }

            // Update notification count
            const unreadCount = data.notifications.filter(n => !n.read).length;
            updateNotificationCount(unreadCount);
        } else {
            // Show empty state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-notifications';
            emptyState.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-bell-slash"></i>
                </div>
                <h3>No notifications</h3>
                <p>Check back later or adjust your notification settings</p>
            `;
            notificationsList.appendChild(emptyState);
        }
    })
    .catch(error => {
        // Remove loading indicator
        loadingIndicator.remove();

        console.error('Error loading notifications:', error);
        showNotification('Failed to load notifications', 'error');
    });
}

/**
 * Show notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (info, success, warning, error)
 */
function showNotification(message, type = 'info') {
    // Get notification container or create one if it doesn't exist
    let notificationContainer = document.querySelector('.notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    notificationContainer.appendChild(notification);

    // Auto-remove after 5 seconds
    const timeout = setTimeout(() => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(timeout);
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    // Show animation
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
}

/**
 * Get notification icon based on type
 * @param {string} type - The notification type
 * @returns {string} - The icon class
 */
function getNotificationIcon(type) {
    const icons = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
    };

    return icons[type] || icons.info;
}
