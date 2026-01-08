/**
 * Authentication Module
 * Handles user authentication, session management, and authorization
 */

import { BaseModule } from './module-initializer.js';
import { Validator, commonSchemas } from '../utils/validation.js';

class AuthModule extends BaseModule {
  constructor() {
    super('auth', {
      dependencies: ['api']
    });

    // Authentication state
    this.currentUser = null;
    this.sessionTimeout = null;
    this.sessionDuration = 60 * 60 * 1000; // 1 hour in ms

    // Initialize from storage
    this.initFromStorage();
  }

  /**
   * Initialize authentication
   */
  onInit() {
    // Set up session timeout check
    this.setupSessionTimeout();

    // Listen for authentication events
    this.setupEventListeners();

    // Check for expired session
    this.checkSessionStatus();
  }

  /**
   * Initialize from local storage
   */
  initFromStorage() {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('current_user');

      if (token && user) {
        this.currentUser = JSON.parse(user);
        this.emitEvent('auth:login', { user: this.currentUser });
      }
    } catch (error) {
      this.handleError(error, 'initFromStorage');
    }
  }

  /**
   * Set up session timeout
   */
  setupSessionTimeout() {
    // Clear any existing timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    // Set new timeout
    this.sessionTimeout = setTimeout(() => {
      this.logout('Session expired');
    }, this.sessionDuration);
  }

  /**
   * Check session status
   */
  checkSessionStatus() {
    if (this.currentUser) {
      // Verify token with server
      this.verifyToken()
        .then(valid => {
          if (!valid) {
            this.logout('Invalid session');
          }
        })
        .catch(error => {
          this.handleError(error, 'checkSessionStatus');
        });
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Refresh session on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      this.safeAddEventListener('document', event, () => {
        if (this.currentUser) {
          this.setupSessionTimeout();
        }
      });
    });
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Registration result
   */
  async register(userData) {
    try {
      // Validate input
      const validator = new Validator();
      const isValid = validator.validateFields(userData, commonSchemas.userRegistration);

      if (!isValid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validator.getErrors()
        };
      }

      // Make API request
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification('Registration successful! Please log in.', 'success');
        return data;
      } else {
        this.showNotification(data.message || 'Registration failed', 'error');
        return data;
      }
    } catch (error) {
      this.handleError(error, 'register');
      return {
        success: false,
        message: 'An error occurred during registration'
      };
    }
  }

  /**
   * Log in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login result
   */
  async login(email, password) {
    try {
      // Validate input
      const validator = new Validator();
      const isValid = validator.validateFields(
        { email, password },
        {
          email: { required: true, email: true },
          password: { required: true }
        }
      );

      if (!isValid) {
        return {
          success: false,
          message: 'Please enter a valid email and password',
          errors: validator.getErrors()
        };
      }

      // Make API request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Store auth data
        this.setAuthData(data.user, data.token);

        // Set up session
        this.setupSessionTimeout();

        // Emit login event
        this.emitEvent('auth:login', { user: data.user });

        this.showNotification('Login successful!', 'success');
        return data;
      } else {
        this.showNotification(data.message || 'Login failed', 'error');
        return data;
      }
    } catch (error) {
      this.handleError(error, 'login');
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  /**
   * Log out the current user
   * @param {string} reason - Reason for logout
   */
  logout(reason = 'User logout') {
    try {
      // Clear session timeout
      if (this.sessionTimeout) {
        clearTimeout(this.sessionTimeout);
      }

      // Make API request if we have a token
      if (this.currentUser) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }).catch(error => {
          // Ignore errors on logout
          console.warn('Error during logout API call:', error);
        });
      }

      // Clear auth data
      this.clearAuthData();

      // Emit logout event
      this.emitEvent('auth:logout', { reason });

      // Show notification
      this.showNotification(reason, 'info');

      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/src/pages/login.html';
      }, 1000);
    } catch (error) {
      this.handleError(error, 'logout');
    }
  }

  /**
   * Verify current token with server
   * @returns {Promise<boolean>} True if token is valid
   */
  async verifyToken() {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      this.handleError(error, 'verifyToken');
      return false;
    }
  }

  /**
   * Set authentication data
   * @param {Object} user - User data
   * @param {string} token - Authentication token
   */
  setAuthData(user, token) {
    try {
      this.currentUser = user;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
    } catch (error) {
      this.handleError(error, 'setAuthData');
    }
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    try {
      this.currentUser = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    } catch (error) {
      this.handleError(error, 'clearAuthData');
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Get current user
   * @returns {Object|null} Current user or null
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if current user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has role
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.roles && this.currentUser.roles.includes(role);
  }

  /**
   * Get authorization header for API requests
   * @returns {Object} Headers object with authorization
   */
  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Create and export singleton instance
const authModule = new AuthModule();
export default authModule;
