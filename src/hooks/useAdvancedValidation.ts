
import { useCallback } from 'react';
import { useSecurityValidation } from './useSecurityValidation';

interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  scanForMalware?: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isCompromised?: boolean;
}

export const useAdvancedValidation = () => {
  const { sanitizeInput, validateEmail } = useSecurityValidation();

  const validateFile = useCallback((file: File, options: FileValidationOptions = {}): { isValid: boolean; error?: string } => {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'],
      scanForMalware = false
    } = options;

    // Basic validation
    if (!file) {
      return { isValid: false, error: 'Nenhum arquivo selecionado' };
    }

    // Size validation
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return { isValid: false, error: `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB` };
    }

    // Type validation
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}` };
    }

    // File name validation
    const sanitizedName = sanitizeInput(file.name);
    if (sanitizedName !== file.name) {
      return { isValid: false, error: 'Nome do arquivo contém caracteres inválidos' };
    }

    // Extension validation
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = {
      'application/pdf': ['pdf'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif']
    };

    const expectedExtensions = validExtensions[file.type as keyof typeof validExtensions];
    if (expectedExtensions && !expectedExtensions.includes(extension || '')) {
      return { isValid: false, error: 'Extensão do arquivo não corresponde ao tipo' };
    }

    return { isValid: true };
  }, [sanitizeInput]);

  const checkPasswordStrength = useCallback((password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score += 25;
    else feedback.push('Use pelo menos 8 caracteres');

    // Complexity checks
    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Adicione letras minúsculas');

    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Adicione letras maiúsculas');

    if (/\d/.test(password)) score += 20;
    else feedback.push('Adicione números');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    else feedback.push('Adicione símbolos especiais');

    // Common patterns check
    const commonPatterns = [
      /123456/, /password/i, /qwerty/i, /admin/i,
      /123456789/, /111111/, /000000/
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      score -= 30;
      feedback.push('Evite padrões comuns');
    }

    // Sequential characters
    if (/(.)\1{2,}/.test(password)) {
      score -= 20;
      feedback.push('Evite caracteres repetidos');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: feedback.length > 0 ? feedback : ['Senha forte!']
    };
  }, []);

  const validateCreditCard = useCallback((cardNumber: string): { isValid: boolean; type?: string; error?: string } => {
    const sanitized = cardNumber.replace(/\s+/g, '');
    
    if (!/^\d{13,19}$/.test(sanitized)) {
      return { isValid: false, error: 'Número do cartão deve conter apenas dígitos' };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }

    if (sum % 10 !== 0) {
      return { isValid: false, error: 'Número do cartão inválido' };
    }

    // Detect card type
    let type = 'unknown';
    if (/^4/.test(sanitized)) type = 'visa';
    else if (/^5[1-5]/.test(sanitized)) type = 'mastercard';
    else if (/^3[47]/.test(sanitized)) type = 'amex';

    return { isValid: true, type };
  }, []);

  const validateCPF = useCallback((cpf: string): { isValid: boolean; error?: string } => {
    const sanitized = cpf.replace(/\D/g, '');
    
    if (sanitized.length !== 11) {
      return { isValid: false, error: 'CPF deve ter 11 dígitos' };
    }

    // Check for repeated digits
    if (/^(\d)\1{10}$/.test(sanitized)) {
      return { isValid: false, error: 'CPF inválido' };
    }

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(sanitized[i]) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(sanitized[9]) !== digit1) {
      return { isValid: false, error: 'CPF inválido' };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(sanitized[i]) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(sanitized[10]) !== digit2) {
      return { isValid: false, error: 'CPF inválido' };
    }

    return { isValid: true };
  }, []);

  return {
    validateFile,
    checkPasswordStrength,
    validateCreditCard,
    validateCPF,
    validateEmail
  };
};
