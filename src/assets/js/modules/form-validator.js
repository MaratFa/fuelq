/**
 * Form Validator
 * Handles form validation and error display
 */

export class FormValidator {
  constructor() {
    this.forms = [];
  }

  /**
   * Initialize the form validator
   */
  init() {
    // Find all forms that need validation
    this.forms = document.querySelectorAll('form[data-validate]');

    // Set up validation for each form
    this.forms.forEach(form => {
      this.setupFormValidation(form);
    });
  }

  /**
   * Set up validation for a specific form
   * @param {HTMLFormElement} form - The form to validate
   */
  setupFormValidation(form) {
    // Add submit event listener
    form.addEventListener('submit', (event) => {
      if (!this.validateForm(form)) {
        event.preventDefault();
      }
    });

    // Add validation to required fields
    const requiredFields = form.querySelectorAll(
      'input[required], textarea[required], select[required]'
    );

    requiredFields.forEach(field => {
      // Add validation on blur
      field.addEventListener('blur', () => {
        this.validateField(field);
      });

      // Remove error on input
      field.addEventListener('input', () => {
        this.removeFieldError(field);
      });
    });

    // Add special validation for email fields
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
      field.addEventListener('blur', () => {
        this.validateEmailField(field);
      });
    });

    // Add special validation for phone fields
    const phoneFields = form.querySelectorAll('input[type="tel"], input[name*="phone"]');
    phoneFields.forEach(field => {
      field.addEventListener('blur', () => {
        this.validatePhoneField(field);
      });
    });
  }

  /**
   * Validate an entire form
   * @param {HTMLFormElement} form - The form to validate
   * @returns {boolean} Whether the form is valid
   */
  validateForm(form) {
    const requiredFields = form.querySelectorAll(
      'input[required], textarea[required], select[required]'
    );

    let isValid = true;

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Validate a single field
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field - The field to validate
   * @returns {boolean} Whether the field is valid
   */
  validateField(field) {
    const value = field.value.trim();

    // Check if field is required but empty
    if (field.hasAttribute('required') && !value) {
      this.showFieldError(field, 'This field is required');
      return false;
    }

    // Check for minimum length if specified
    const minLength = field.getAttribute('minlength');
    if (minLength && value.length < parseInt(minLength)) {
      this.showFieldError(field, `Minimum length is ${minLength} characters`);
      return false;
    }

    // Check for maximum length if specified
    const maxLength = field.getAttribute('maxlength');
    if (maxLength && value.length > parseInt(maxLength)) {
      this.showFieldError(field, `Maximum length is ${maxLength} characters`);
      return false;
    }

    // Check for pattern if specified
    const pattern = field.getAttribute('pattern');
    if (pattern && value) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        const title = field.getAttribute('title') || 'Please match the required format';
        this.showFieldError(field, title);
        return false;
      }
    }

    // Field is valid
    return true;
  }

  /**
   * Validate an email field
   * @param {HTMLInputElement} field - The email field to validate
   * @returns {boolean} Whether the email is valid
   */
  validateEmailField(field) {
    const email = field.value.trim();

    if (!email) return true; // Skip validation if empty (required check will handle this)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      this.showFieldError(field, 'Please enter a valid email address');
      return false;
    }

    return true;
  }

  /**
   * Validate a phone field
   * @param {HTMLInputElement} field - The phone field to validate
   * @returns {boolean} Whether the phone number is valid
   */
  validatePhoneField(field) {
    const phone = field.value.trim();

    if (!phone) return true; // Skip validation if empty (required check will handle this)

    const phoneRegex = /^[\d\s\-\(\)]+$/;

    if (!phoneRegex.test(phone)) {
      this.showFieldError(field, 'Please enter a valid phone number');
      return false;
    }

    return true;
  }

  /**
   * Show an error message for a field
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field - The field with an error
   * @param {string} message - The error message to display
   */
  showFieldError(field, message) {
    // Remove any existing error
    this.removeFieldError(field);

    // Add error class to field
    field.classList.add('error');

    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.className = 'field-error';
    errorMessage.textContent = message;

    // Insert error message after field
    field.parentNode.insertBefore(errorMessage, field.nextSibling);
  }

  /**
   * Remove an error message from a field
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field - The field to clear errors from
   */
  removeFieldError(field) {
    // Remove error class from field
    field.classList.remove('error');

    // Remove error message if it exists
    const errorMessage = field.parentNode.querySelector('.field-error');
    if (errorMessage) {
      errorMessage.remove();
    }
  }
}
