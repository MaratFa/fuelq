/**
 * Discovery Component
 * Handles content discovery, filtering, and recommendations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize discovery
    initDiscovery();
});

/**
 * Initialize discovery functionality
 */
function initDiscovery() {
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
function initPersonalizedRecommendations() {
    const viewAllBtn = document.querySelector('.personalized-recommendations .view-all-btn');
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            // Navigate to full recommendations page
            window.location.href = '/src/pages/recommendations.html';
        });
    }
    
    // Add click handlers to recommendation cards
    const recommendationCards = document.querySelectorAll('.recommendation-card');
    recommendationCards.forEach(card => {
        card.addEventListener('click', () => {
            // Track recommendation click for future personalization
            trackRecommendationClick(card);
            
            // Navigate to content
            const title = card.querySelector('h3').textContent;
            navigateToContent(title);
        });
    });
}

/**
 * Track recommendation click for personalization
 * @param {HTMLElement} card - The clicked recommendation card
 */
function trackRecommendationClick(card) {
    const title = card.querySelector('h3').textContent;
    const category = card.querySelector('.recommendation-tag').textContent;
    
    // Store interaction in localStorage for personalization
    const interactions = JSON.parse(localStorage.getItem('fuelq_interactions') || '[]');
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
 * @param {string} title - The content title
 */
function navigateToContent(title) {
    // In a real implementation, this would navigate to the actual content
    // For now, we'll just show a notification
    showNotification(`Opening: ${title}`, 'info');
}

/**
 * Show notification message
 * @param {string} message - The message to show
 * @param {string} type - The type of notification (info, success, error)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.boxShadow = 'var(--card-shadow)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = 'var(--success-color)';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.backgroundColor = 'var(--error-color)';
            notification.style.color = 'white';
            break;
        default:
            notification.style.backgroundColor = 'var(--primary-color)';
            notification.style.color = 'white';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('discovery-search');
    const searchClear = document.getElementById('search-clear');
    const searchToggle = document.getElementById('search-toggle');
    
    if (!searchInput || !searchClear || !searchToggle) return;
    
    // Handle search input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        
        // Show/hide clear button
        searchClear.style.display = e.target.value ? 'block' : 'none';
        
        // Debounce search
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
    
    // Handle clear button
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        performSearch('');
    });
    
    // Handle advanced search toggle
    searchToggle.addEventListener('click', () => {
        const filters = document.querySelector('.discovery-filters');
        if (filters) {
            filters.classList.toggle('expanded');
            searchToggle.querySelector('span').textContent = 
                filters.classList.contains('expanded') ? 'Hide Filters' : 'Advanced Search';
        }
    });
}

/**
 * Perform search with the given query
 * @param {string} query - Search query
 */
function performSearch(query) {
    // Get active filters
    const activeFilters = getActiveFilters();
    
    // Load data with search query and filters
    loadDiscoveryData(query, activeFilters);
}

/**
 * Get active filter values
 * @returns {Object} Active filters
 */
function getActiveFilters() {
    const contentType = [];
    const energyType = [];
    
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
function resetContentDisplay() {
    const allItems = document.querySelectorAll('.trending-topic, .expert-card, .content-item');
    allItems.forEach(item => {
        item.style.display = '';
    });
}

/**
 * Initialize filters
 */
function initFilters() {
    // Content type filters
    const contentTypeFilters = document.querySelectorAll('.filter-option input[type="checkbox"]');
    contentTypeFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Energy type filters
    const energyTypeFilters = document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]');
    energyTypeFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Sort options
    const sortOptions = document.querySelectorAll('.radio-option input[type="radio"]');
    sortOptions.forEach(option => {
        option.addEventListener('change', applyFilters);
    });
}

/**
 * Apply filters to content
 */
function applyFilters() {
    // Get selected content types
    const contentTypeFilters = Array.from(
        document.querySelectorAll('.filter-group:first-child input[type="checkbox"]:checked')
    ).map(input => input.id.replace('filter-', ''));

    // Get selected energy types
    const energyTypeFilters = Array.from(
        document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]:checked')
    ).map(input => input.id.replace('filter-', ''));

    // Get selected sort option
    const sortOption = document.querySelector('.radio-option input[type="radio"]:checked').id.replace('sort-', '');

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
        showNotification('Failed to apply filters', 'error');
    })
    .finally(() => {
        hideLoadingState();
    });
}

/**
 * Initialize trending topics
 */
function initTrendingTopics() {
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
function initFeaturedExperts() {
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
            if (!e.target.closest('.follow-btn')) {
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
                toggleFollowExpert(expertId, followBtn);
            });
        }
    });
}

/**
 * Initialize recommended content
 */
function initRecommendedContent() {
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
 * @param {string} expertId - The expert ID
 * @param {HTMLElement} followBtn - The follow button element
 */
function toggleFollowExpert(expertId, followBtn) {
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
        showNotification(
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

        showNotification(
            `Failed to ${isFollowing ? 'unfollow' : 'follow'} expert`,
            'error'
        );
    });
}

/**
 * Refresh recommended content
 */
function refreshRecommendedContent() {
    const refreshBtn = document.querySelector('.recommended-content .refresh-btn');

    // Show loading state
    const originalHTML = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;

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
        showNotification('Recommendations refreshed', 'success');
    })
    .catch(error => {
        console.error('Error refreshing recommendations:', error);
        showNotification('Failed to refresh recommendations', 'error');
    })
    .finally(() => {
        // Reset button state
        refreshBtn.innerHTML = originalHTML;
        refreshBtn.disabled = false;
    });
}

/**
 * Update trending topics
 * @param {Array} topics - The trending topics
 */
function updateTrendingTopics(topics) {
    const topicsContainer = document.querySelector('.trending-topics');

    // Clear existing topics
    topicsContainer.innerHTML = '';

    // Add new topics
    topics.forEach(topic => {
        const topicElement = document.createElement('div');
        topicElement.className = 'trending-topic';
        topicElement.setAttribute('data-topic-id', topic.id);

        // Determine trend icon and color
        let trendIcon, trendColor;
        const trendValue = topic.trend ? topic.trend.replace('+', '').replace('%', '') : 0;
        if (trendValue > 0) {
            trendIcon = 'fa-arrow-up';
            trendColor = '#4CAF50';
        } else if (trendValue < 0) {
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
                <span>${Math.abs(trendValue)}%</span>
            </div>
        `;

        topicsContainer.appendChild(topicElement);
    });

    // Re-initialize click handlers
    initTrendingTopics();
}

/**
 * Update featured experts
 * @param {Array} experts - The featured experts
 */
function updateFeaturedExperts(experts) {
    const expertsContainer = document.querySelector('.experts-grid');

    // Clear existing experts
    expertsContainer.innerHTML = '';

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

        expertsContainer.appendChild(expertElement);
    });

    // Re-initialize click handlers
    initFeaturedExperts();
}

/**
 * Update recommended content
 * @param {Array} content - The recommended content
 */
function updateRecommendedContent(content) {
    const contentContainer = document.querySelector('.content-grid');

    // Clear existing content
    contentContainer.innerHTML = '';

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

        contentContainer.appendChild(contentElement);
    });

    // Re-initialize click handlers
    initRecommendedContent();
}

/**
 * Load discovery data
 */
function loadDiscoveryData(searchQuery = '', filters = {}) {
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
        showNotification('Failed to load discovery content', 'error');
    })
    .finally(() => {
        hideLoadingState();
    });
}

/**
 * Show loading state
 */
function showLoadingState() {
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
function hideLoadingState() {
    const loadingElement = document.getElementById('discovery-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

/**
 * Format number with abbreviations
 * @param {number} num - The number to format
 * @returns {string} The formatted number
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
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
