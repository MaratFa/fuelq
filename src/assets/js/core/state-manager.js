/**
 * State Manager
 * Centralized state management for the application
 */

class StateManager {
  constructor() {
    this.name = 'stateManager';
    this.state = {};
    this.subscribers = new Map();
    this.history = [];
    this.maxHistorySize = 50;
    this.initialized = false;
  }

  /**
   * Initialize the state manager
   * @param {Object} config - Configuration object
   */
  init(config = {}) {
    if (this.initialized) return;

    // Load initial state from localStorage if available
    this.loadFromStorage();

    // Setup periodic saving to localStorage
    if (config.persistState !== false) {
      this.setupPersistence();
    }

    this.initialized = true;
    console.log('State manager initialized');
  }

  /**
   * Get a value from the state
   * @param {string} key - State key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} State value
   */
  get(key, defaultValue = null) {
    return this.state.hasOwnProperty(key) ? this.state[key] : defaultValue;
  }

  /**
   * Set a value in the state
   * @param {string} key - State key
   * @param {*} value - New value
   * @param {boolean} notify - Whether to notify subscribers
   */
  set(key, value, notify = true) {
    // Save previous state to history
    this.saveToHistory(key, this.state[key]);

    // Update state
    this.state[key] = value;

    // Notify subscribers if requested
    if (notify) {
      this.notifySubscribers(key, value);
    }
  }

  /**
   * Update multiple values in the state
   * @param {Object} updates - Object with key-value pairs
   * @param {boolean} notify - Whether to notify subscribers
   */
  setMultiple(updates, notify = true) {
    // Save previous state to history
    Object.keys(updates).forEach(key => {
      this.saveToHistory(key, this.state[key]);
    });

    // Update state
    Object.assign(this.state, updates);

    // Notify subscribers if requested
    if (notify) {
      Object.keys(updates).forEach(key => {
        this.notifySubscribers(key, updates[key]);
      });
    }
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to subscribe to
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Notify all subscribers of a state change
   * @param {string} key - State key that changed
   * @param {*} value - New value
   */
  notifySubscribers(key, value) {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(value, key);
        } catch (error) {
          console.error(`Error in state subscriber for key "${key}":`, error);
        }
      });
    }
  }

  /**
   * Save state change to history
   * @param {string} key - State key
   * @param {*} value - Previous value
   */
  saveToHistory(key, value) {
    this.history.push({
      key,
      value,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get state history for a key
   * @param {string} key - State key
   * @returns {Array} History of changes
   */
  getHistory(key) {
    return this.history.filter(entry => entry.key === key);
  }

  /**
   * Setup periodic saving to localStorage
   */
  setupPersistence() {
    // Save state to localStorage every 30 seconds
    setInterval(() => {
      this.saveToStorage();
    }, 30000);

    // Save state before page unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  /**
   * Save state to localStorage
   */
  saveToStorage() {
    try {
      const serializedState = JSON.stringify(this.state);
      localStorage.setItem('fuelq-state', serializedState);
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  loadFromStorage() {
    try {
      const serializedState = localStorage.getItem('fuelq-state');
      if (serializedState) {
        this.state = JSON.parse(serializedState);
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
  }

  /**
   * Clear all state
   */
  clear() {
    this.state = {};
    this.history = [];
    this.subscribers.clear();

    // Clear localStorage
    localStorage.removeItem('fuelq-state');
  }

  /**
   * Export state as JSON
   * @returns {string} Serialized state
   */
  exportState() {
    return JSON.stringify({
      state: this.state,
      history: this.history
    });
  }

  /**
   * Import state from JSON
   * @param {string} serializedState - Serialized state
   */
  importState(serializedState) {
    try {
      const data = JSON.parse(serializedState);

      if (data.state) {
        this.state = data.state;
      }

      if (data.history) {
        this.history = data.history;
      }

      // Notify all subscribers
      Object.keys(this.state).forEach(key => {
        this.notifySubscribers(key, this.state[key]);
      });
    } catch (error) {
      console.error('Failed to import state:', error);
    }
  }
}

// Export as singleton
export default new StateManager();
