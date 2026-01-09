/**
 * Theme Manager
 * Handles theme switching between light and dark modes
 */

import stateManager from '../core/state-manager.js';
import { getCSSVariable, setCSSVariable } from '../utils/helpers.js';

interface Theme {
  name: string;
  icon: string;
  variables?: Record<string, string>;
}

interface ThemeConfig {
  name?: string;
  icon?: string;
  variables?: Record<string, string>;
}

interface ThemeManagerConfig {
  showToggle?: boolean;
  [key: string]: any;
}

class ThemeManager {
  private name: string;
  private themes: Record<string, Theme>;
  private currentTheme: string;
  private initialized: boolean;

  constructor() {
    this.name = 'themeManager';
    this.themes = {
      light: {
        name: 'Light',
        icon: 'fas fa-sun'
      },
      dark: {
        name: 'Dark',
        icon: 'fas fa-moon'
      }
    };
    this.currentTheme = 'light';
    this.initialized = false;
  }

  /**
   * Initialize the theme manager
   * @param config - Configuration object
   */
  init(config: ThemeManagerConfig = {}): void {
    if (this.initialized) return;

    // Get saved theme from state manager or use system preference
    this.currentTheme = stateManager.get('theme', this.getSystemTheme());

    // Apply the current theme
    this.applyTheme(this.currentTheme);

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e: MediaQueryListEvent) => {
        // Only change theme if user hasn't explicitly set one
        if (!stateManager.get('theme')) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          this.applyTheme(this.currentTheme);
        }
      });
    }

    // Create theme toggle button if enabled
    if (config.showToggle !== false) {
      this.createThemeToggle();
    }

    this.initialized = true;
    console.log('Theme manager initialized');
  }

  /**
   * Get system theme preference
   * @returns System theme preference
   */
  getSystemTheme(): string {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Apply a theme
   * @param theme - Theme name
   */
  applyTheme(theme: string): void {
    if (!this.themes[theme]) return;

    // Update data attribute on body
    document.body.setAttribute('data-theme', theme);

    // Update CSS variables
    this.updateCSSVariables(theme);

    // Update theme toggle button if it exists
    this.updateThemeToggle(theme);

    // Save to state manager
    stateManager.set('theme', theme);

    // Dispatch theme change event
    this.dispatchThemeChangeEvent(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  /**
   * Update CSS variables for a theme
   * @param theme - Theme name
   */
  updateCSSVariables(theme: string): void {
    if (theme === 'dark') {
      setCSSVariable('bg-color', '#121212');
      setCSSVariable('text-color', '#ffffff');
      setCSSVariable('card-bg', '#1e1e1e');
      setCSSVariable('border-color', '#333333');
      setCSSVariable('primary-color', '#6a89cc');
      setCSSVariable('secondary-color', '#82ccdd');
    } else {
      setCSSVariable('bg-color', '#ffffff');
      setCSSVariable('text-color', '#333333');
      setCSSVariable('card-bg', '#f8f9fa');
      setCSSVariable('border-color', '#e9ecef');
      setCSSVariable('primary-color', '#3498db');
      setCSSVariable('secondary-color', '#2ecc71');
    }
  }

  /**
   * Create theme toggle button
   */
  createThemeToggle(): void {
    // Check if button already exists
    if (document.getElementById('theme-toggle')) return;

    // Create button element
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle theme');

    // Set initial icon
    const icon = document.createElement('i');
    if (this.currentTheme && this.themes[this.currentTheme]) {
      const theme = this.themes[this.currentTheme];
      if (theme && theme.icon) {
        icon.className = theme.icon;
      }
    }
    button.appendChild(icon);

    // Add click handler
    button.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Add to header
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(button);
    }
  }

  /**
   * Update theme toggle button
   * @param theme - Current theme
   */
  updateThemeToggle(theme: string): void {
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    const icon = button.querySelector('i');
    if (icon) {
      const themeObj = this.themes[theme];
      if (themeObj && themeObj.icon) {
        icon.className = themeObj.icon;
      }
    }
  }

  /**
   * Dispatch theme change event
   * @param theme - New theme
   */
  dispatchThemeChangeEvent(theme: string): void {
    const event = new CustomEvent('themechange', {
      detail: { theme }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get current theme
   * @returns Current theme
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * Add a custom theme
   * @param name - Theme name
   * @param config - Theme configuration
   */
  addTheme(name: string, config: ThemeConfig): void {
    this.themes[name] = {
      name: config.name || name,
      icon: config.icon || 'fas fa-palette',
      variables: config.variables || {}
    };
  }

  /**
   * Apply custom theme variables
   * @param variables - CSS variables to apply
   */
  applyCustomVariables(variables: Record<string, string>): void {
    Object.keys(variables).forEach(key => {
      if (variables[key]) {
        setCSSVariable(key, variables[key]);
      }
    });
  }
}

// Export as singleton
export default new ThemeManager();
