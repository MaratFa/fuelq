/**
 * Forum Enhancements
 * Adds additional interactive features to the forum page
 */

import forumApiClient from './modules/forum-api-client.js';

// Global types
interface Thread {
    id: string;
    title: string;
    content: string;
    author: string;
    category: string;
    date: number;
    comments: Comment[];
}

interface Comment {
    id: string;
    author: string;
    content: string;
    date: number;
}

interface ThreadDraft {
    title: string;
    content: string;
    author: string;
    timestamp: number;
}

// Global variables
declare global {
    var currentCategory: string;
    var threads: Thread[];
    var filteredThreads: Thread[];
    var currentPage: number;
    var handleCreateThread: () => boolean | void;
    var applyFiltersAndSort: () => void;
    var renderThreads: () => void;
    var closeNewThreadModal: () => void;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize forum enhancements
    initForumEnhancements();
});

/**
 * Initialize forum enhancements
 */
function initForumEnhancements(): void {
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
function initKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        // Ctrl/Cmd + N to open new thread modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const newThreadBtn = document.getElementById('new-thread-btn') as HTMLButtonElement;
            if (newThreadBtn) newThreadBtn.click();
        }

        // Ctrl/Cmd + / to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input') as HTMLInputElement;
            if (searchInput) searchInput.focus();
        }

        // Escape to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('new-thread-modal') as HTMLElement;
            if (modal && modal.style.display === 'flex') {
                closeNewThreadModal();
            }
        }
    });
}

/**
 * Initialize advanced filtering options
 */
function initAdvancedFilters(): void {
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
    if (forumActions && forumActions.parentNode) {
        forumActions.parentNode.insertBefore(advancedFilters, forumActions.nextSibling);
    }

    // Toggle advanced filters panel
    const toggleBtn = document.getElementById('toggle-advanced-filters') as HTMLButtonElement;
    const filtersPanel = document.getElementById('advanced-filters-panel') as HTMLElement;

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
    const applyFiltersBtn = document.getElementById('apply-filters') as HTMLButtonElement;
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyAdvancedFilters);
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters') as HTMLButtonElement;
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAdvancedFilters);
    }
}

/**
 * Apply advanced filters
 */
function applyAdvancedFilters(): void {
    const dateFilter = (document.getElementById('date-filter') as HTMLSelectElement)?.value || 'all';
    const authorFilter = (document.getElementById('author-filter') as HTMLInputElement)?.value.toLowerCase().trim() || '';
    const commentsFilter = parseInt((document.getElementById('comments-filter') as HTMLSelectElement)?.value || '0');

    // Get current threads based on existing filters
    let filteredThreads: Thread[] = typeof currentCategory === "undefined" || currentCategory === "all"
        ? [...threads]
        : threads.filter(thread => thread.category === currentCategory);

    // Apply date filter
    if (dateFilter !== 'all') {
        const now = Date.now();
        let minDate: Date | undefined;

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
    const searchTerm = (document.getElementById('search-input') as HTMLInputElement)?.value.toLowerCase().trim() || '';
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
function clearAdvancedFilters(): void {
    const dateFilter = document.getElementById('date-filter') as HTMLSelectElement;
    const authorFilter = document.getElementById('author-filter') as HTMLInputElement;
    const commentsFilter = document.getElementById('comments-filter') as HTMLSelectElement;

    if (dateFilter) dateFilter.value = 'all';
    if (authorFilter) authorFilter.value = '';
    if (commentsFilter) commentsFilter.value = '0';

    // Reset to standard filtering
    applyFiltersAndSort();

    // Hide advanced filters panel
    const filtersPanel = document.getElementById('advanced-filters-panel') as HTMLElement;
    const toggleBtn = document.getElementById('toggle-advanced-filters') as HTMLButtonElement;

    if (filtersPanel) filtersPanel.style.display = 'none';
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Advanced Filters';

    showNotification('Filters cleared');
}

/**
 * Initialize thread preview on hover
 */
function initThreadPreviews(): void {
    // This would require additional implementation to fetch thread content
    // For now, we'll just add a placeholder
    const threadCards = document.querySelectorAll('.thread-card, .thread-item');

    threadCards.forEach(card => {
        card.addEventListener('mouseenter', (e: Event) => {
            // Implementation would go here
        });
    });
}

/**
 * Initialize auto-save for new thread form
 */
function initAutoSave(): void {
    const titleInput = document.getElementById('thread-title') as HTMLInputElement;
    const contentTextarea = document.getElementById('thread-content') as HTMLTextAreaElement;
    const authorInput = document.getElementById('thread-author') as HTMLInputElement;

    if (!titleInput || !contentTextarea || !authorInput) return;

    // Load saved data if exists
    const savedData = localStorage.getItem('forum-thread-draft');
    if (savedData) {
        try {
            const draft: ThreadDraft = JSON.parse(savedData);
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
    let saveTimeout: number;

    function autoSave(): void {
        clearTimeout(saveTimeout);
        saveTimeout = window.setTimeout(() => {
            const draft: ThreadDraft = {
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
    const createThreadBtn = document.getElementById('create-thread') as HTMLButtonElement;
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
function initNotificationSystem(): void {
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
function showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    let notificationContainer = document.querySelector('.notification-container') as HTMLElement;

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
    const closeBtn = notification.querySelector('.notification-close') as HTMLButtonElement;
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
 * @param {string} type - The notification type
 * @returns {string} The icon class
 */
function getNotificationIcon(type: 'info' | 'success' | 'warning' | 'error'): string {
    const icons = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
    };

    return icons[type] || icons.info;
}
