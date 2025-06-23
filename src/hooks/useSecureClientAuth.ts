
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useSecureClientAuth = () => {
  const [clientAuth, setClientAuth] = useState<SecureClientAuth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateSecureToken = async (email: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      // Input validation and sanitization
      const sanitizedEmail = email.trim().toLowerCase();
      if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
        return { success: false, error: 'Email inválido' };
      }

      // Call the secure token generation function
      const { data, error } = await supabase.rpc('generate_client_access_token', {
        client_email: sanitizedEmail,
        expires_in_hours: 24
      });

      if (error) {
        console.error('Error generating token:', error);
        return { success: false, error: 'Cliente não encontrado ou erro interno' };
      }

      return { success: true, token: data };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const validateToken = async (token: string): Promise<{ success: boolean; client?: any; error?: string }> => {
    try {
      // Input validation
      if (!token || typeof token !== 'string') {
        return { success: false, error: 'Token inválido' };
      }

      // Validate token through secure function
      const { data, error } = await supabase.rpc('validate_client_access_token', {
        token: token
      });

      if (error) {
        console.error('Error validating token:', error);
        return { success: false, error: 'Erro ao validar token' };
      }

      if (!data.valid) {
        return { success: false, error: data.error || 'Token inválido ou expirado' };
      }

      return { success: true, client: data.client };
    } catch (error) {
      console.error('Unexpected error validating token:', error);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const loginWithEmail = async (email: string): Promise<{ success: boolean; client?: any; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const tokenResult = await generateSecureToken(email);
      
      if (!tokenResult.success) {
        setError(tokenResult.error || 'Erro ao gerar token');
        setLoading(false);
        return { success: false, error: tokenResult.error };
      }

      const validationResult = await validateToken(tokenResult.token!);
      
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
      localStorage.setItem('secure_client_auth', JSON.stringify(auth));
      setLoading(false);
      
      return { success: true, client: validationResult.client };
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro interno do sistema');
      setLoading(false);
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  const logout = () => {
    setClientAuth(null);
    setError(null);
    localStorage.removeItem('secure_client_auth');
  };

  const checkTokenExpiry = () => {
    if (clientAuth && new Date(clientAuth.expiresAt) <= new Date()) {
      logout();
      setError('Sessão expirada. Faça login novamente.');
    }
  };

  useEffect(() => {
    // Check for saved authentication
    const savedAuth = localStorage.getItem('secure_client_auth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        // Validate expiry
        if (new Date(auth.expiresAt) > new Date()) {
          setClientAuth(auth);
        } else {
          localStorage.removeItem('secure_client_auth');
          setError('Sessão expirada. Faça login novamente.');
        }
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem('secure_client_auth');
      }
    }
    setLoading(false);

    // Set up token expiry checker
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [clientAuth]);

  return {
    clientAuth,
    loading,
    error,
    loginWithEmail,
    logout,
    setClientAuth
  };
};

// Helper function for email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
};
