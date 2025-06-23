
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientAuth {
  email: string;
  isValid: boolean;
  clientId: string;
}

export const useClientAuth = () => {
  const [clientAuth, setClientAuth] = useState<ClientAuth | null>(null);
  const [loading, setLoading] = useState(true);

  const validateClientEmail = async (email: string): Promise<{ isValid: boolean; client?: any }> => {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('id, nome, email, empresa, telefone')
        .eq('email', email)
        .single();

      if (error || !client) {
        console.log('Cliente não encontrado:', error);
        return { isValid: false };
      }

      return { isValid: true, client };
    } catch (error) {
      console.error('Erro ao validar email do cliente:', error);
      return { isValid: false };
    }
  };

  const loginWithEmail = async (email: string): Promise<{ success: boolean; client?: any }> => {
    const validation = await validateClientEmail(email);
    
    if (validation.isValid && validation.client) {
      const auth: ClientAuth = {
        email,
        isValid: true,
        clientId: validation.client.id
      };
      
      setClientAuth(auth);
      localStorage.setItem('client_auth', JSON.stringify(auth));
      
      return { success: true, client: validation.client };
    }
    
    return { success: false };
  };

  const logout = () => {
    setClientAuth(null);
    localStorage.removeItem('client_auth');
  };

  useEffect(() => {
    // Verificar autenticação salva no localStorage
    const savedAuth = localStorage.getItem('client_auth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        setClientAuth(auth);
      } catch (error) {
        console.error('Erro ao carregar autenticação salva:', error);
        localStorage.removeItem('client_auth');
      }
    }
    setLoading(false);
  }, []);

  return {
    clientAuth,
    loading,
    loginWithEmail,
    logout,
    setClientAuth
  };
};
