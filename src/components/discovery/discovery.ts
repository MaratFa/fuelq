
/**
 * Discovery Component
 * Handles content discovery, filtering, and recommendations
 */

// Type definitions for discovery functionality
interface Topic {
    id: string;
    title: string;
    description: string;
    color?: string;
    icon?: string;
    trend?: string;
    comments?: number;
    views?: number;
}

interface Expert {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatar?: string;
    articles?: number;
    followers?: number;
    isFollowing?: boolean;
}

interface ContentItem {
    id: string;
    type: 'discussion' | 'article' | 'resource';
    title: string;
    description: string;
    image?: string;
    category: string;
    date?: string;
    readTime?: string;
    views?: number;
    likes?: number;
}

interface Filters {
    contentType?: string;
    energyType?: string;
}

interface DiscoveryData {
    trendingTopics: Topic[];
    featuredExperts: Expert[];
    recommendedContent: ContentItem[];
}

interface UserInteraction {
    type: string;
    title: string;
    category: string;
    timestamp: string;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize discovery
    initDiscovery();
});

/**
 * Initialize discovery functionality
 */
function initDiscovery(): void {
    // Initialize filters
    initFilters();

    // Initialize search functionality
    initSearch();

    // Initialize personalized recommendations
    initPersonalizedRecommendations();

    // Initialize trending topics
    initTrendingTopics();

    // Initialize featured experts
    initFeaturedExperts();

    // Initialize recommended content
    initRecommendedContent();

    // Load initial data
    loadDiscoveryData();
}

/**
 * Initialize personalized recommendations
 */
function initPersonalizedRecommendations(): void {
    const viewAllBtn: HTMLElement | null = document.querySelector('.personalized-recommendations .view-all-btn');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            // Navigate to full recommendations page
            window.location.href = '/src/pages/recommendations.html';
        });
    }

    // Add click handlers to recommendation cards
    const recommendationCards: NodeListOf<HTMLElement> = document.querySelectorAll('.recommendation-card');
    recommendationCards.forEach(card => {
        card.addEventListener('click', () => {
            // Track recommendation click for future personalization
            trackRecommendationClick(card as HTMLElement);

            // Navigate to content
            const title = card.querySelector('h3')?.textContent || '';
            navigateToContent(title);
        });
    });
}

/**
 * Track recommendation click for personalization
 * @param card - The clicked recommendation card
 */
function trackRecommendationClick(card: HTMLElement): void {
    const title = card.querySelector('h3')?.textContent || '';
    const category = card.querySelector('.recommendation-tag')?.textContent || '';

    // Store interaction in localStorage for personalization
    const interactions: UserInteraction[] = JSON.parse(localStorage.getItem('fuelq_interactions') || '[]');
    interactions.push({
        type: 'recommendation_click',
        title,
        category,
        timestamp: new Date().toISOString()
    });

    // Keep only last 50 interactions
    if (interactions.length > 50) {
        interactions.shift();
    }

    localStorage.setItem('fuelq_interactions', JSON.stringify(interactions));
}

/**
 * Navigate to content based on title
 * @param title - The content title
 */
function navigateToContent(title: string): void {
    // In a real implementation, this would navigate to actual content
    // For now, we'll just show a notification
    showNotificationDiscovery(`Opening: ${title}`, 'info');
}



/**
 * Initialize search functionality
 */
function initSearch(): void {
    const searchInput: HTMLInputElement | null = document.getElementById('discovery-search') as HTMLInputElement;
    const searchClear: HTMLElement | null = document.getElementById('search-clear');
    const searchToggle: HTMLElement | null = document.getElementById('search-toggle');

    if (!searchInput || !searchClear || !searchToggle) return;

    // Handle search input
    let searchTimeout: number;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);

        // Show/hide clear button
        if (e.target && searchClear) searchClear.style.display = (e.target as HTMLInputElement).value ? 'block' : 'none';

        // Debounce search
        searchTimeout = window.setTimeout(() => {
            if (e.target) performDiscoverySearch((e.target as HTMLInputElement).value);
        }, 300);
    });

    // Handle clear button
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        performDiscoverySearch('');
    });

    // Handle advanced search toggle
    searchToggle.addEventListener('click', () => {
        const filters: HTMLElement | null = document.querySelector('.discovery-filters');
        if (filters) {
            filters.classList.toggle('expanded');
            if (searchToggle) {
                const span = searchToggle.querySelector('span');
                if (span) span.textContent =
                    filters.classList.contains('expanded') ? 'Hide Filters' : 'Advanced Search';
            }
        }
    });
}

/**
 * Perform search with given query
 * @param query - Search query
 */
function performDiscoverySearch(query: string): void {
    // Get active filters
    const activeFilters = getActiveFilters();

    // Load data with search query and filters
    loadDiscoveryData(query, activeFilters);
}

/**
 * Get active filter values
 * @returns Active filters
 */
function getActiveFilters(): Filters {
    const contentType: string[] = [];
    const energyType: string[] = [];

    // Get content type filters
    document.querySelectorAll('input[id^="filter-"]:checked').forEach(input => {
        if (input.id.includes('discussions')) contentType.push('discussions');
        if (input.id.includes('articles')) contentType.push('articles');
        if (input.id.includes('resources')) contentType.push('resources');
        if (input.id.includes('experts')) contentType.push('experts');
    });

    // Get energy type filters
    document.querySelectorAll('input[id^="filter-"]:checked').forEach(input => {
        if (input.id.includes('hydrogen')) energyType.push('hydrogen');
        if (input.id.includes('solar')) energyType.push('solar');
        if (input.id.includes('wind')) energyType.push('wind');
        if (input.id.includes('biofuels')) energyType.push('biofuels');
        if (input.id.includes('geothermal')) energyType.push('geothermal');
        if (input.id.includes('nuclear')) energyType.push('nuclear');
    });

    return {
        contentType: contentType.join(','),
        energyType: energyType.join(',')
    };
}

/**
 * Reset content display to show all items
 */
function resetContentDisplay(): void {
    const allItems: NodeListOf<HTMLElement> = document.querySelectorAll('.trending-topic, .expert-card, .content-item');
    allItems.forEach(item => {
        item.style.display = '';
    });
}

/**
 * Initialize filters
 */
function initFilters(): void {
    // Content type filters
    const contentTypeFilters: NodeListOf<HTMLInputElement> = document.querySelectorAll('.filter-option input[type="checkbox"]');
    contentTypeFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Energy type filters
    const energyTypeFilters: NodeListOf<HTMLInputElement> = document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]');
    energyTypeFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Sort options
    const sortOptions: NodeListOf<HTMLInputElement> = document.querySelectorAll('.radio-option input[type="radio"]');
    sortOptions.forEach(option => {
        option.addEventListener('change', applyFilters);
    });
}

/**
 * Apply filters to content
 */
function applyFilters(): void {
    // Get selected content types
    const contentTypeFilters = Array.from(
        document.querySelectorAll('.filter-group:first-child input[type="checkbox"]:checked')
    ).map(input => input.id.replace('filter-', ''));

    // Get selected energy types
    const energyTypeFilters = Array.from(
        document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]:checked')
    ).map(input => input.id.replace('filter-', ''));

    // Get selected sort option
    const sortOption = document.querySelector('.radio-option input[type="radio"]:checked')?.id.replace('sort-', '') || '';

    // Show loading state
    showLoadingState();

    // Fetch filtered content
    fetch(`${window.location.origin}/src/api/discovery`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contentTypes: contentTypeFilters,
            energyTypes: energyTypeFilters,
            sortBy: sortOption
        }),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch filtered content');
        }
        return response.json();
    })
    .then(data => {
        // Update content sections
        updateTrendingTopics(data.trendingTopics);
        updateFeaturedExperts(data.featuredExperts);
        updateRecommendedContent(data.recommendedContent);
    })
    .catch(error => {
        console.error('Error fetching filtered content:', error);
        showNotificationDiscovery('Failed to apply filters', 'error');
    })
    .finally(() => {
        hideLoadingState();
    });
}

/**
 * Initialize trending topics
 */
function initTrendingTopics(): void {
    const viewAllBtn = document.querySelector('.trending-section .view-all-btn');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            window.location.href = '/src/pages/discovery/trending.html';
        });
    }

    // Add click handlers to topic cards
    const topicCards = document.querySelectorAll('.trending-topic');
    topicCards.forEach(card => {
        card.addEventListener('click', () => {
            const topicId = card.getAttribute('data-topic-id');
            if (topicId) {
                window.location.href = `/src/pages/forum/thread.html?id=${topicId}`;
            }
        });
    });
}

/**
 * Initialize featured experts
 */
function initFeaturedExperts(): void {
    const viewAllBtn = document.querySelector('.featured-experts .view-all-btn');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            window.location.href = '/src/pages/discovery/experts.html';
        });
    }

    // Add click handlers to expert cards
    const expertCards = document.querySelectorAll('.expert-card');
    expertCards.forEach(card => {
        // Expert profile link
        card.addEventListener('click', (e) => {
            if (e.target && !(e.target as HTMLElement).closest('.follow-btn')) {
                const expertId = card.getAttribute('data-expert-id');
                if (expertId) {
                    window.location.href = `/src/pages/profile.html?id=${expertId}`;
                }
            }
        });

        // Follow button
        const followBtn = card.querySelector('.follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const expertId = card.getAttribute('data-expert-id');
                if (expertId && followBtn) toggleFollowExpert(expertId, followBtn as HTMLElement);
            });
        }
    });
}

/**
 * Initialize recommended content
 */
function initRecommendedContent(): void {
    const refreshBtn = document.querySelector('.recommended-content .refresh-btn');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshRecommendedContent);
    }

    // Add click handlers to content cards
    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach(card => {
        card.addEventListener('click', () => {
            const contentId = card.getAttribute('data-content-id');
            const contentType = card.getAttribute('data-content-type');

            if (contentId && contentType) {
                let url;

                switch (contentType) {
                    case 'discussion':
                        url = `/src/pages/forum/thread.html?id=${contentId}`;
                        break;
                    case 'article':
                        url = `/src/pages/articles/article.html?id=${contentId}`;
                        break;
                    case 'resource':
                        url = `/src/pages/resources/resource.html?id=${contentId}`;
                        break;
                }

                if (url) {
                    window.location.href = url;
                }
            }
        });
    });
}

/**
 * Toggle follow expert
 * @param expertId - The expert ID
 * @param followBtn - The follow button element
 */
function toggleFollowExpert(expertId: string, followBtn: HTMLElement): void {
    const isFollowing = followBtn.classList.contains('following');

    // Update button state
    if (isFollowing) {
        followBtn.classList.remove('following');
        followBtn.textContent = 'Follow';
    } else {
        followBtn.classList.add('following');
        followBtn.innerHTML = '<i class="fas fa-check"></i> Following';
    }

    // Send to server
    const endpoint = isFollowing ? '/api/experts/unfollow' : '/api/experts/follow';

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expertId }),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} expert`);
        }
        return response.json();
    })
    .then(data => {
        // Show notification
        showNotificationDiscovery(
            isFollowing ? 'Expert unfollowed' : 'Expert followed',
            'success'
        );
    })
    .catch(error => {
        console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} expert:`, error);

        // Revert button state
        if (isFollowing) {
            followBtn.classList.add('following');
            followBtn.innerHTML = '<i class="fas fa-check"></i> Following';
        } else {
            followBtn.classList.remove('following');
            followBtn.textContent = 'Follow';
        }

        showNotificationDiscovery(
            `Failed to ${isFollowing ? 'unfollow' : 'follow'} expert`,
            'error'
        );
    });
}

/**
 * Refresh recommended content
 */
function refreshRecommendedContent(): void {
    const refreshBtn = document.querySelector('.recommended-content .refresh-btn');

    // Show loading state
    const originalHTML = refreshBtn?.innerHTML;
    if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    if (refreshBtn) (refreshBtn as HTMLButtonElement).disabled = true;

    // Fetch new recommendations
    fetch(`${window.location.origin}/src/api/discovery`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to refresh recommendations');
        }
        return response.json();
    })
    .then(data => {
        // Update recommended content
        updateRecommendedContent(data.content);

        // Show notification
        showNotificationDiscovery('Recommendations refreshed', 'success');
    })
    .catch(error => {
        console.error('Error refreshing recommendations:', error);
        showNotificationDiscovery('Failed to refresh recommendations', 'error');
    })
    .finally(() => {
        // Reset button state
        if (refreshBtn && originalHTML) refreshBtn.innerHTML = originalHTML;
        if (refreshBtn) (refreshBtn as HTMLButtonElement).disabled = false;
    });
}

/**
 * Update trending topics
 * @param topics - The trending topics
 */
function updateTrendingTopics(topics: Topic[]): void {
    const topicsContainer = document.querySelector('.trending-topics');

    // Clear existing topics
    if (topicsContainer) topicsContainer.innerHTML = '';

    // Add new topics
    topics.forEach(topic => {
        const topicElement = document.createElement('div');
        topicElement.className = 'trending-topic';
        topicElement.setAttribute('data-topic-id', topic.id);

        // Determine trend icon and color
        let trendIcon, trendColor;
        const trendValue = topic.trend ? topic.trend.replace('+', '').replace('%', '') : '0';
        if (parseFloat(trendValue) > 0) {
            trendIcon = 'fa-arrow-up';
            trendColor = '#4CAF50';
        } else if (parseFloat(trendValue) < 0) {
            trendIcon = 'fa-arrow-down';
            trendColor = '#F44336';
        } else {
            trendIcon = 'fa-minus';
            trendColor = '#9E9E9E';
        }

        topicElement.innerHTML = `
            <div class="topic-icon" style="background-color: ${topic.color || 'var(--primary-color)'};">
                <i class="${topic.icon || 'fas fa-bolt'}"></i>
            </div>
            <div class="topic-content">
                <h3>${topic.title}</h3>
                <p>${topic.description}</p>
                <div class="topic-stats">
                    <span><i class="fas fa-comments"></i> ${formatNumber(topic.comments || 0)} discussions</span>
                    <span><i class="fas fa-eye"></i> ${formatNumber(topic.views || 0)} views</span>
                </div>
            </div>
            <div class="topic-trend" style="color: ${trendColor};">
                <i class="fas ${trendIcon}"></i>
                <span>${Math.abs(parseFloat(trendValue))}%</span>
            </div>
        `;

        if (topicsContainer) topicsContainer.appendChild(topicElement);
    });

    // Re-initialize click handlers
    initTrendingTopics();
}

/**
 * Update featured experts
 * @param experts - The featured experts
 */
function updateFeaturedExperts(experts: Expert[]): void {
    const expertsContainer = document.querySelector('.experts-grid');

    // Clear existing experts
    if (expertsContainer) expertsContainer.innerHTML = '';

    // Add new experts
    experts.forEach(expert => {
        const expertElement = document.createElement('div');
        expertElement.className = 'expert-card';
        expertElement.setAttribute('data-expert-id', expert.id);

        expertElement.innerHTML = `
            <img src="${expert.avatar || '/src/assets/images/default-avatar.png'}" alt="${expert.name}" class="expert-avatar">
            <div class="expert-info">
                <h3>${expert.name}</h3>
                <p class="expert-title">${expert.title}</p>
                <div class="expert-bio">${expert.bio}</div>
                <div class="expert-stats">
                    <span><i class="fas fa-file-alt"></i> ${formatNumber(expert.articles || 0)} articles</span>
                    <span><i class="fas fa-users"></i> ${formatNumber(expert.followers || 0)} followers</span>
                </div>
                <button class="follow-btn ${expert.isFollowing ? 'following' : ''}">
                    ${expert.isFollowing ? '<i class="fas fa-check"></i> Following' : 'Follow'}
                </button>
            </div>
        `;

        if (expertsContainer) expertsContainer.appendChild(expertElement);
    });

    // Re-initialize click handlers
    initFeaturedExperts();
}

/**
 * Update recommended content
 * @param content - The recommended content
 */
function updateRecommendedContent(content: ContentItem[]): void {
    const contentContainer = document.querySelector('.content-grid');

    // Clear existing content
    if (contentContainer) contentContainer.innerHTML = '';

    // Add new content
    content.forEach(item => {
        const contentElement = document.createElement('div');
        contentElement.className = `content-card ${item.type}`;
        contentElement.setAttribute('data-content-id', item.id);
        contentElement.setAttribute('data-content-type', item.type);

        // Determine badge color based on content type
        let badgeColor;
        switch (item.type) {
            case 'discussion':
                badgeColor = 'var(--primary-color)';
                break;
            case 'article':
                badgeColor = '#2196F3';
                break;
            case 'resource':
                badgeColor = '#FF9800';
                break;
        }

        contentElement.innerHTML = `
            <div class="content-type-badge" style="background-color: ${badgeColor};">
                ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </div>
            <div class="content-image">
                <img src="${item.image || '/src/assets/images/default-content.jpg'}" alt="${item.title}">
            </div>
            <div class="content-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="content-meta">
                    <span class="content-category">${item.category}</span>
                    <span class="content-date"><i class="fas fa-calendar"></i> ${item.date || '2023-06-15'}</span>
                    <span class="read-time"><i class="fas fa-clock"></i> ${item.readTime || '5 min'}</span>
                    <div class="content-stats">
                        <span><i class="fas fa-eye"></i> ${formatNumber(item.views || 0)}</span>
                        <span><i class="fas fa-heart"></i> ${formatNumber(item.likes || 0)}</span>
                    </div>
                </div>
            </div>
        `;

        if (contentContainer) contentContainer.appendChild(contentElement);
    });

    // Re-initialize click handlers
    initRecommendedContent();
}

/**
 * Load discovery data
 */
function loadDiscoveryData(searchQuery = '', filters: Filters = {}): void {
    // Show loading state
    showLoadingState();

    // Build query string
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);

    // Add filters if any are active
    if (filters.contentType) params.append('contentType', filters.contentType);
    if (filters.energyType) params.append('energyType', filters.energyType);

    // Fetch data with search parameters
    fetch(`${window.location.origin}/src/api/discovery?${params.toString()}`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load discovery data');
        }
        return response.json();
    })
    .then(data => {
        // Update content sections
        updateTrendingTopics(data.trendingTopics);
        updateFeaturedExperts(data.featuredExperts);
        updateRecommendedContent(data.recommendedContent);
    })
    .catch(error => {
        console.error('Error loading discovery data:', error);
        showNotificationDiscovery('Failed to load discovery content', 'error');
    })
    .finally(() => {
        hideLoadingState();
    });
}

/**
 * Show loading state
 */
function showLoadingState(): void {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'discovery-loading';
    loadingElement.className = 'loading-overlay';
    loadingElement.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading content...</p>
        </div>
    `;

    document.body.appendChild(loadingElement);
}

/**
 * Hide loading state
 */
function hideLoadingState(): void {
    const loadingElement = document.getElementById('discovery-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

/**
 * Format number with abbreviations
 * @param num - The number to format
 * @returns The formatted number
 */
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

/**
 * Show notification
 * @param message - The notification message
 * @param type - The notification type (info, success, warning, error)
 */
function showNotificationDiscovery(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    // Get notification container or create one if it doesn't exist
    let notificationContainer = document.querySelector('.notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification: HTMLElement = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIconDiscovery(type)}"></i>
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
    notification.querySelector('.notification-close')?.addEventListener('click', () => {
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
 * @param type - The notification type
 * @returns The icon class
 */
function getNotificationIconDiscovery(type: string): string {
    const icons: Record<string, string> = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
    };

    return icons[type] || icons.info!;
}
