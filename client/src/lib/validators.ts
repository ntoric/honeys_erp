export type ValidatorFunc = (value: any, fieldName: string) => string | null;

// Standard Regular Expressions matching the Go backend regexes
const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const PHONE_REGEXP = /^\+?[0-9]{10,15}$/;
const NUMERIC_REGEXP = /^[0-9]+$/;
const ALPHANUMERIC_REGEXP = /^[a-zA-Z0-9]+$/;
const URL_REGEXP = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

export const Validators = {
  // Required validator
  required: (message?: string): ValidatorFunc => (value, fieldName) => {
    if (value === undefined || value === null) {
      return message || `${fieldName} is required`;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return message || `${fieldName} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return message || `${fieldName} is required`;
    }
    return null;
  },

  // Email validator
  email: (message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional field
    return EMAIL_REGEXP.test(String(value)) ? null : message || 'Invalid email format';
  },

  // Phone validator
  phone: (message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional field
    return PHONE_REGEXP.test(String(value)) ? null : message || 'Invalid phone number format';
  },

  // MinLength validator
  minLength: (min: number, message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional
    return String(value).length >= min ? null : message || `${fieldName} must be at least ${min} characters`;
  },

  // MaxLength validator
  maxLength: (max: number, message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional
    return String(value).length <= max ? null : message || `${fieldName} must be at most ${max} characters`;
  },

  // Numeric value min validator
  min: (minVal: number, message?: string): ValidatorFunc => (value, fieldName) => {
    if (value === undefined || value === null || value === '') return null; // Optional
    const num = Number(value);
    return !isNaN(num) && num >= minVal ? null : message || `${fieldName} must be at least ${minVal}`;
  },

  // Numeric value max validator
  max: (maxVal: number, message?: string): ValidatorFunc => (value, fieldName) => {
    if (value === undefined || value === null || value === '') return null; // Optional
    const num = Number(value);
    return !isNaN(num) && num <= maxVal ? null : message || `${fieldName} must be at most ${maxVal}`;
  },

  // Numeric character check
  numeric: (message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional
    return NUMERIC_REGEXP.test(String(value)) ? null : message || `${fieldName} must contain only digits`;
  },

  // Alphanumeric character check
  alphanumeric: (message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional
    return ALPHANUMERIC_REGEXP.test(String(value)) ? null : message || `${fieldName} must contain only letters and digits`;
  },

  // Custom regex pattern check
  pattern: (regex: RegExp, message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional
    return regex.test(String(value)) ? null : message || `${fieldName} has an invalid format`;
  },

  // URL format check
  url: (message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional
    return URL_REGEXP.test(String(value)) ? null : message || 'Invalid URL format';
  },

  // Date format check (YYYY-MM-DD)
  date: (message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return null; // Optional
    const str = String(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return message || 'Invalid date format (must be YYYY-MM-DD)';
    }
    const d = new Date(str);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return message || 'Invalid date';
    return d.toISOString().slice(0, 10) === str ? null : message || 'Invalid calendar date';
  },

  // Password strength check
  password: (message?: string): ValidatorFunc => (value, fieldName) => {
    if (!value) return message || `${fieldName} is required`;
    const str = String(value);
    const hasMinLen = str.length >= 8;
    const hasUpper = /[A-Z]/.test(str);
    const hasLower = /[a-z]/.test(str);
    const hasNumber = /[0-9]/.test(str);
    const hasSpecial = /[^A-Za-z0-9]/.test(str);

    const isValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;
    return isValid
      ? null
      : message || 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special symbols';
  },
};

/**
 * Validates a form payload against a schema of fields mapping to lists of ValidatorFuncs.
 * Returns a Record mapping each invalid field to its first encountered error string.
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ValidatorFunc[]>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field in rules) {
    const value = data[field];
    const fieldValidators = rules[field];
    
    // Capitalize field name for default messages
    const formattedFieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');

    for (const validator of fieldValidators) {
      const errorMsg = validator(value, formattedFieldName);
      if (errorMsg) {
        errors[field] = errorMsg;
        break; // Stop validating this field at the first error
      }
    }
  }

  return errors;
}
