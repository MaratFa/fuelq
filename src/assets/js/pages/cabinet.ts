/**
 * Personal Cabinet Controller
 * Handles user profile management, posts, and saved resources
 */

import { BaseModule } from '../core/module-initializer.js';
import authModule from '../core/auth.js';
import { User, Thread, ContentItem, UserSettings } from '../../../../types/index';

class CabinetController extends BaseModule {
  userData: User | null = null;
  userPosts: Thread[] = [];
  savedResources: ContentItem[] = [];
  isEditingProfile: boolean = false;

  constructor() {
    super('cabinet', {
      dependencies: ['auth']
    });
  }

  /**
   * Initialize the cabinet controller
   */
  override onInit(): void {
    // Check if user is authenticated
    if (!authModule.isAuthenticated()) {
      window.location.href = '/src/pages/login.html';
      return;
    }

    // Get current user data
    this.userData = authModule.getCurrentUser() as User | null;

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
  initTabs(): void {
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
  initProfileSection(): void {
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    // Edit profile button
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.enableProfileEditing();
      });
    }

    // Save profile button
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveProfile();
      });
    }

    // Cancel editing button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.disableProfileEditing();
        this.loadUserData(); // Reload original data
      });
    }
  }

  /**
   * Initialize posts section
   */
  initPostsSection(): void {
    // This will be populated when posts are loaded
  }

  /**
   * Initialize saved resources section
   */
  initSavedSection(): void {
    // This will be populated when resources are loaded
  }

  /**
   * Initialize settings section
   */
  initSettingsSection(): void {
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    // Save settings button
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        this.saveSettings();
      });
    }

    // Change password button
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => {
        this.openModal('change-password-modal');
      });
    }

    // Delete account button
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', () => {
        this.openModal('delete-account-modal');
      });
    }
  }

  /**
   * Initialize modals
   */
  initModals(): void {
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountForm = document.getElementById('delete-account-form');

    // Change password form
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.changePassword();
      });
    }

    // Delete account form
    if (deleteAccountForm) {
      deleteAccountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.deleteAccount();
      });
    }

    // Close modal buttons
    document.querySelectorAll('.close, .cancel-btn').forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target instanceof HTMLElement && e.target.classList.contains('modal')) {
        this.closeModal(e.target.id);
      }
    });
  }

  /**
   * Load user data
   */
  async loadUserData(): Promise<void> {
    try {
      const response = await fetch('/api/user/profile', {
        headers: authModule.getAuthHeaders() as Record<string, string>
      });

      if (!response.ok) {
        throw new Error('Failed to load user data');
      }

      const userData: User = await response.json();
      this.updateProfileUI(userData);
    } catch (error) {
      this.handleError(error, 'loadUserData');
    }
  }

  /**
   * Update profile UI with user data
   */
  updateProfileUI(userData: User): void {
    // Update header info
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
      userNameEl.textContent = userData.username || 'User';
    }

    const userEmailEl = document.getElementById('user-email');
    if (userEmailEl) {
      userEmailEl.textContent = userData.email || '';
    }

    // Update profile form
    const firstNameEl = document.getElementById('first-name') as HTMLInputElement;
    if (firstNameEl) {
      firstNameEl.value = userData.firstName || '';
    }

    const lastNameEl = document.getElementById('last-name') as HTMLInputElement;
    if (lastNameEl) {
      lastNameEl.value = userData.lastName || '';
    }

    const bioEl = document.getElementById('bio') as HTMLTextAreaElement;
    if (bioEl) {
      bioEl.value = userData.bio || '';
    }

    const interestsEl = document.getElementById('interests') as HTMLInputElement;
    if (interestsEl) {
      interestsEl.value = userData.interests || '';
    }

    // Update settings
    const emailNotificationsEl = document.getElementById('email-notifications') as HTMLInputElement;
    if (emailNotificationsEl) {
      emailNotificationsEl.checked = userData.emailNotifications !== false;
    }

    const themePreferenceEl = document.getElementById('theme-preference') as HTMLSelectElement;
    if (themePreferenceEl) {
      themePreferenceEl.value = userData.themePreference || 'light';
    }

    const languageEl = document.getElementById('language') as HTMLSelectElement;
    if (languageEl) {
      languageEl.value = userData.language || 'en';
    }

    // Update avatar if available
    const avatarEl = document.getElementById('user-avatar-img') as HTMLImageElement;
    if (avatarEl && userData.avatar) {
      avatarEl.src = userData.avatar;
    }
  }

  /**
   * Enable profile editing
   */
  enableProfileEditing(): void {
    const profileInputs = document.querySelectorAll('#profile-tab input, #profile-tab textarea');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    profileInputs.forEach(input => {
      (input as HTMLInputElement | HTMLTextAreaElement).disabled = false;
    });

    if (saveBtn) {
      saveBtn.style.display = 'inline-block';
    }

    if (cancelBtn) {
      cancelBtn.style.display = 'inline-block';
    }

    this.isEditingProfile = true;
  }

  /**
   * Disable profile editing
   */
  disableProfileEditing(): void {
    const profileInputs = document.querySelectorAll('#profile-tab input, #profile-tab textarea');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    profileInputs.forEach(input => {
      (input as HTMLInputElement | HTMLTextAreaElement).disabled = true;
    });

    if (saveBtn) {
      saveBtn.style.display = 'none';
    }

    if (cancelBtn) {
      cancelBtn.style.display = 'none';
    }

    this.isEditingProfile = false;
  }

  /**
   * Save profile changes
   */
  async saveProfile(): Promise<void> {
    try {
      const firstNameEl = document.getElementById('first-name') as HTMLInputElement;
      const lastNameEl = document.getElementById('last-name') as HTMLInputElement;
      const bioEl = document.getElementById('bio') as HTMLTextAreaElement;
      const interestsEl = document.getElementById('interests') as HTMLInputElement;

      const profileData = {
        firstName: firstNameEl?.value || '',
        lastName: lastNameEl?.value || '',
        bio: bioEl?.value || '',
        interests: interestsEl?.value || ''
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authModule.getAuthHeaders() as Record<string, string>)
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData: User = await response.json();
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
  async loadUserPosts(): Promise<void> {
    try {
      const postsContainer = document.getElementById('user-posts');

      const response = await fetch('/api/user/posts', {
        headers: authModule.getAuthHeaders() as Record<string, string>
      });

      if (!response.ok) {
        throw new Error('Failed to load user posts');
      }

      const posts: Thread[] = await response.json();
      this.userPosts = posts;
      this.renderPosts(posts);
    } catch (error) {
      this.handleError(error, 'loadUserPosts');
      const postsContainer = document.getElementById('user-posts');
      if (postsContainer) {
        postsContainer.innerHTML = 
          '<p class="error-message">Failed to load posts. Please try again later.</p>';
      }
    }
  }

  /**
   * Render user posts
   */
  renderPosts(posts: Thread[]): void {
    const postsContainer = document.getElementById('user-posts');

    if (!postsContainer) return;

    if (posts.length === 0) {
      postsContainer.innerHTML = `<p>You haven't posted anything yet.</p>`;
      return;
    }

    const postsHTML = posts.map(post => `
      <div class="post-item">
        <h3 class="post-title">${post.title}</h3>
        <div class="post-meta">
          Posted on ${post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''} in ${post.category || ''}
        </div>
        <div class="post-excerpt">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</div>
        <div class="post-actions">
          <a href="/src/pages/forum/thread.html?id=${post.id}" class="btn btn-primary">View Thread</a>
          <button class="btn btn-secondary edit-post-btn" data-id="${post.id}">Edit</button>
        </div>
      </div>
    `).join('');

    postsContainer.innerHTML = postsHTML;

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-post-btn').forEach(button => {
      button.addEventListener('click', () => {
        const postId = button.getAttribute('data-id');
        if (postId) {
          this.editPost(postId);
        }
      });
    });
  }

  /**
   * Load saved resources
   */
  async loadSavedResources(): Promise<void> {
    try {
      const resourcesContainer = document.getElementById('saved-resources');

      const response = await fetch('/api/user/saved-resources', {
        headers: authModule.getAuthHeaders() as Record<string, string>
      });

      if (!response.ok) {
        throw new Error('Failed to load saved resources');
      }

      const resources: ContentItem[] = await response.json();
      this.savedResources = resources;
      this.renderResources(resources);
    } catch (error) {
      this.handleError(error, 'loadSavedResources');
      const resourcesContainer = document.getElementById('saved-resources');
      if (resourcesContainer) {
        resourcesContainer.innerHTML = 
          '<p class="error-message">Failed to load saved resources. Please try again later.</p>';
      }
    }
  }

  /**
   * Render saved resources
   */
  renderResources(resources: ContentItem[]): void {
    const resourcesContainer = document.getElementById('saved-resources');

    if (!resourcesContainer) return;

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
          <p class="resource-description">${(resource.description || '').substring(0, 150)}${(resource.description && resource.description.length > 150) ? '...' : ''}</p>
          <a href="${resource.url || '#'}" class="btn btn-primary" target="_blank">View Resource</a>
          <button class="btn btn-secondary remove-resource-btn" data-id="${resource.id}">Remove</button>
        </div>
      </div>
    `).join('');

    resourcesContainer.innerHTML = resourcesHTML;

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-resource-btn').forEach(button => {
      button.addEventListener('click', () => {
        const resourceId = button.getAttribute('data-id');
        if (resourceId) {
          this.removeResource(resourceId);
        }
      });
    });
  }

  /**
   * Save user settings
   */
  async saveSettings(): Promise<void> {
    try {
      const emailNotificationsEl = document.getElementById('email-notifications') as HTMLInputElement;
      const themePreferenceEl = document.getElementById('theme-preference') as HTMLSelectElement;
      const languageEl = document.getElementById('language') as HTMLSelectElement;

      const settingsData: UserSettings = {
        emailNotifications: emailNotificationsEl?.checked || false,
        themePreference: themePreferenceEl?.value || 'light',
        language: languageEl?.value || 'en'
      };

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authModule.getAuthHeaders() as Record<string, string>)
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
  async changePassword(): Promise<void> {
    try {
      const currentPasswordEl = document.getElementById('current-password') as HTMLInputElement;
      const newPasswordEl = document.getElementById('new-password') as HTMLInputElement;
      const confirmNewPasswordEl = document.getElementById('confirm-new-password') as HTMLInputElement;

      const currentPassword = currentPasswordEl?.value || '';
      const newPassword = newPasswordEl?.value || '';
      const confirmNewPassword = confirmNewPasswordEl?.value || '';

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
          ...(authModule.getAuthHeaders() as Record<string, string>)
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
      const changePasswordForm = document.getElementById('change-password-form');
      if (changePasswordForm) {
        (changePasswordForm as HTMLFormElement).reset();
      }
      this.showNotification('Password changed successfully', 'success');
    } catch (error) {
      this.handleError(error, 'changePassword');
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      const confirmationEl = document.getElementById('delete-confirmation') as HTMLInputElement;
      const confirmation = confirmationEl?.value || '';

      if (confirmation !== 'DELETE') {
        this.showNotification('Please type "DELETE" to confirm', 'error');
        return;
      }

      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: authModule.getAuthHeaders() as Record<string, string>
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
  editPost(postId: string): void {
    // Navigate to edit post page or open edit modal
    window.location.href = `/src/pages/forum/edit-post.html?id=${postId}`;
  }

  /**
   * Remove a saved resource
   */
  async removeResource(resourceId: string): Promise<void> {
    try {
      const response = await fetch(`/api/user/saved-resources/${resourceId}`, {
        method: 'DELETE',
        headers: authModule.getAuthHeaders() as Record<string, string>
      });

      if (!response.ok) {
        throw new Error('Failed to remove resource');
      }

      // Remove from local data and re-render
      this.savedResources = this.savedResources.filter(r => r.id.toString() !== resourceId);
      this.renderResources(this.savedResources);

      this.showNotification('Resource removed successfully', 'success');
    } catch (error) {
      this.handleError(error, 'removeResource');
    }
  }

  /**
   * Open a modal
   */
  openModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
  }

  /**
   * Close a modal
   */
  closeModal(modalId: string): void {
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

  /**
   * Show notification
   */
  override showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Implementation depends on your notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  /**
   * Handle errors
   */
  override handleError(error: any, context: string): void {
    console.error(`Error in ${context}:`, error);
    this.showNotification('An error occurred. Please try again.', 'error');
  }
}

// Create and initialize the cabinet controller
const cabinetController = new CabinetController();

export default cabinetController;
