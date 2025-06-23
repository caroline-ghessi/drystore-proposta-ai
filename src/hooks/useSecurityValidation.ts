
import { useCallback } from 'react';

interface ValidationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  allowSpecialChars?: boolean;
  pattern?: RegExp;
}

export const useSecurityValidation = () => {
  const sanitizeInput = useCallback((input: string, options: ValidationOptions = {}): string => {
    if (typeof input !== 'string') return '';
    
    const {
      maxLength = 1000,
      allowHtml = false,
      allowSpecialChars = true
    } = options;
    
    let sanitized = input.trim();
    
    // Limit length to prevent DoS
    sanitized = sanitized.substring(0, maxLength);
    
    // Remove HTML tags if not allowed
    if (!allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
    
    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>'"]/g, '');
    
    // Remove null bytes and other dangerous characters
    sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
    
    return sanitized;
  }, []);

  const validateEmail = useCallback((email: string): { isValid: boolean; error?: string } => {
    const sanitized = sanitizeInput(email, { maxLength: 254 });
    
    if (!sanitized) {
      return { isValid: false, error: 'Email é obrigatório' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    // Additional security checks
    if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
      return { isValid: false, error: 'Email inválido' };
    }
    
    return { isValid: true };
  }, [sanitizeInput]);

  const validateToken = useCallback((token: string): { isValid: boolean; error?: string } => {
    if (!token || typeof token !== 'string') {
      return { isValid: false, error: 'Token inválido' };
    }
    
    // Token should be base64 encoded and have minimum length
    if (token.length < 20) {
      return { isValid: false, error: 'Token muito curto' };
    }
    
    // Check for valid base64 characters
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(token)) {
      return { isValid: false, error: 'Formato de token inválido' };
    }
    
    return { isValid: true };
  }, []);

  return {
    sanitizeInput,
    validateEmail,
    validateToken
  };
};
