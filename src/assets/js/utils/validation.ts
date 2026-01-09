
/**
 * Input Validation Utilities
 * Provides consistent validation for forms and API inputs
 */

/**
 * Validation Rules
 */
const validationRules = {
  required: (value: any): boolean => value !== undefined && value !== null && value.toString().trim() !== '',
  minLength: (value: string | any[], min: number): boolean => Boolean(value) && value.length >= min,
  maxLength: (value: string | any[], max: number): boolean => !value || value.length <= max,
  email: (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  password: (value: string): boolean => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
  alphanumeric: (value: string): boolean => /^[a-zA-Z0-9]*$/.test(value),
  numeric: (value: string): boolean => !isNaN(parseFloat(value)) && isFinite(parseFloat(value)),
  phone: (value: string): boolean => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  },
  date: (value: string): boolean => !isNaN(Date.parse(value)),
  energyType: (value: string): boolean => ['hydrogen', 'solar', 'wind', 'biofuels', 'geothermal', 'nuclear'].includes(value),
  contentType: (value: string): boolean => ['discussions', 'articles', 'resources', 'experts'].includes(value)
};

interface ValidationRule {
  value?: any;
  message?: string;
}

interface ValidationRules {
  [key: string]: ValidationRule | boolean;
}

interface FieldErrors {
  [fieldName: string]: string[];
}

/**
 * Validator Class
 */
class Validator {
  private errors: FieldErrors;

  constructor() {
    this.errors = {};
  }

  /**
   * Validate a field against rules
   * @param fieldName - Name of the field
   * @param value - Value to validate
   * @param rules - Validation rules
   * @returns True if valid
   */
  validateField(fieldName: string, value: any, rules: ValidationRules): boolean {
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
        ruleValue = (ruleConfig as ValidationRule).value;
        errorMessage = (ruleConfig as ValidationRule).message || errorMessage;
      }

      // Get the validation function
      const validationFn = (validationRules as any)[ruleName];

      if (validationFn && !validationFn(value, ruleValue)) {
        this.addError(fieldName, errorMessage);
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Validate multiple fields
   * @param fields - Object with field names and values
   * @param rules - Object with field names and validation rules
   * @returns True if all fields are valid
   */
  validateFields(fields: Record<string, any>, rules: Record<string, ValidationRules>): boolean {
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
   * @param fieldName - Name of the field
   * @param message - Error message
   */
  addError(fieldName: string, message: string): void {
    if (!this.errors[fieldName]) {
      this.errors[fieldName] = [];
    }

    this.errors[fieldName].push(message);
  }

  /**
   * Clear errors for a specific field
   * @param fieldName - Name of the field
   */
  clearFieldErrors(fieldName: string): void {
    if (this.errors[fieldName]) {
      delete this.errors[fieldName];
    }
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errors = {};
  }

  /**
   * Get all errors
   * @returns Object with field names and error messages
   */
  getErrors(): FieldErrors {
    return this.errors;
  }

  /**
   * Check if there are any errors
   * @returns True if there are errors
   */
  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Display errors in a form
   * @param form - The form element
   */
  displayErrorsInForm(form: HTMLFormElement): void {
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
        if (this.errors[fieldName]) {
          errorElement.textContent = this.errors[fieldName].join(', ');
        }

        // Insert error message after field
        if (field.parentNode) {
          field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
      }
    }
  }

  /**
   * Clear error display in a form
   * @param form - The form element
   */
  clearErrorsInForm(form: HTMLFormElement): void {
    // Remove error classes
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));

    // Remove error messages
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
  }
}

// Express types for API validation
interface Request {
  body: any;
}

interface Response {
  status: (code: number) => Response;
  json: (data: any) => void;
}

interface NextFunction {
  (): void;
}

/**
 * API Input Validation Middleware
 */
class ApiValidator {
  /**
   * Create validation middleware for Express
   * @param schema - Validation schema
   * @returns Express middleware function
   */
  static validate(schema: Record<string, ValidationRules>) {
    return (req: Request, res: Response, next: NextFunction) => {
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
   * @param input - Input string
   * @returns Sanitized string
   */
  static sanitize(input: string): string {
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
   * @param obj - Object to sanitize
   * @returns Sanitized object
   */
  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

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
        value: (value: string, formData: any) => value === formData.password,
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
export type { ValidationRule, ValidationRules, FieldErrors, Request, Response, NextFunction };
