
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityValidation } from './useSecurityValidation';

interface SecureClientAuth {
  token: string;
  client: {
    id: string;
    nome: string;
    email: string;
    empresa?: string;
    telefone?: string;
  };
  expiresAt: string;
  isValid: boolean;
}

interface TokenValidationResponse {
  valid: boolean;
  client?: {
    id: string;
    nome: string;
    email: string;
    empresa?: string;
    telefone?: string;
  };
  error?: string;
  token_expires_at?: string;
}

export const useSecureClientAuth = () => {
  const [clientAuth, setClientAuth] = useState<SecureClientAuth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const { sanitizeInput, validateEmail, validateToken } = useSecurityValidation();

  const generateSecureToken = async (email: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      // Enhanced input validation
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim(), { maxLength: 254 });
      const emailValidation = validateEmail(sanitizedEmail);
      
      if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.error };
      }

      // Rate limiting check
      if (attempts >= 5) {
        setIsBlocked(true);
        await logSecurityEvent('rate_limit_exceeded', undefined, sanitizedEmail);
        return { success: false, error: 'Muitas tentativas. Tente novamente em 15 minutos.' };
      }

      // Call the secure token generation function
      const { data, error } = await supabase.rpc('generate_client_access_token', {
        client_email: sanitizedEmail,
        expires_in_hours: 24
      });

      if (error) {
        console.error('Error generating token:', error);
        await logSecurityEvent('token_generation_failed', undefined, sanitizedEmail);
        return { success: false, error: 'Cliente não encontrado ou erro interno' };
      }

      await logSecurityEvent('token_generated', undefined, sanitizedEmail);
      return { success: true, token: data as string };
    } catch (error) {
      console.error('Unexpected error:', error);
      await logSecurityEvent('token_generation_error', undefined, email);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const validateTokenSecurity = async (token: string): Promise<{ success: boolean; client?: any; error?: string }> => {
    try {
      // Enhanced token validation
      const tokenValidation = validateToken(token);
      if (!tokenValidation.isValid) {
        return { success: false, error: tokenValidation.error };
      }

      // Validate token through secure function
      const { data, error } = await supabase.rpc('validate_client_access_token', {
        token: token
      });

      if (error) {
        console.error('Error validating token:', error);
        await logSecurityEvent('token_validation_failed', undefined, undefined);
        return { success: false, error: 'Erro ao validar token' };
      }

      const validationResponse = data as unknown as TokenValidationResponse;

      if (!validationResponse.valid) {
        await logSecurityEvent('invalid_token_used', undefined, undefined);
        return { success: false, error: validationResponse.error || 'Token inválido ou expirado' };
      }

      await logSecurityEvent('successful_token_validation', validationResponse.client?.id, undefined);
      return { success: true, client: validationResponse.client };
    } catch (error) {
      console.error('Unexpected error validating token:', error);
      await logSecurityEvent('token_validation_error', undefined, undefined);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const loginWithEmail = async (email: string): Promise<{ success: boolean; client?: any; error?: string }> => {
    if (isBlocked) {
      return { success: false, error: 'Acesso temporariamente bloqueado' };
    }

    setLoading(true);
    setError(null);
    setAttempts(prev => prev + 1);

    try {
      const tokenResult = await generateSecureToken(email);
      
      if (!tokenResult.success) {
        setError(tokenResult.error || 'Erro ao gerar token');
        setLoading(false);
        return { success: false, error: tokenResult.error };
      }

      const validationResult = await validateTokenSecurity(tokenResult.token!);
      
      if (!validationResult.success) {
        setError(validationResult.error || 'Erro ao validar token');
        setLoading(false);
        return { success: false, error: validationResult.error };
      }

      const auth: SecureClientAuth = {
        token: tokenResult.token!,
        client: validationResult.client!,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        isValid: true
      };
      
      setClientAuth(auth);
      // Use sessionStorage instead of localStorage for better security
      sessionStorage.setItem('secure_client_auth', JSON.stringify(auth));
      setAttempts(0); // Reset attempts on successful login
      setError(null);
      setLoading(false);
      
      return { success: true, client: validationResult.client };
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = 'Erro interno do sistema';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    if (clientAuth) {
      logSecurityEvent('client_logout', clientAuth.client.id, undefined);
    }
    setClientAuth(null);
    setError(null);
    setAttempts(0);
    setIsBlocked(false);
    sessionStorage.removeItem('secure_client_auth');
    localStorage.removeItem('secure_client_auth'); // Clean up old localStorage data
  };

  const checkTokenExpiry = () => {
    if (clientAuth && new Date(clientAuth.expiresAt) <= new Date()) {
      logSecurityEvent('token_expired', clientAuth.client.id, undefined);
      logout();
      setError('Sessão expirada. Faça login novamente.');
    }
  };

  const logSecurityEvent = async (eventType: string, clientId?: string, email?: string) => {
    try {
      await supabase.rpc('log_security_event', {
        event_type: eventType,
        client_id: clientId || null,
        details: email ? { email } : null,
        severity: eventType.includes('failed') || eventType.includes('error') ? 'medium' : 'low'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  useEffect(() => {
    // Check for saved authentication in sessionStorage first, then localStorage
    const savedAuth = sessionStorage.getItem('secure_client_auth') || localStorage.getItem('secure_client_auth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        // Validate expiry and token format
        if (new Date(auth.expiresAt) > new Date() && validateToken(auth.token).isValid) {
          setClientAuth(auth);
          // Migrate from localStorage to sessionStorage
          if (localStorage.getItem('secure_client_auth')) {
            sessionStorage.setItem('secure_client_auth', savedAuth);
            localStorage.removeItem('secure_client_auth');
          }
        } else {
          sessionStorage.removeItem('secure_client_auth');
          localStorage.removeItem('secure_client_auth');
          setError('Sessão expirada. Faça login novamente.');
        }
      } catch (error) {
        console.error('Error loading saved auth:', error);
        sessionStorage.removeItem('secure_client_auth');
        localStorage.removeItem('secure_client_auth');
      }
    }
    setLoading(false);

    // Set up token expiry checker and cleanup on unload
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    
    const handleBeforeUnload = () => {
      // Log session end
      if (clientAuth) {
        logSecurityEvent('session_ended', clientAuth.client.id, undefined);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [clientAuth]);

  // Reset blocked state after 15 minutes
  useEffect(() => {
    if (isBlocked) {
      const timeout = setTimeout(() => {
        setIsBlocked(false);
        setAttempts(0);
      }, 15 * 60 * 1000); // 15 minutes
      
      return () => clearTimeout(timeout);
    }
  }, [isBlocked]);

  return {
    clientAuth,
    loading,
    error,
    attempts,
    isBlocked,
    loginWithEmail,
    logout,
    setClientAuth
  };
};
