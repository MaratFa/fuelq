/**
 * Forum Enhancements
 * Adds additional interactive features to the forum page
 */

import forumApiClient from './modules/forum-api-client-fixed.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize forum enhancements
    initForumEnhancements();
});

/**
 * Initialize forum enhancements
 */
function initForumEnhancements() {
    // Add keyboard shortcuts
    initKeyboardShortcuts();

    // Add advanced filtering options
    initAdvancedFilters();

    // Add thread preview on hover
    initThreadPreviews();

    // Add auto-save for new thread form
    initAutoSave();

    // Add notification system
    initNotificationSystem();
}

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N to open new thread modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('new-thread-btn').click();
        }

        // Ctrl/Cmd + / to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }

        // Escape to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('new-thread-modal');
            if (modal && modal.style.display === 'flex') {
                closeNewThreadModal();
            }
        }
    });
}

/**
 * Initialize advanced filtering options
 */
function initAdvancedFilters() {
    const forumHeader = document.querySelector('.forum-header');

    // Create advanced filters container
    const advancedFilters = document.createElement('div');
    advancedFilters.className = 'advanced-filters';
    advancedFilters.innerHTML = `
        <div class="filter-toggle">
            <button id="toggle-advanced-filters" class="btn-secondary">
                <i class="fas fa-filter"></i> Advanced Filters
            </button>
        </div>
        <div id="advanced-filters-panel" class="filters-panel" style="display: none;">
            <div class="filter-group">
                <label for="date-filter">Date Range:</label>
                <select id="date-filter">
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="author-filter">Author:</label>
                <input type="text" id="author-filter" placeholder="Filter by author">
            </div>
            <div class="filter-group">
                <label for="comments-filter">Min. Comments:</label>
                <select id="comments-filter">
                    <option value="0">Any</option>
                    <option value="1">1+</option>
                    <option value="5">5+</option>
                    <option value="10">10+</option>
                    <option value="25">25+</option>
                </select>
            </div>
            <div class="filter-actions">
                <button id="apply-filters" class="btn-primary">Apply Filters</button>
                <button id="clear-filters" class="btn-secondary">Clear Filters</button>
            </div>
        </div>
    `;

    // Insert after the forum actions
    const forumActions = document.querySelector('.forum-actions');
    forumActions.parentNode.insertBefore(advancedFilters, forumActions.nextSibling);

    // Toggle advanced filters panel
    const toggleBtn = document.getElementById('toggle-advanced-filters');
    const filtersPanel = document.getElementById('advanced-filters-panel');

    toggleBtn.addEventListener('click', () => {
        if (filtersPanel.style.display === 'none') {
            filtersPanel.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-times"></i> Hide Filters';
        } else {
            filtersPanel.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Advanced Filters';
        }
    });

    // Apply filters button
    document.getElementById('apply-filters').addEventListener('click', applyAdvancedFilters);

    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', clearAdvancedFilters);
}

/**
 * Apply advanced filters
 */
function applyAdvancedFilters() {
    const dateFilter = document.getElementById('date-filter').value;
    const authorFilter = document.getElementById('author-filter').value.toLowerCase().trim();
    const commentsFilter = parseInt(document.getElementById('comments-filter').value);

    // Get current threads based on existing filters
    let filteredThreads = currentCategory === "all" 
        ? [...threads] 
        : threads.filter(thread => thread.category === currentCategory);

    // Apply date filter
    if (dateFilter !== 'all') {
        const now = Date.now();
        let minDate;

        switch (dateFilter) {
            case 'today':
                minDate = new Date();
                minDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                minDate = new Date();
                minDate.setDate(minDate.getDate() - 7);
                break;
            case 'month':
                minDate = new Date();
                minDate.setMonth(minDate.getMonth() - 1);
                break;
            case 'year':
                minDate = new Date();
                minDate.setFullYear(minDate.getFullYear() - 1);
                break;
        }

        if (minDate) {
            filteredThreads = filteredThreads.filter(thread => thread.date >= minDate.getTime());
        }
    }

    // Apply author filter
    if (authorFilter) {
        filteredThreads = filteredThreads.filter(thread => 
            thread.author.toLowerCase().includes(authorFilter)
        );
    }

    // Apply comments filter
    if (commentsFilter > 0) {
        filteredThreads = filteredThreads.filter(thread => 
            thread.comments.length >= commentsFilter
        );
    }

    // Apply search filter if exists
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    if (searchTerm) {
        filteredThreads = filteredThreads.filter(thread => {
            return thread.title.toLowerCase().includes(searchTerm) ||
                thread.content.toLowerCase().includes(searchTerm);
        });
    }

    // Update filtered threads and reset to first page
    window.filteredThreads = filteredThreads;
    window.currentPage = 1;
    renderThreads();

    // Show filter status
    showNotification(`Filters applied: ${filteredThreads.length} threads found`);
}

/**
 * Clear advanced filters
 */
function clearAdvancedFilters() {
    document.getElementById('date-filter').value = 'all';
    document.getElementById('author-filter').value = '';
    document.getElementById('comments-filter').value = '0';

    // Reset to standard filtering
    applyFiltersAndSort();

    // Hide advanced filters panel
    document.getElementById('advanced-filters-panel').style.display = 'none';
    document.getElementById('toggle-advanced-filters').innerHTML = '<i class="fas fa-filter"></i> Advanced Filters';

    showNotification('Filters cleared');
}

/**
 * Initialize thread preview on hover
 */
function initThreadPreviews() {
    // This would require additional implementation to fetch thread content
    // For now, we'll just add a placeholder
    const threadCards = document.querySelectorAll('.thread-card, .thread-item');

    threadCards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            // Implementation would go here
        });
    });
}

/**
 * Initialize auto-save for new thread form
 */
function initAutoSave() {
    const titleInput = document.getElementById('thread-title');
    const contentTextarea = document.getElementById('thread-content');
    const authorInput = document.getElementById('thread-author');

    // Load saved data if exists
    const savedData = localStorage.getItem('forum-thread-draft');
    if (savedData) {
        try {
            const draft = JSON.parse(savedData);
            titleInput.value = draft.title || '';
            contentTextarea.value = draft.content || '';
            authorInput.value = draft.author || '';

            // Show notification
            showNotification('Previous draft restored', 'info');
        } catch (e) {
            console.error('Error parsing saved draft:', e);
        }
    }

    // Auto-save on input
    let saveTimeout;

    function autoSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const draft = {
                title: titleInput.value,
                content: contentTextarea.value,
                author: authorInput.value,
                timestamp: Date.now()
            };

            localStorage.setItem('forum-thread-draft', JSON.stringify(draft));
        }, 1000);
    }

    titleInput.addEventListener('input', autoSave);
    contentTextarea.addEventListener('input', autoSave);
    authorInput.addEventListener('input', autoSave);

    // Clear draft on successful submission
    const createThreadBtn = document.getElementById('create-thread');
    const originalCreateThread = window.handleCreateThread;

    window.handleCreateThread = function() {
        const result = originalCreateThread.call(this);

        // If thread was created successfully, clear the draft
        if (result !== false) {
            localStorage.removeItem('forum-thread-draft');
        }

        return result;
    };
}

/**
 * Initialize notification system
 */
function initNotificationSystem() {
    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
}

/**
 * Show notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (info, success, warning, error)
 */
function showNotification(message, type = 'info') {
    let notificationContainer = document.querySelector('.notification-container');

    // Create notification container if it doesn't exist
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
 * @returns {string} The icon class
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
