
import { useState, useEffect } from 'react';
import { ClientAuth } from '@/types/auth';

export const useClientAuth = () => {
  const [clientAuth, setClientAuth] = useState<ClientAuth | null>(null);
  const [loading, setLoading] = useState(true);

  const generateMagicLink = async (email: string): Promise<boolean> => {
    try {
      // Simular geração de token JWT
      const token = btoa(JSON.stringify({
        email,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      }));
      
      // Simular envio de email
      console.log(`Magic link enviado para ${email}: /client-portal?token=${token}`);
      
      // Em produção, aqui faria a chamada para API de envio de email
      return true;
    } catch (error) {
      console.error('Erro ao gerar magic link:', error);
      return false;
    }
  };

  const validateToken = (token: string): ClientAuth | null => {
    try {
      const decoded = JSON.parse(atob(token));
      const isValid = Date.now() < decoded.expires;
      
      return {
        email: decoded.email,
        token,
        expiresAt: new Date(decoded.expires).toISOString(),
        isValid
      };
    } catch (error) {
      console.error('Token inválido:', error);
      return null;
    }
  };

  const logout = () => {
    setClientAuth(null);
    localStorage.removeItem('client_auth');
  };

  useEffect(() => {
    // Verificar token salvo no localStorage
    const savedAuth = localStorage.getItem('client_auth');
    if (savedAuth) {
      const auth = JSON.parse(savedAuth);
      if (Date.now() < new Date(auth.expiresAt).getTime()) {
        setClientAuth(auth);
      } else {
        localStorage.removeItem('client_auth');
      }
    }
    setLoading(false);
  }, []);

  return {
    clientAuth,
    loading,
    generateMagicLink,
    validateToken,
    logout,
    setClientAuth
  };
};
