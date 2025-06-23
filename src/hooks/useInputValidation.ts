
import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export const useInputValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = useCallback((field: string, value: string): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Sanitize input
    const sanitizedValue = sanitizeInput(value);

    // Required validation
    if (rule.required && !sanitizedValue.trim()) {
      return 'Este campo é obrigatório';
    }

    // Skip other validations if field is empty and not required
    if (!sanitizedValue.trim() && !rule.required) {
      return null;
    }

    // Length validations
    if (rule.minLength && sanitizedValue.length < rule.minLength) {
      return `Mínimo de ${rule.minLength} caracteres`;
    }

    if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
      return `Máximo de ${rule.maxLength} caracteres`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
      return 'Formato inválido';
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(sanitizedValue);
      if (customError) return customError;
    }

    return null;
  }, [rules]);

  const validateField = useCallback((field: string, value: string): boolean => {
    const error = validate(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
    return !error;
  }, [validate]);

  const validateAll = useCallback((values: { [key: string]: string }): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validate(field, values[field] || '');
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validate, rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  return {
    errors,
    validateField,
    validateAll,
    clearErrors,
    clearFieldError
  };
};

// Input sanitization helper
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length to prevent DoS
};

// Common validation rules
export const commonValidationRules = {
  email: {
    required: true,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      // Additional email security checks
      if (value.includes('..')) return 'Email inválido';
      if (value.startsWith('.') || value.endsWith('.')) return 'Email inválido';
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
  },
  phone: {
    maxLength: 20,
    pattern: /^[\d\s\-\(\)\+]+$/,
  },
  company: {
    maxLength: 150,
    pattern: /^[a-zA-ZÀ-ÿ\d\s\-\.&]+$/,
  }
};
