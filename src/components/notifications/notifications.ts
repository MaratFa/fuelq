
/**
 * Notifications Component
 * Handles notification display, filtering, and settings
 */

// Type definitions for notification functionality
interface Notification {
    id: string;
    type: 'mention' | 'reply' | 'like' | 'badge';
    notificationTitle?: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    author?: {
        id: string;
        name: string;
        avatar?: string;
    };
    content?: {
        id: string;
        contentTitle?: string;
        type: string;
    };
}

interface NotificationSettings {
    email: boolean;
    push: boolean;
    mentions: boolean;
    replies: boolean;
    likes: boolean;
    badges: boolean;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize notifications
    initNotifications();
});

/**
 * Initialize notifications functionality
 */
function initNotifications(): void {
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
function initNotificationFilters(): void {
    const filterButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get filter type
            const filterType: string | null = button.getAttribute('data-filter');

            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Apply filter
            if (filterType) {
                filterNotifications(filterType);
            }
        });
    });
}

/**
 * Filter notifications
 * @param filterType - The type of filter to apply
 */
function filterNotifications(filterType: string): void {
    const notificationItems: NodeListOf<HTMLElement> = document.querySelectorAll('.notification-item');

    notificationItems.forEach(item => {
        // Show all notifications
        if (filterType === 'all') {
            item.style.display = 'flex';
            return;
        }

        // Check if notification matches filter
        let shouldShow: boolean = false;

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
    const visibleNotifications: HTMLElement[] = Array.from(notificationItems).filter(
        item => item.style.display !== 'none'
    );

    // Show/hide load more button
    const loadMoreBtn: HTMLElement | null = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = visibleNotifications.length > 0 ? 'block' : 'none';
    }

    // Show/hide empty state
    let emptyState: HTMLElement | null = document.querySelector('.empty-notifications');

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

            const notificationsList: HTMLElement | null = document.querySelector('.notifications-list');
            if (notificationsList) {
                notificationsList.appendChild(emptyState);
            }
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
function initNotificationActions(): void {
    // Mark all as read button
    const markAllReadBtn: HTMLElement | null = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }

    // Individual mark as read buttons
    const markReadBtns: NodeListOf<HTMLElement> = document.querySelectorAll('.mark-read');
    markReadBtns.forEach(button => {
        button.addEventListener('click', (e: Event) => {
            const target = e.target as HTMLElement;
            const notificationItem: HTMLElement | null = target.closest('.notification-item');
            if (notificationItem) {
                markNotificationAsRead(notificationItem);
            }
        });
    });

    // Load more button
    const loadMoreBtn: HTMLElement | null = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreNotifications);
    }
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsAsRead(): void {
    const unreadNotifications: NodeListOf<HTMLElement> = document.querySelectorAll('.notification-item.unread');

    if (unreadNotifications.length === 0) {
        showNotificationApp('All notifications are already marked as read', 'info');
        return;
    }

    // Show loading state
    const markAllReadBtn: HTMLElement | null = document.getElementById('mark-all-read');
    if (!markAllReadBtn) return;

    const originalText: string = markAllReadBtn.innerHTML;
    markAllReadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Marking...';
    markAllReadBtn.setAttribute('disabled', 'true');

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
            const markReadBtn: HTMLElement | null = notification.querySelector('.mark-read');
            if (markReadBtn) {
                markReadBtn.style.display = 'none';
            }
        });

        // Update notification count in header
        updateNotificationCount(0);

        showNotificationApp('All notifications marked as read', 'success');
    })
    .catch(error => {
        console.error('Error marking all notifications as read:', error);
        showNotificationApp('Failed to mark all notifications as read', 'error');
    })
    .finally(() => {
        // Reset button state
        markAllReadBtn.innerHTML = originalText;
        markAllReadBtn.removeAttribute('disabled');
    });
}

/**
 * Mark a notification as read
 * @param notificationItem - The notification item element
 */
function markNotificationAsRead(notificationItem: HTMLElement): void {
    const notificationId: string | null = notificationItem.getAttribute('data-notification-id');

    if (!notificationId) {
        // If no ID, just update UI
        notificationItem.classList.remove('unread');
        const markReadBtn: HTMLElement | null = notificationItem.querySelector('.mark-read');
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
        const markReadBtn: HTMLElement | null = notificationItem.querySelector('.mark-read');
        if (markReadBtn) {
            markReadBtn.style.display = 'none';
        }

        // Update notification count in header
        const unreadCount: number = document.querySelectorAll('.notification-item.unread').length;
        updateNotificationCount(unreadCount);
    })
    .catch(error => {
        console.error('Error marking notification as read:', error);
        showNotificationApp('Failed to mark notification as read', 'error');
    });
}

/**
 * Load more notifications
 */
function loadMoreNotifications(): void {
    // Show loading state
    const loadMoreBtn: HTMLElement | null = document.getElementById('load-more');
    if (!loadMoreBtn) return;

    const originalText: string = loadMoreBtn.innerHTML;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadMoreBtn.setAttribute('disabled', 'true');

    // Get current page
    const currentPage: number = parseInt(loadMoreBtn.getAttribute('data-page') || '1');
    const nextPage: number = currentPage + 1;

    // Get current filter
    const activeFilterBtn: HTMLElement | null = document.querySelector('.filter-btn.active');
    const activeFilter: string | null = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

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
            const notificationsList: HTMLElement | null = document.querySelector('.notifications-list');
            if (!notificationsList) return;

            data.notifications.forEach((notification: Notification) => {
                const notificationElement: HTMLElement = createNotificationElement(notification);
                notificationsList.appendChild(notificationElement);
            });

            // Update page number
            loadMoreBtn.setAttribute('data-page', nextPage.toString());

            // Check if there are more notifications to load
            if (!data.hasMore) {
                loadMoreBtn.style.display = 'none';
            }
        } else {
            // Show message that there are no more notifications
            showNotificationApp('No more notifications to load', 'info');
            loadMoreBtn.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error loading more notifications:', error);
        showNotificationApp('Failed to load more notifications', 'error');
    })
    .finally(() => {
        // Reset button state
        loadMoreBtn.innerHTML = originalText;
        loadMoreBtn.removeAttribute('disabled');
    });
}

/**
 * Create notification element
 * @param notification - The notification data
 * @returns The notification element
 */
function createNotificationElement(notification: Notification): HTMLElement {
    const notificationElement: HTMLElement = document.createElement('div');
    notificationElement.className = `notification-item ${notification.isRead ? '' : 'unread'}`;
    notificationElement.setAttribute('data-notification-id', notification.id);

    // Format timestamp
    const timeAgo: string = formatTimeAgo(notification.timestamp);

    // Create icon based on type
    let iconClass: string;
    let iconColor: string;

    switch (notification.type) {
        case 'mention':
            iconClass = 'fa-at';
            iconColor = '#2196F3';
            break;
        case 'reply':
            iconClass = 'fa-reply';
            iconColor = '#4CAF50';
            break;
        case 'like':
            iconClass = 'fa-heart';
            iconColor = '#F44336';
            break;
        case 'badge':
            iconClass = 'fa-award';
            iconColor = '#FF9800';
            break;
        default:
            iconClass = 'fa-bell';
            iconColor = 'var(--primary-color)';
    }

    notificationElement.innerHTML = `
        <div class="notification-icon" style="background-color: ${iconColor};">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-header">
                <h4>${notification.notificationTitle}</h4>
                <span class="notification-time">${timeAgo}</span>
                ${!notification.isRead ? '<button class="mark-read">Mark as read</button>' : ''}
            </div>
            <div class="notification-message">
                ${notification.message}
            </div>
            <div class="notification-footer">
                ${notification.author ? `
                    <div class="notification-author">
                        <img src="${notification.author.avatar || '/src/assets/images/default-avatar.png'}" 
                             alt="${notification.author.name}" 
                             class="author-avatar">
                        <span>${notification.author.name}</span>
                    </div>
                ` : ''}
                ${notification.content ? `
                    <div class="notification-content-link">
                        <a href="/src/pages/${notification.content.type}.html?id=${notification.content.id}">
                            ${notification.content.contentTitle}
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    return notificationElement;
}

/**
 * Format timestamp as time ago
 * @param timestamp - The timestamp to format
 * @returns Formatted time string
 */
function formatTimeAgo(timestamp: Date): string {
    const now: Date = new Date();
    const diffInSeconds: number = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes: number = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours: number = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays: number = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInMonths: number = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears: number = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Update notification count in header
 * @param count - The new notification count
 */
function updateNotificationCount(count: number): void {
    const notificationCount: HTMLElement | null = document.querySelector('.notification-count');

    if (notificationCount) {
        if (count > 0) {
            notificationCount.textContent = count > 99 ? '99+' : count.toString();
            notificationCount.style.display = 'flex';
        } else {
            notificationCount.style.display = 'none';
        }
    }
}

/**
 * Show notification message
 * @param message - The message to show
 * @param type - The type of notification (info, success, warning, error)
 */
function showNotificationApp(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    // Get notification container or create one if it doesn't exist
    let notificationContainer: HTMLElement | null = document.querySelector('.notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification: HTMLElement = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIconApp(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    notificationContainer.appendChild(notification);

    // Auto-remove after 5 seconds
    const timeout: number = window.setTimeout(() => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);

    // Close button
    const closeBtn: HTMLElement | null = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }

    // Show animation
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
}

/**
 * Get notification icon based on type
 * @param type - The notification type
 * @returns The icon class
 */
function getNotificationIconApp(type: string): string {
    const icons: Record<string, string> = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
    };

    return icons[type] || icons.info!;
}

/**
 * Initialize notification settings modal
 */
function initNotificationSettingsModal(): void {
    const settingsBtn: HTMLElement | null = document.getElementById('notification-settings');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showNotificationSettingsModal();
        });
    }
}

/**
 * Show notification settings modal
 */
function showNotificationSettingsModal(): void {
    // Create modal if it doesn't exist
    let modal: HTMLElement | null = document.getElementById('notification-settings-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'notification-settings-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Notification Settings</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="settings-form">
                        <div class="setting-group">
                            <h4>Notification Channels</h4>
                            <div class="setting-item">
                                <label class="switch">
                                    <input type="checkbox" id="email-notifications" checked>
                                    <span class="slider"></span>
                                </label>
                                <div class="setting-info">
                                    <div class="setting-title">Email Notifications</div>
                                    <div class="setting-desc">Receive notifications via email</div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <label class="switch">
                                    <input type="checkbox" id="push-notifications" checked>
                                    <span class="slider"></span>
                                </label>
                                <div class="setting-info">
                                    <div class="setting-title">Push Notifications</div>
                                    <div class="setting-desc">Receive browser push notifications</div>
                                </div>
                            </div>
                        </div>
                        <div class="setting-group">
                            <h4>Notification Types</h4>
                            <div class="setting-item">
                                <label class="switch">
                                    <input type="checkbox" id="mention-notifications" checked>
                                    <span class="slider"></span>
                                </label>
                                <div class="setting-info">
                                    <div class="setting-title">Mentions</div>
                                    <div class="setting-desc">When someone mentions you</div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <label class="switch">
                                    <input type="checkbox" id="reply-notifications" checked>
                                    <span class="slider"></span>
                                </label>
                                <div class="setting-info">
                                    <div class="setting-title">Replies</div>
                                    <div class="setting-desc">When someone replies to your content</div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <label class="switch">
                                    <input type="checkbox" id="like-notifications" checked>
                                    <span class="slider"></span>
                                </label>
                                <div class="setting-info">
                                    <div class="setting-title">Likes</div>
                                    <div class="setting-desc">When someone likes your content</div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <label class="switch">
                                    <input type="checkbox" id="badge-notifications" checked>
                                    <span class="slider"></span>
                                </label>
                                <div class="setting-info">
                                    <div class="setting-title">Badges</div>
                                    <div class="setting-desc">When you earn a new badge</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary cancel-btn">Cancel</button>
                    <button class="btn-primary save-btn">Save Settings</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize close button
        const closeBtn: HTMLElement | null = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }

        // Initialize cancel button
        const cancelBtn: HTMLElement | null = modal.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }

        // Initialize save button
        const saveBtn: HTMLElement | null = modal.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveNotificationSettings);
        }

        // Initialize backdrop click
        const backdrop: HTMLElement | null = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }
    }

    // Show modal
    if (modal) modal.style.display = 'flex';

    // Load current settings
    loadNotificationSettings();
}

/**
 * Load notification settings
 */
function loadNotificationSettings(): void {
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
        // Update form fields
        const emailCheckbox: HTMLInputElement | null = document.getElementById('email-notifications') as HTMLInputElement;
        const pushCheckbox: HTMLInputElement | null = document.getElementById('push-notifications') as HTMLInputElement;
        const mentionCheckbox: HTMLInputElement | null = document.getElementById('mention-notifications') as HTMLInputElement;
        const replyCheckbox: HTMLInputElement | null = document.getElementById('reply-notifications') as HTMLInputElement;
        const likeCheckbox: HTMLInputElement | null = document.getElementById('like-notifications') as HTMLInputElement;
        const badgeCheckbox: HTMLInputElement | null = document.getElementById('badge-notifications') as HTMLInputElement;

        if (emailCheckbox) emailCheckbox.checked = settings.email;
        if (pushCheckbox) pushCheckbox.checked = settings.push;
        if (mentionCheckbox) mentionCheckbox.checked = settings.mentions;
        if (replyCheckbox) replyCheckbox.checked = settings.replies;
        if (likeCheckbox) likeCheckbox.checked = settings.likes;
        if (badgeCheckbox) badgeCheckbox.checked = settings.badges;
    })
    .catch(error => {
        console.error('Error loading notification settings:', error);
        showNotificationApp('Failed to load notification settings', 'error');
    });
}

/**
 * Save notification settings
 */
function saveNotificationSettings(): void {
    // Get form values
    const emailCheckbox: HTMLInputElement | null = document.getElementById('email-notifications') as HTMLInputElement;
    const pushCheckbox: HTMLInputElement | null = document.getElementById('push-notifications') as HTMLInputElement;
    const mentionCheckbox: HTMLInputElement | null = document.getElementById('mention-notifications') as HTMLInputElement;
    const replyCheckbox: HTMLInputElement | null = document.getElementById('reply-notifications') as HTMLInputElement;
    const likeCheckbox: HTMLInputElement | null = document.getElementById('like-notifications') as HTMLInputElement;
    const badgeCheckbox: HTMLInputElement | null = document.getElementById('badge-notifications') as HTMLInputElement;

    const settings: NotificationSettings = {
        email: emailCheckbox ? emailCheckbox.checked : false,
        push: pushCheckbox ? pushCheckbox.checked : false,
        mentions: mentionCheckbox ? mentionCheckbox.checked : false,
        replies: replyCheckbox ? replyCheckbox.checked : false,
        likes: likeCheckbox ? likeCheckbox.checked : false,
        badges: badgeCheckbox ? badgeCheckbox.checked : false
    };

    // Show loading state
    const saveBtn: HTMLElement | null = document.querySelector('.save-btn');
    if (!saveBtn) return;

    const originalText: string = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.setAttribute('disabled', 'true');

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
        const modal: HTMLElement | null = document.getElementById('notification-settings-modal');
        if (modal) modal.style.display = 'none';

        // Show notification
        showNotificationApp('Notification settings saved successfully', 'success');
    })
    .catch(error => {
        console.error('Error saving notification settings:', error);
        showNotificationApp('Failed to save notification settings', 'error');
    })
    .finally(() => {
        // Reset button state
        saveBtn.innerHTML = originalText;
        saveBtn.removeAttribute('disabled');
    });
}

/**
 * Initialize real-time notifications
 */
function initRealTimeNotifications(): void {
    // Connect to WebSocket
    const socket: WebSocket = new WebSocket(`wss://${window.location.host}/ws/notifications`);

    // Handle connection open
    socket.addEventListener('open', () => {
        console.log('Connected to notifications server');

        // Send authentication token
        const token: string | null = localStorage.getItem('auth_token');
        if (token) {
            socket.send(JSON.stringify({
                type: 'auth',
                token
            }));
        }
    });

    // Handle connection error
    socket.addEventListener('error', (error: Event) => {
        console.error('WebSocket error:', error);
    });

    // Handle connection close
    socket.addEventListener('close', () => {
        console.log('Disconnected from notifications server');

        // Try to reconnect after 3 seconds
        setTimeout(initRealTimeNotifications, 3000);
    });

    // Handle messages
    socket.addEventListener('message', (event: MessageEvent) => {
        try {
            const data: any = JSON.parse(event.data);

            if (data.type === 'new_notification') {
                handleNewNotification(data.notification);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });
}

/**
 * Handle new notification
 * @param notification - The notification data
 */
function handleNewNotification(notification: Notification): void {
    // Add to notifications list
    const notificationsList: HTMLElement | null = document.querySelector('.notifications-list');
    if (!notificationsList) return;

    const notificationElement: HTMLElement = createNotificationElement(notification);
    notificationsList.insertBefore(notificationElement, notificationsList.firstChild);

    // Update notification count in header
    const unreadCount: number = document.querySelectorAll('.notification-item.unread').length;
    updateNotificationCount(unreadCount);

    // Show browser notification if enabled
    const pushCheckbox: HTMLInputElement | null = document.getElementById('push-notifications') as HTMLInputElement;
    if (pushCheckbox && pushCheckbox.checked && Notification.permission === 'granted') {
        showBrowserNotificationApp(notification);
    }

    // Play notification sound
    playNotificationSoundApp();
}

/**
 * Show browser notification
 * @param notification - The notification data
 */
function showBrowserNotificationApp(notification: Notification): void {
    // Check if browser notifications are supported
    if (!('Notification' in window)) {
        return;
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
        Notification.requestPermission();
        return;
    }

    // Check if permission is granted
    if (Notification.permission !== 'granted') {
        return;
    }

    // Create notification
    const browserNotification: Notification = new Notification(
        notification.notificationTitle || 'Notification',
        {
            body: notification.message,
            icon: '/src/assets/images/favicon.png',
            tag: 'fuelq-notification'
        }
    );

    // Auto-close after 5 seconds
    setTimeout(() => {
        browserNotification.close();
    }, 5000);

    // Focus window when notification is clicked
    browserNotification.addEventListener('click', () => {
        window.focus();
        browserNotification.close();
    });
}

/**
 * Play notification sound
 */
function playNotificationSoundApp(): void {
    // Create audio element if it doesn't exist
    let notificationSound: HTMLAudioElement | null = document.getElementById('notification-sound') as HTMLAudioElement;

    if (!notificationSound) {
        notificationSound = document.createElement('audio');
        notificationSound.id = 'notification-sound';
        notificationSound.src = '/src/assets/sounds/notification.mp3';
        notificationSound.volume = 0.5;
        document.body.appendChild(notificationSound);
    }

    // Play sound
    if (notificationSound) {
        notificationSound.play().catch(error => {
            console.error('Error playing notification sound:', error);
        });
    }
}

/**
 * Load notifications
 */
function loadNotifications(): void {
    // Show loading state
    const notificationsList: HTMLElement | null = document.querySelector('.notifications-list');
    if (!notificationsList) return;

    notificationsList.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading notifications...</p>
        </div>
    `;

    // Fetch notifications
    fetch('/api/notifications', {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load notifications');
        }
        return response.json();
    })
    .then(data => {
        // Update UI
        notificationsList.innerHTML = '';

        if (data.notifications.length === 0) {
            // Show empty state
            notificationsList.innerHTML = `
                <div class="empty-notifications">
                    <div class="empty-icon">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <h3>No notifications</h3>
                    <p>Check back later or adjust your notification settings</p>
                </div>
            `;
            return;
        }

        // Add notifications to UI
        data.notifications.forEach((notification: Notification) => {
            const notificationElement: HTMLElement = createNotificationElement(notification);
            notificationsList.appendChild(notificationElement);
        });

        // Update notification count in header
        const unreadCount: number = data.notifications.filter((n: Notification) => !n.isRead).length;
        updateNotificationCount(unreadCount);

        // Show/hide load more button
        const loadMoreBtn: HTMLElement | null = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = data.hasMore ? 'block' : 'none';
            loadMoreBtn.setAttribute('data-page', '1');
        }
    })
    .catch(error => {
        console.error('Error loading notifications:', error);
        notificationsList.innerHTML = `
            <div class="error-message">
                <p>Failed to load notifications. Please try again.</p>
            </div>
        `;
    });
}
