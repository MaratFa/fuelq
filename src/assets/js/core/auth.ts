
/**
 * Authentication Module
 * Handles user authentication, session management, and authorization
 */

import { BaseModule } from './module-initializer.js';
import { Validator, commonSchemas } from '../utils/validation.js';

// Define interfaces for type safety
interface User {
  id: number;
  email: string;
  name: string;
  roles?: string[];
  [key: string]: any;
}

interface RegistrationData {
  email: string;
  password: string;
  name: string;
  [key: string]: any;
}

interface LoginResult {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  errors?: string[];
}

interface RegistrationResult {
  success: boolean;
  message?: string;
  errors?: string[];
}

class AuthModule extends BaseModule {
  private currentUser: User | null;
  private sessionTimeout: number | null;
  private readonly sessionDuration: number; // 1 hour in ms

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
  override onInit(): void {
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
  private initFromStorage(): void {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('current_user');

      if (token && user) {
        this.currentUser = JSON.parse(user);
        this.emitEvent('auth:login', { user: this.currentUser });
      }
    } catch (error) {
      this.handleError(error as Error, 'initFromStorage');
    }
  }

  /**
   * Set up session timeout
   */
  private setupSessionTimeout(): void {
    // Clear any existing timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    // Set new timeout
    this.sessionTimeout = window.setTimeout(() => {
      this.logout('Session expired');
    }, this.sessionDuration);
  }

  /**
   * Check session status
   */
  private checkSessionStatus(): void {
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
  private setupEventListeners(): void {
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
  async register(userData: RegistrationData): Promise<RegistrationResult> {
    try {
      // Validate input
      const validator = new Validator();
      const isValid = validator.validateFields(userData, commonSchemas.userRegistration);

      if (!isValid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: Object.values(validator.getErrors()).flat()
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
      this.handleError(error as Error, 'register');
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
  async login(email: string, password: string): Promise<LoginResult> {
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
          errors: Object.values(validator.getErrors()).flat()
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
      this.handleError(error as Error, 'login');
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  /**
   * Log out current user
   * @param {string} reason - Reason for logout
   */
  logout(reason = 'User logout'): void {
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
      this.handleError(error as Error, 'logout');
    }
  }

  /**
   * Verify current token with server
   * @returns {Promise<boolean>} True if token is valid
   */
  async verifyToken(): Promise<boolean> {
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
      this.handleError(error as Error, 'verifyToken');
      return false;
    }
  }

  /**
   * Set authentication data
   * @param {Object} user - User data
   * @param {string} token - Authentication token
   */
  private setAuthData(user: User, token: string): void {
    try {
      this.currentUser = user;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
    } catch (error) {
      this.handleError(error as Error, 'setAuthData');
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    try {
      this.currentUser = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    } catch (error) {
      this.handleError(error as Error, 'clearAuthData');
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get current user
   * @returns {Object|null} Current user or null
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if current user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has role
   */
  hasRole(role: string): boolean {
    return !!(this.currentUser && 
               this.currentUser.roles && 
               this.currentUser.roles.includes(role));
  }

  /**
   * Get authorization header for API requests
   * @returns {Object} Headers object with authorization
   */
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Create and export singleton instance
const authModule = new AuthModule();
export default authModule;
