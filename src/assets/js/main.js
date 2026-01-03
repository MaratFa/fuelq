/**
 * Main Application JavaScript
 * Initializes the application and loads required modules
 */

// Import required modules
import { initComponents } from './components.js';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Application starting...');

  // Initialize components
  initComponents();

  console.log('Application initialized');
});
