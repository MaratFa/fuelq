/**
 * Personal Cabinet Controller
 * Handles user profile management, posts, and saved resources
 */

import { BaseModule } from '../core/module-initializer.js';
import authModule from '../core/auth.js';

class CabinetController extends BaseModule {
  constructor() {
    super('cabinet', {
      dependencies: ['auth']
    });

    this.userData = null;
    this.userPosts = [];
    this.savedResources = [];
    this.isEditingProfile = false;
  }

  /**
   * Initialize the cabinet controller
   */
  onInit() {
    // Check if user is authenticated
    if (!authModule.isAuthenticated()) {
      window.location.href = '/src/pages/login.html';
      return;
    }

    // Get current user data
    this.userData = authModule.getCurrentUser();

    // Initialize UI components
    this.initTabs();
    this.initProfileSection();
    this.initPostsSection();
    this.initSavedSection();
    this.initSettingsSection();
    this.initModals();

    // Load user data
    this.loadUserData();
    this.loadUserPosts();
    this.loadSavedResources();
  }

  /**
   * Initialize tab navigation
   */
  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');

        // Update active button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update active content
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
          }
        });
      });
    });
  }

  /**
   * Initialize profile section
   */
  initProfileSection() {
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const profileInputs = document.querySelectorAll('#profile-tab input, #profile-tab textarea');

    // Edit profile button
    editBtn.addEventListener('click', () => {
      this.enableProfileEditing();
    });

    // Save profile button
    saveBtn.addEventListener('click', () => {
      this.saveProfile();
    });

    // Cancel editing button
    cancelBtn.addEventListener('click', () => {
      this.disableProfileEditing();
      this.loadUserData(); // Reload original data
    });
  }

  /**
   * Initialize posts section
   */
  initPostsSection() {
    // This will be populated when posts are loaded
  }

  /**
   * Initialize saved resources section
   */
  initSavedSection() {
    // This will be populated when resources are loaded
  }

  /**
   * Initialize settings section
   */
  initSettingsSection() {
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    // Save settings button
    saveSettingsBtn.addEventListener('click', () => {
      this.saveSettings();
    });

    // Change password button
    changePasswordBtn.addEventListener('click', () => {
      this.openModal('change-password-modal');
    });

    // Delete account button
    deleteAccountBtn.addEventListener('click', () => {
      this.openModal('delete-account-modal');
    });
  }

  /**
   * Initialize modals
   */
  initModals() {
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountForm = document.getElementById('delete-account-form');

    // Change password form
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.changePassword();
    });

    // Delete account form
    deleteAccountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.deleteAccount();
    });

    // Close modal buttons
    document.querySelectorAll('.close, .cancel-btn').forEach(button => {
      button.addEventListener('click', () => {
        this.closeModal(button.closest('.modal').id);
      });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target.id);
      }
    });
  }

  /**
   * Load user data
   */
  async loadUserData() {
    try {
      const response = await fetch('/api/user/profile', {
        headers: authModule.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to load user data');
      }

      const userData = await response.json();
      this.updateProfileUI(userData);
    } catch (error) {
      this.handleError(error, 'loadUserData');
    }
  }

  /**
   * Update profile UI with user data
   */
  updateProfileUI(userData) {
    // Update header info
    document.getElementById('user-name').textContent = userData.username || 'User';
    document.getElementById('user-email').textContent = userData.email || '';

    // Update profile form
    document.getElementById('first-name').value = userData.firstName || '';
    document.getElementById('last-name').value = userData.lastName || '';
    document.getElementById('bio').value = userData.bio || '';
    document.getElementById('interests').value = userData.interests || '';

    // Update settings
    document.getElementById('email-notifications').checked = userData.emailNotifications !== false;
    document.getElementById('theme-preference').value = userData.themePreference || 'light';
    document.getElementById('language').value = userData.language || 'en';

    // Update avatar if available
    if (userData.avatar) {
      document.getElementById('user-avatar-img').src = userData.avatar;
    }
  }

  /**
   * Enable profile editing
   */
  enableProfileEditing() {
    const profileInputs = document.querySelectorAll('#profile-tab input, #profile-tab textarea');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    profileInputs.forEach(input => {
      input.disabled = false;
    });

    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';

    this.isEditingProfile = true;
  }

  /**
   * Disable profile editing
   */
  disableProfileEditing() {
    const profileInputs = document.querySelectorAll('#profile-tab input, #profile-tab textarea');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    profileInputs.forEach(input => {
      input.disabled = true;
    });

    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    this.isEditingProfile = false;
  }

  /**
   * Save profile changes
   */
  async saveProfile() {
    try {
      const profileData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        bio: document.getElementById('bio').value,
        interests: document.getElementById('interests').value
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authModule.getAuthHeaders()
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      this.updateProfileUI(updatedData);
      this.disableProfileEditing();
      this.showNotification('Profile updated successfully', 'success');
    } catch (error) {
      this.handleError(error, 'saveProfile');
    }
  }

  /**
   * Load user posts
   */
  async loadUserPosts() {
    try {
      const postsContainer = document.getElementById('user-posts');

      const response = await fetch('/api/user/posts', {
        headers: authModule.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to load user posts');
      }

      const posts = await response.json();
      this.userPosts = posts;
      this.renderPosts(posts);
    } catch (error) {
      this.handleError(error, 'loadUserPosts');
      document.getElementById('user-posts').innerHTML = 
        '<p class="error-message">Failed to load posts. Please try again later.</p>';
    }
  }

  /**
   * Render user posts
   */
  renderPosts(posts) {
    const postsContainer = document.getElementById('user-posts');

    if (posts.length === 0) {
      postsContainer.innerHTML = `<p>You haven't posted anything yet.</p>`;
      return;
    }

    const postsHTML = posts.map(post => `
      <div class="post-item">
        <h3 class="post-title">${post.title}</h3>
        <div class="post-meta">
          Posted on ${new Date(post.createdAt).toLocaleDateString()} in ${post.category}
        </div>
        <div class="post-excerpt">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</div>
        <div class="post-actions">
          <a href="/src/pages/forum/thread.html?id=${post.threadId}" class="btn btn-primary">View Thread</a>
          <button class="btn btn-secondary edit-post-btn" data-id="${post.id}">Edit</button>
        </div>
      </div>
    `).join('');

    postsContainer.innerHTML = postsHTML;

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-post-btn').forEach(button => {
      button.addEventListener('click', () => {
        const postId = button.getAttribute('data-id');
        this.editPost(postId);
      });
    });
  }

  /**
   * Load saved resources
   */
  async loadSavedResources() {
    try {
      const resourcesContainer = document.getElementById('saved-resources');

      const response = await fetch('/api/user/saved-resources', {
        headers: authModule.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to load saved resources');
      }

      const resources = await response.json();
      this.savedResources = resources;
      this.renderResources(resources);
    } catch (error) {
      this.handleError(error, 'loadSavedResources');
      document.getElementById('saved-resources').innerHTML = 
        '<p class="error-message">Failed to load saved resources. Please try again later.</p>';
    }
  }

  /**
   * Render saved resources
   */
  renderResources(resources) {
    const resourcesContainer = document.getElementById('saved-resources');

    if (resources.length === 0) {
      resourcesContainer.innerHTML = `<p>You haven't saved any resources yet.</p>`;
      return;
    }

    const resourcesHTML = resources.map(resource => `
      <div class="resource-card">
        <div class="resource-image">
          <img src="${resource.image || '/src/assets/images/default-resource.png'}" alt="${resource.title}">
        </div>
        <div class="resource-content">
          <h3 class="resource-title">${resource.title}</h3>
          <p class="resource-description">${resource.description.substring(0, 150)}${resource.description.length > 150 ? '...' : ''}</p>
          <a href="${resource.url}" class="btn btn-primary" target="_blank">View Resource</a>
          <button class="btn btn-secondary remove-resource-btn" data-id="${resource.id}">Remove</button>
        </div>
      </div>
    `).join('');

    resourcesContainer.innerHTML = resourcesHTML;

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-resource-btn').forEach(button => {
      button.addEventListener('click', () => {
        const resourceId = button.getAttribute('data-id');
        this.removeResource(resourceId);
      });
    });
  }

  /**
   * Save user settings
   */
  async saveSettings() {
    try {
      const settingsData = {
        emailNotifications: document.getElementById('email-notifications').checked,
        themePreference: document.getElementById('theme-preference').value,
        language: document.getElementById('language').value
      };
      
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authModule.getAuthHeaders()
        },
        body: JSON.stringify(settingsData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      this.showNotification('Settings updated successfully', 'success');
    } catch (error) {
      this.handleError(error, 'saveSettings');
    }
  }

  /**
   * Change password
   */
  async changePassword() {
    try {
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmNewPassword = document.getElementById('confirm-new-password').value;
      
      // Validate passwords
      if (newPassword !== confirmNewPassword) {
        this.showNotification('New passwords do not match', 'error');
        return;
      }
      
      if (newPassword.length < 8) {
        this.showNotification('Password must be at least 8 characters', 'error');
        return;
      }
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authModule.getAuthHeaders()
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      this.closeModal('change-password-modal');
      document.getElementById('change-password-form').reset();
      this.showNotification('Password changed successfully', 'success');
    } catch (error) {
      this.handleError(error, 'changePassword');
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount() {
    try {
      const confirmation = document.getElementById('delete-confirmation').value;
      
      if (confirmation !== 'DELETE') {
        this.showNotification('Please type "DELETE" to confirm', 'error');
        return;
      }
      
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: authModule.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      this.showNotification('Account deleted successfully', 'success');
      
      // Logout and redirect to home
      setTimeout(() => {
        authModule.logout('Account deleted');
      }, 2000);
    } catch (error) {
      this.handleError(error, 'deleteAccount');
    }
  }

  /**
   * Edit a post
   */
  editPost(postId) {
    // Navigate to edit post page or open edit modal
    window.location.href = `/src/pages/forum/edit-post.html?id=${postId}`;
  }

  /**
   * Remove a saved resource
   */
  async removeResource(resourceId) {
    try {
      const response = await fetch(`/api/user/saved-resources/${resourceId}`, {
        method: 'DELETE',
        headers: authModule.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove resource');
      }
      
      // Remove from local data and re-render
      this.savedResources = this.savedResources.filter(r => r.id !== resourceId);
      this.renderResources(this.savedResources);
      
      this.showNotification('Resource removed successfully', 'success');
    } catch (error) {
      this.handleError(error, 'removeResource');
    }
  }

  /**
   * Open a modal
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
  }

  /**
   * Close a modal
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      
      // Reset form if present
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
      }
    }
  }
}

// Create and initialize the cabinet controller
const cabinetController = new CabinetController();

export default cabinetController;
