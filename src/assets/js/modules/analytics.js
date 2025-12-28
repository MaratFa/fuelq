/**
 * Analytics Module
 * Handles tracking user interactions and page views
 */

export class Analytics {
  constructor() {
    this.trackingEnabled = true;
    this.events = [];
  }

  /**
   * Initialize the analytics module
   */
  init() {
    // In a real implementation, this would initialize analytics service
    // For now, we'll just track events in memory
    console.log('Analytics initialized');
  }

  /**
   * Log a page view
   * @param {string} pageName - The name or path of the page
   */
  logPageView(pageName) {
    if (!this.trackingEnabled) return;

    const event = {
      type: 'pageview',
      page: pageName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    this.events.push(event);

    // In a real implementation, this would send data to analytics service
    console.log('Page view tracked:', event);
  }

  /**
   * Track a custom event
   * @param {string} eventName - The name of the event
   * @param {Object} properties - Additional properties for the event
   */
  trackEvent(eventName, properties = {}) {
    if (!this.trackingEnabled) return;

    const event = {
      type: 'event',
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };

    this.events.push(event);

    // In a real implementation, this would send data to analytics service
    console.log('Event tracked:', event);
  }

  /**
   * Track form submissions
   * @param {string} formId - The ID of the form
   * @param {Object} formData - The form data
   */
  trackFormSubmission(formId, formData) {
    this.trackEvent('form_submitted', {
      form_id: formId,
      // In a real implementation, sensitive data would be filtered out
      fields_count: Object.keys(formData).length
    });
  }

  /**
   * Track button clicks
   * @param {HTMLElement} button - The button that was clicked
   */
  trackButtonClick(button) {
    const buttonText = button.textContent.trim();
    const buttonId = button.id;
    const buttonClass = button.className;

    this.trackEvent('button_clicked', {
      button_text: buttonText,
      button_id: buttonId,
      button_class: buttonClass
    });
  }

  /**
   * Track navigation clicks
   * @param {HTMLElement} link - The link that was clicked
   */
  trackNavigationClick(link) {
    const linkText = link.textContent.trim();
    const linkHref = link.getAttribute('href');

    this.trackEvent('navigation_clicked', {
      link_text: linkText,
      link_href: linkHref
    });
  }

  /**
   * Track file downloads
   * @param {string} fileUrl - The URL of the downloaded file
   * @param {string} fileName - The name of the downloaded file
   */
  trackFileDownload(fileUrl, fileName) {
    this.trackEvent('file_downloaded', {
      file_url: fileUrl,
      file_name: fileName
    });
  }

  /**
   * Get all tracked events
   * @returns {Array} Array of tracked events
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Clear all tracked events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Enable or disable tracking
   * @param {boolean} enabled - Whether tracking should be enabled
   */
  setTrackingEnabled(enabled) {
    this.trackingEnabled = enabled;
  }
}
