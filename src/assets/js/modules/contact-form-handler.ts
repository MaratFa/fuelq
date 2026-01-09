/**
 * Contact Form Handler
 * Handles all functionality for the contact form
 */

import { getModule } from '../core/module-registry.js';

interface FormConfig {
  [key: string]: any;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactFormHandler {
  private name: string;
  private initialized: boolean;

  constructor() {
    this.name = 'contactForm';
    this.initialized = false;
  }

  /**
   * Initialize contact form handler
   * @param config - Configuration object
   */
  init(config: FormConfig = {}): void {
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
  initFormValidation(): void {
    const form = document.getElementById('contact-form') as HTMLFormElement;

    if (!form) return;

    // Get form inputs
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const subjectSelect = document.getElementById('subject') as HTMLSelectElement;
    const messageTextarea = document.getElementById('message') as HTMLTextAreaElement;

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
  initFormSubmission(): void {
    const form = document.getElementById('contact-form') as HTMLFormElement;

    if (!form) return;

    form.addEventListener('submit', (e: Event) => {
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
  initFormReset(): void {
    const resetButton = document.getElementById('reset-form') as HTMLButtonElement;

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.resetForm();
      });
    }
  }

  /**
   * Validate a specific field
   * @param field - Field to validate
   * @param fieldType - Type of field
   * @returns - Whether field is valid
   */
  validateField(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, fieldType: string): boolean {
    let isValid = true;
    const value = field.value.trim();
    const errorElement = field.parentElement?.querySelector('.error-message');

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
   * @returns - Whether form is valid
   */
  validateForm(): boolean {
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const subjectSelect = document.getElementById('subject') as HTMLSelectElement;
    const messageTextarea = document.getElementById('message') as HTMLTextAreaElement;

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
   * @returns - Form data
   */
  getFormData(): FormData {
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const subjectSelect = document.getElementById('subject') as HTMLSelectElement;
    const messageTextarea = document.getElementById('message') as HTMLTextAreaElement;

    return {
      name: nameInput ? nameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      subject: subjectSelect ? subjectSelect.value : '',
      message: messageTextarea ? messageTextarea.value.trim() : ''
    };
  }

  /**
   * Submit form
   * @param formData - Form data to submit
   */
  submitForm(formData: FormData): void {
    // Show loading state
    this.showLoadingState();

    // Send data to API
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Hide loading state
      this.hideLoadingState();

      // Show success message
      this.showSuccessMessage();

      // Reset form
      this.resetForm();
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      // Hide loading state
      this.hideLoadingState();
      // Show error message
      this.showErrorMessage('Failed to submit form. Please try again later.');
    });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    const form = document.getElementById('contact-form') as HTMLFormElement;

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
   * @param field - Field with error
   * @param message - Error message
   */
  showFieldError(field: HTMLElement, message: string): void {
    // Add error styling
    field.classList.add('error');

    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    // Add error message after field
    if (field.parentElement) {
      field.parentElement.appendChild(errorElement);
    }
  }

  /**
   * Show loading state
   */
  showLoadingState(): void {
    const submitButton = document.getElementById('submit-form') as HTMLButtonElement;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }
  }

  /**
   * Hide loading state
   */
  hideLoadingState(): void {
    const submitButton = document.getElementById('submit-form') as HTMLButtonElement;

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    }
  }

  /**
   * Show success message
   */
  showSuccessMessage(): void {
    // Hide form
    const form = document.getElementById('contact-form') as HTMLElement;
    if (form) {
      form.style.display = 'none';
    }

    // Show success message
    const successMessage = document.getElementById('form-success') as HTMLElement;
    if (successMessage) {
      successMessage.style.display = 'block';
    }
  }

  /**
   * Show notification
   * @param message - Message to display
   * @param type - Type of notification ('success', 'error', 'info')
   */
  showNotification(message: string, type: string = 'info'): void {
    // Get notification manager if available
    const notificationManager = getModule('notificationManager');

    if (notificationManager) {
      notificationManager.show(message, type);
    } else {
      // Fallback to simple alert
      alert(message);
    }
  }

  /**
   * Show error message
   * @param message - Error message to display
   */
  showErrorMessage(message: string): void {
    this.showNotification(message, 'error');
  }
}

// Export a singleton instance
export default new ContactFormHandler();
