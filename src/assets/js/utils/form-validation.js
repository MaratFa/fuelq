// Form validation utility

/**
 * Validate an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
function validateEmail(email) {
  const re = /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validate a form field
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field - The form field to validate
 * @param {Object} rules - Validation rules for the field
 * @returns {Object} - Validation result with isValid and message properties
 */
function validateField(field, rules) {
  const value = field.value.trim();
  const fieldName = field.getAttribute('data-name') || field.name || 'Field';

  // Check if field is required and empty
  if (rules.required && !value) {
    return {
      isValid: false,
      message: `${fieldName} is required`
    };
  }

  // Skip other validations if field is empty and not required
  if (!value && !rules.required) {
    return {
      isValid: true,
      message: ''
    };
  }

  // Check minimum length
  if (rules.minLength && value.length < rules.minLength) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${rules.minLength} characters`
    };
  }

  // Check maximum length
  if (rules.maxLength && value.length > rules.maxLength) {
    return {
      isValid: false,
      message: `${fieldName} must be no more than ${rules.maxLength} characters`
    };
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    return {
      isValid: false,
      message: rules.errorMessage || `${fieldName} is not in the correct format`
    };
  }

  // Check email format
  if (rules.isEmail && !validateEmail(value)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }

  // Check numeric value
  if (rules.isNumeric && isNaN(value)) {
    return {
      isValid: false,
      message: `${fieldName} must be a number`
    };
  }

  // Check minimum value
  if (rules.min && parseFloat(value) < rules.min) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${rules.min}`
    };
  }

  // Check maximum value
  if (rules.max && parseFloat(value) > rules.max) {
    return {
      isValid: false,
      message: `${fieldName} must be no more than ${rules.max}`
    };
  }

  // Check if field matches another field (for password confirmation)
  if (rules.matches && value !== document.querySelector(rules.matches).value) {
    return {
      isValid: false,
      message: `${fieldName} does not match`
    };
  }

  // All validations passed
  return {
    isValid: true,
    message: ''
  };
}

/**
 * Validate a form
 * @param {HTMLFormElement} form - The form to validate
 * @param {Object} validationRules - Validation rules for form fields
 * @returns {Object} - Validation result with isValid, errors, and firstError properties
 */
function validateForm(form, validationRules) {
  const errors = {};
  let isValid = true;
  let firstErrorField = null;

  // Get all form fields
  const fields = form.elements;

  // Validate each field that has validation rules
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const fieldName = field.name;

    // Skip fields without validation rules
    if (!validationRules[fieldName]) {
      continue;
    }

    // Validate field
    const result = validateField(field, validationRules[fieldName]);

    // Store error message if validation failed
    if (!result.isValid) {
      errors[fieldName] = result.message;
      isValid = false;

      // Store reference to first field with error
      if (!firstErrorField) {
        firstErrorField = field;
      }
    }
  }

  return {
    isValid,
    errors,
    firstErrorField
  };
}

/**
 * Display validation errors for a form
 * @param {HTMLFormElement} form - The form with errors
 * @param {Object} errors - Object with field names as keys and error messages as values
 */
function displayValidationErrors(form, errors) {
  // Remove any existing error messages
  removeValidationErrors(form);

  // Add error message for each field with error
  for (const fieldName in errors) {
    const field = form.querySelector(`[name="${fieldName}"]`);

    if (field) {
      // Add error class to field
      field.classList.add('error');

      // Create error message element
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.textContent = errors[fieldName];

      // Insert error message after field
      field.parentNode.insertBefore(errorMessage, field.nextSibling);
    }
  }

  // Focus on first field with error
  const firstErrorField = form.querySelector('.error');
  if (firstErrorField) {
    firstErrorField.focus();
  }
}

/**
 * Remove validation errors from a form
 * @param {HTMLFormElement} form - The form to clear errors from
 */
function removeValidationErrors(form) {
  // Remove error class from all fields
  const fields = form.elements;
  for (let i = 0; i < fields.length; i++) {
    fields[i].classList.remove('error');
  }

  // Remove all error message elements
  const errorMessages = form.querySelectorAll('.error-message');
  for (let i = 0; i < errorMessages.length; i++) {
    errorMessages[i].parentNode.removeChild(errorMessages[i]);
  }
}

/**
 * Add validation to a form
 * @param {HTMLFormElement} form - The form to add validation to
 * @param {Object} validationRules - Validation rules for form fields
 * @param {Function} onSubmit - Callback function to run when form is valid and submitted
 */
function addFormValidation(form, validationRules, onSubmit) {
  // Add submit event listener
  form.addEventListener('submit', function(event) {
    // Prevent default form submission
    event.preventDefault();

    // Validate form
    const result = validateForm(form, validationRules);

    if (result.isValid) {
      // Form is valid, remove any existing errors and call onSubmit callback
      removeValidationErrors(form);
      onSubmit(form);
    } else {
      // Form is invalid, display errors
      displayValidationErrors(form, result.errors);
    }
  });

  // Add input event listeners to clear errors when user corrects them
  const fields = form.elements;
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const fieldName = field.name;

    // Skip fields without validation rules
    if (!validationRules[fieldName]) {
      continue;
    }

    // Add input event listener
    field.addEventListener('input', function() {
      // If field has error class, validate it
      if (field.classList.contains('error')) {
        const result = validateField(field, validationRules[fieldName]);

        // If field is now valid, remove error styling
        if (result.isValid) {
          field.classList.remove('error');

          // Remove error message if it exists
          const errorMessage = field.parentNode.querySelector('.error-message');
          if (errorMessage) {
            field.parentNode.removeChild(errorMessage);
          }
        }
      }
    });
  }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateEmail,
    validateField,
    validateForm,
    displayValidationErrors,
    removeValidationErrors,
    addFormValidation
  };
}
