/**
 * Contact Form Handler
 * Handles all functionality for the contact form
 */

import { getModule } from '../core/module-registry.js';

export class ContactFormHandler {
  constructor() {
    this.name = 'contactForm';
    this.initialized = false;
  }

  /**
   * Initialize contact form handler
   * @param {Object} config - Configuration object
   */
  init(config = {}) {
    if (this.initialized) return;

    console.log('Initializing contact form handler...');

    // Initialize form functionality
    this.initFormValidation();
    this.initFormSubmission();
    this.initFormReset();

    this.initialized = true;
    console.log('Contact form handler initialized');
  }

  /**
   * Initialize form validation
   */
  initFormValidation() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    // Get form inputs
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectSelect = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');

    // Add validation event listeners
    if (nameInput) {
      nameInput.addEventListener('blur', () => this.validateField(nameInput, 'name'));
    }

    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateField(emailInput, 'email'));
    }

    if (subjectSelect) {
      subjectSelect.addEventListener('change', () => this.validateField(subjectSelect, 'subject'));
    }

    if (messageTextarea) {
      messageTextarea.addEventListener('blur', () => this.validateField(messageTextarea, 'message'));
    }
  }

  /**
   * Initialize form submission
   */
  initFormSubmission() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate all fields
      if (this.validateForm()) {
        // Get form data
        const formData = this.getFormData();

        // Submit form
        this.submitForm(formData);
      } else {
        // Show validation error
        this.showNotification('Please fill in all required fields correctly', 'error');
      }
    });
  }

  /**
   * Initialize form reset
   */
  initFormReset() {
    const resetButton = document.getElementById('reset-form');

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.resetForm();
      });
    }
  }

  /**
   * Validate a specific field
   * @param {HTMLElement} field - Field to validate
   * @param {string} fieldType - Type of field
   * @returns {boolean} - Whether field is valid
   */
  validateField(field, fieldType) {
    let isValid = true;
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.error-message');

    // Remove previous error styling
    field.classList.remove('error');

    // Remove previous error message
    if (errorElement) {
      errorElement.remove();
    }

    // Validate based on field type
    switch (fieldType) {
      case 'name':
        if (value.length < 2) {
          this.showFieldError(field, 'Name must be at least 2 characters');
          isValid = false;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          this.showFieldError(field, 'Please enter a valid email address');
          isValid = false;
        }
        break;

      case 'subject':
        if (value === '') {
          this.showFieldError(field, 'Please select a subject');
          isValid = false;
        }
        break;

      case 'message':
        if (value.length < 10) {
          this.showFieldError(field, 'Message must be at least 10 characters');
          isValid = false;
        }
        break;
    }

    return isValid;
  }

  /**
   * Validate the entire form
   * @returns {boolean} - Whether form is valid
   */
  validateForm() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectSelect = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');

    let isValid = true;

    if (nameInput && !this.validateField(nameInput, 'name')) {
      isValid = false;
    }

    if (emailInput && !this.validateField(emailInput, 'email')) {
      isValid = false;
    }

    if (subjectSelect && !this.validateField(subjectSelect, 'subject')) {
      isValid = false;
    }

    if (messageTextarea && !this.validateField(messageTextarea, 'message')) {
      isValid = false;
    }

    return isValid;
  }

  /**
   * Get form data
   * @returns {Object} - Form data
   */
  getFormData() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectSelect = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');

    return {
      name: nameInput ? nameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      subject: subjectSelect ? subjectSelect.value : '',
      message: messageTextarea ? messageTextarea.value.trim() : ''
    };
  }

  /**
   * Submit form
   * @param {Object} formData - Form data to submit
   */
  submitForm(formData) {
    // Show loading state
    this.showLoadingState();

    // Simulate API call
    setTimeout(() => {
      // Hide loading state
      this.hideLoadingState();

      // Show success message
      this.showSuccessMessage();

      // Reset form
      this.resetForm();
    }, 1500);
  }

  /**
   * Reset form
   */
  resetForm() {
    const form = document.getElementById('contact-form');

    if (form) {
      form.reset();

      // Remove error styling
      const errorFields = form.querySelectorAll('.error');
      errorFields.forEach(field => {
        field.classList.remove('error');
      });

      // Remove error messages
      const errorMessages = form.querySelectorAll('.error-message');
      errorMessages.forEach(message => {
        message.remove();
      });
    }
  }

  /**
   * Show field error
   * @param {HTMLElement} field - Field with error
   * @param {string} message - Error message
   */
  showFieldError(field, message) {
    // Add error styling
    field.classList.add('error');

    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    // Add error message after field
    field.parentElement.appendChild(errorElement);
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    const submitButton = document.getElementById('submit-form');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    const submitButton = document.getElementById('submit-form');

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    }
  }

  /**
   * Show success message
   */
  showSuccessMessage() {
    // Hide form
    const form = document.getElementById('contact-form');
    if (form) {
      form.style.display = 'none';
    }

    // Show success message
    const successMessage = document.getElementById('form-success');
    if (successMessage) {
      successMessage.style.display = 'block';
    }
  }

  /**
   * Show notification
   * @param {string} message - Message to display
   * @param {string} type - Type of notification ('success', 'error', 'info')
   */
  showNotification(message, type = 'info') {
    // Get notification manager if available
    const notificationManager = getModule('notificationManager');

    if (notificationManager) {
      notificationManager.show(message, type);
    } else {
      // Fallback to simple alert
      alert(message);
    }
  }
}

// Export a singleton instance
export default new ContactFormHandler();
