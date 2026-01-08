/**
 * Input Validation Utilities
 * Provides consistent validation for forms and API inputs
 */

/**
 * Validation Rules
 */
const validationRules = {
  required: (value) => value !== undefined && value !== null && value.toString().trim() !== '',
  minLength: (value, min) => value && value.length >= min,
  maxLength: (value, max) => !value || value.length <= max,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
  alphanumeric: (value) => /^[a-zA-Z0-9]*$/.test(value),
  numeric: (value) => !isNaN(parseFloat(value)) && isFinite(value),
  phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  },
  date: (value) => !isNaN(Date.parse(value)),
  energyType: (value) => ['hydrogen', 'solar', 'wind', 'biofuels', 'geothermal', 'nuclear'].includes(value),
  contentType: (value) => ['discussions', 'articles', 'resources', 'experts'].includes(value)
};

/**
 * Validator Class
 */
class Validator {
  constructor() {
    this.errors = [];
  }

  /**
   * Validate a field against rules
   * @param {string} fieldName - Name of the field
   * @param {any} value - Value to validate
   * @param {Object} rules - Validation rules
   * @returns {boolean} True if valid
   */
  validateField(fieldName, value, rules) {
    // Clear previous errors for this field
    this.clearFieldErrors(fieldName);

    let isValid = true;

    // Check each rule
    for (const ruleName in rules) {
      const ruleConfig = rules[ruleName];
      let ruleValue = ruleConfig;
      let errorMessage = `${fieldName} is invalid`;

      // If rule is an object with value and message
      if (typeof ruleConfig === 'object' && ruleConfig !== null) {
        ruleValue = ruleConfig.value;
        errorMessage = ruleConfig.message || errorMessage;
      }

      // Get the validation function
      const validationFn = validationRules[ruleName];

      if (validationFn && !validationFn(value, ruleValue)) {
        this.addError(fieldName, errorMessage);
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Validate multiple fields
   * @param {Object} fields - Object with field names and values
   * @param {Object} rules - Object with field names and validation rules
   * @returns {boolean} True if all fields are valid
   */
  validateFields(fields, rules) {
    let isValid = true;

    for (const fieldName in fields) {
      if (rules[fieldName]) {
        const fieldValid = this.validateField(fieldName, fields[fieldName], rules[fieldName]);
        if (!fieldValid) {
          isValid = false;
        }
      }
    }

    return isValid;
  }

  /**
   * Add an error for a field
   * @param {string} fieldName - Name of the field
   * @param {string} message - Error message
   */
  addError(fieldName, message) {
    if (!this.errors[fieldName]) {
      this.errors[fieldName] = [];
    }

    this.errors[fieldName].push(message);
  }

  /**
   * Clear errors for a specific field
   * @param {string} fieldName - Name of the field
   */
  clearFieldErrors(fieldName) {
    if (this.errors[fieldName]) {
      delete this.errors[fieldName];
    }
  }

  /**
   * Clear all errors
   */
  clearAllErrors() {
    this.errors = [];
  }

  /**
   * Get all errors
   * @returns {Object} Object with field names and error messages
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Check if there are any errors
   * @returns {boolean} True if there are errors
   */
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Display errors in a form
   * @param {HTMLFormElement} form - The form element
   */
  displayErrorsInForm(form) {
    // Remove any existing error messages
    const existingErrors = form.querySelectorAll('.error-message');
    existingErrors.forEach(el => el.remove());

    // Add new error messages
    for (const fieldName in this.errors) {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        // Add error class to field
        field.classList.add('error');

        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = this.errors[fieldName].join(', ');

        // Insert error message after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }
    }
  }

  /**
   * Clear error display in a form
   * @param {HTMLFormElement} form - The form element
   */
  clearErrorsInForm(form) {
    // Remove error classes
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));

    // Remove error messages
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
  }
}

/**
 * API Input Validation Middleware
 */
class ApiValidator {
  /**
   * Create validation middleware for Express
   * @param {Object} schema - Validation schema
   * @returns {Function} Express middleware function
   */
  static validate(schema) {
    return (req, res, next) => {
      const validator = new Validator();
      const isValid = validator.validateFields(req.body, schema);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validator.getErrors()
        });
      }

      next();
    };
  }

  /**
   * Sanitize input to prevent XSS
   * @param {string} input - Input string
   * @returns {string} Sanitized string
   */
  static sanitize(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sanitize all properties in an object
   * @param {Object} obj - Object to sanitize
   * @returns {Object} Sanitized object
   */
  static sanitizeObject(obj) {
    const sanitized = {};

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = this.sanitize(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }

    return sanitized;
  }
}

// Common validation schemas
const commonSchemas = {
  userRegistration: {
    username: {
      required: true,
      minLength: { value: 3, message: 'Username must be at least 3 characters' },
      maxLength: { value: 20, message: 'Username must be less than 20 characters' },
      alphanumeric: { value: true, message: 'Username can only contain letters and numbers' }
    },
    email: {
      required: true,
      email: { value: true, message: 'Please enter a valid email address' }
    },
    password: {
      required: true,
      password: { value: true, message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character' }
    },
    confirmPassword: {
      required: true,
      custom: {
        value: (value, formData) => value === formData.password,
        message: 'Passwords do not match'
      }
    }
  },

  forumPost: {
    title: {
      required: true,
      minLength: { value: 5, message: 'Title must be at least 5 characters' },
      maxLength: { value: 100, message: 'Title must be less than 100 characters' }
    },
    content: {
      required: true,
      minLength: { value: 10, message: 'Content must be at least 10 characters' }
    },
    category: {
      required: true,
      energyType: { value: true, message: 'Please select a valid energy category' }
    }
  }
};

// Export for use in other modules
export { Validator, ApiValidator, validationRules, commonSchemas };
