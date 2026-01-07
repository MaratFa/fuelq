/**
 * User Profile Component
 * Handles user profile functionality including avatar upload, tab switching, and settings
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize user profile
    initUserProfile();
});

/**
 * Initialize user profile functionality
 */
function initUserProfile() {
    // Initialize tab switching
    initTabSwitching();

    // Initialize avatar upload
    initAvatarUpload();

    // Initialize settings form
    initSettingsForm();

    // Initialize expertise tags
    initExpertiseTags();

    // Load user data
    loadUserData();
}

/**
 * Initialize tab switching functionality
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the target tab
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to the clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

/**
 * Initialize avatar upload functionality
 */
function initAvatarUpload() {
    const avatarUpload = document.getElementById('avatar-upload');
    const userAvatar = document.getElementById('user-avatar');

    if (avatarUpload && userAvatar) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];

            if (file) {
                // Validate file type
                if (!file.type.match('image.*')) {
                    showNotification('Please select an image file', 'error');
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('Image size should be less than 5MB', 'error');
                    return;
                }

                // Read and display the image
                const reader = new FileReader();

                reader.onload = (event) => {
                    userAvatar.src = event.target.result;

                    // Upload avatar to server
                    uploadAvatar(file);
                };

                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * Upload avatar to server
 * @param {File} file - The image file to upload
 */
function uploadAvatar(file) {
    // Show loading state
    showNotification('Uploading avatar...', 'info');

    // Create form data
    const formData = new FormData();
    formData.append('avatar', file);

    // Send to server
    fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to upload avatar');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Avatar updated successfully', 'success');
    })
    .catch(error => {
        console.error('Error uploading avatar:', error);
        showNotification('Failed to upload avatar', 'error');
    });
}

/**
 * Initialize settings form
 */
function initSettingsForm() {
    const settingsForm = document.querySelector('.settings-form');

    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form data
            const formData = new FormData(settingsForm);
            const data = {};

            // Convert FormData to plain object
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }

            // Show loading state
            const saveButton = document.querySelector('.save-settings-btn');
            const originalText = saveButton.innerHTML;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveButton.disabled = true;

            // Send to server
            fetch('/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save settings');
                }
                return response.json();
            })
            .then(result => {
                showNotification('Settings saved successfully', 'success');
            })
            .catch(error => {
                console.error('Error saving settings:', error);
                showNotification('Failed to save settings', 'error');
            })
            .finally(() => {
                // Reset button state
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
            });
        });
    }
}

/**
 * Initialize expertise tags
 */
function initExpertiseTags() {
    const addExpertiseBtn = document.querySelector('.add-expertise-btn');

    if (addExpertiseBtn) {
        addExpertiseBtn.addEventListener('click', () => {
            // Create input for new expertise
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'expertise-input';
            input.placeholder = 'Enter expertise area';

            // Insert before the add button
            addExpertiseBtn.parentNode.insertBefore(input, addExpertiseBtn);

            // Focus the input
            input.focus();

            // Handle input events
            input.addEventListener('blur', () => {
                const value = input.value.trim();

                if (value) {
                    // Create new expertise tag
                    const tag = document.createElement('span');
                    tag.className = 'expertise-tag';
                    tag.textContent = value;

                    // Insert before the add button
                    addExpertiseBtn.parentNode.insertBefore(tag, addExpertiseBtn);

                    // Save to server
                    saveExpertiseTag(value);
                }

                // Remove the input
                input.remove();
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.blur();
                }
            });
        });
    }
}

/**
 * Save expertise tag to server
 * @param {string} tag - The expertise tag to save
 */
function saveExpertiseTag(tag) {
    fetch('/api/user/expertise', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tag }),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save expertise tag');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Expertise added successfully', 'success');
    })
    .catch(error => {
        console.error('Error saving expertise tag:', error);
        showNotification('Failed to save expertise tag', 'error');
    });
}

/**
 * Load user data
 */
function loadUserData() {
    fetch('/api/user/profile', {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load user data');
        }
        return response.json();
    })
    .then(user => {
        // Update UI with user data
        updateProfileUI(user);
    })
    .catch(error => {
        console.error('Error loading user data:', error);
        showNotification('Failed to load user profile', 'error');
    });
}

/**
 * Update profile UI with user data
 * @param {Object} user - The user data
 */
function updateProfileUI(user) {
    // Update user name
    const userName = document.getElementById('user-name');
    if (userName && user.name) {
        userName.textContent = user.name;
    }

    // Update user avatar
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar && user.avatar) {
        userAvatar.src = user.avatar;
    }

    // Update user title
    const userTitle = document.querySelector('.user-title');
    if (userTitle && user.title) {
        userTitle.textContent = user.title;
    }

    // Update user stats
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4 && user.stats) {
        statValues[0].textContent = user.stats.posts || 0;
        statValues[1].textContent = user.stats.reputation || 0;
        statValues[2].textContent = user.stats.bestAnswers || 0;
        statValues[3].textContent = user.stats.badges || 0;
    }

    // Update expertise tags
    const expertiseTagsContainer = document.querySelector('.expertise-tags');
    if (expertiseTagsContainer && user.expertise && user.expertise.length > 0) {
        // Clear existing tags (except the add button)
        const existingTags = expertiseTagsContainer.querySelectorAll('.expertise-tag');
        existingTags.forEach(tag => tag.remove());

        // Add user expertise tags
        user.expertise.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'expertise-tag';
            tagElement.textContent = tag;

            // Insert before the add button
            const addBtn = expertiseTagsContainer.querySelector('.add-expertise-btn');
            expertiseTagsContainer.insertBefore(tagElement, addBtn);
        });
    }

    // Update profile completion
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    if (progressFill && progressText && user.profileCompletion) {
        const completion = user.profileCompletion;
        progressFill.style.width = `${completion}%`;
        progressText.textContent = `${completion}%`;

        // Update completion items
        const completionItems = document.querySelectorAll('.completion-items li');
        if (completionItems.length > 0 && user.completionItems) {
            completionItems.forEach((item, index) => {
                if (user.completionItems[index]) {
                    if (user.completionItems[index].completed) {
                        item.classList.add('completed');
                        item.querySelector('i').className = 'fas fa-check-circle';
                    } else {
                        item.classList.remove('completed');
                        item.querySelector('i').className = 'fas fa-circle';
                    }
                }
            });
        }
    }
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

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Get icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'times-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        default:
            icon = 'info-circle';
    }

    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to container
    notificationContainer.appendChild(notification);

    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);

    // Show animation
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
}
