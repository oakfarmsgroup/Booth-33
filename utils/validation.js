// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password strength level (weak, medium, strong)
export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return { level: 'weak', color: '#EF4444', label: 'Weak' };
  if (strength <= 4) return { level: 'medium', color: '#F59E0B', label: 'Medium' };
  return { level: 'strong', color: '#10B981', label: 'Strong' };
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Phone number validation (US format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Credit card number validation (Luhn algorithm)
export const isValidCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) return false;
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// CVV validation
export const isValidCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

// Expiry date validation (MM/YY format)
export const isValidExpiryDate = (expiry) => {
  const cleaned = expiry.replace(/\s/g, '');
  const match = cleaned.match(/^(\d{2})\/(\d{2})$/);

  if (!match) return false;

  const month = parseInt(match[1]);
  const year = parseInt('20' + match[2]);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

// Card brand detection
export const getCardBrand = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';

  return 'unknown';
};

// Format card number with spaces
export const formatCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

// Format expiry date
export const formatExpiryDate = (expiry) => {
  const cleaned = expiry.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

// Username validation (alphanumeric, underscore, 3-20 chars)
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// URL validation
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim().length > 0;
};

// Min/Max length validation
export const isValidLength = (value, min, max) => {
  const length = value ? value.length : 0;
  if (min !== undefined && length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
};

// Number range validation
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Form validation helper
export const validateForm = (fields, rules) => {
  const errors = {};

  Object.keys(rules).forEach(fieldName => {
    const value = fields[fieldName];
    const fieldRules = rules[fieldName];

    fieldRules.forEach(rule => {
      const { validator, message } = rule;

      if (!validator(value)) {
        if (!errors[fieldName]) {
          errors[fieldName] = [];
        }
        errors[fieldName].push(message);
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
