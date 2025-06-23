
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

  const logClientAccessAttempt = async (email: string, success: boolean, clientId?: string) => {
    try {
      const { error } = await supabase.rpc('log_client_access_attempt', {
        client_email: email,
        success: success,
        client_id: clientId || null
      });
      
      if (error) {
        console.error('Erro ao fazer log da tentativa de acesso:', error);
      }
    } catch (error) {
      console.error('Erro inesperado no log de acesso:', error);
    }
  };

  const validateClientEmail = async (email: string): Promise<{ isValid: boolean; client?: any }> => {
    try {
      console.log('🔍 [DEBUG] Validating client email:', email);
      
      const { data: client, error } = await supabase
        .from('clients')
        .select('id, nome, email, empresa, telefone')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('❌ [DEBUG] Erro na consulta do cliente:', error);
        await logClientAccessAttempt(email, false);
        return { isValid: false };
      }

      if (!client) {
        console.log('❌ [DEBUG] Cliente não encontrado para email:', email);
        await logClientAccessAttempt(email, false);
        return { isValid: false };
      }

      console.log('✅ [DEBUG] Cliente encontrado:', client);
      await logClientAccessAttempt(email, true, client.id);
      return { isValid: true, client };
    } catch (error) {
      console.error('❌ [DEBUG] Erro inesperado ao validar email do cliente:', error);
      await logClientAccessAttempt(email, false);
      return { isValid: false };
    }
  };

  const loginWithEmail = async (email: string): Promise<{ success: boolean; client?: any }> => {
    console.log('🚀 [DEBUG] Iniciando login com email:', email);
    
    const validation = await validateClientEmail(email);
    
    if (validation.isValid && validation.client) {
      const auth: ClientAuth = {
        email,
        isValid: true,
        clientId: validation.client.id
      };
      
      console.log('✅ [DEBUG] Definindo clientAuth:', auth);
      setClientAuth(auth);
      localStorage.setItem('client_auth', JSON.stringify(auth));
      
      return { success: true, client: validation.client };
    }
    
    console.log('❌ [DEBUG] Login falhou para email:', email);
    return { success: false };
  };

  const logout = () => {
    console.log('🔓 [DEBUG] Fazendo logout do cliente');
    setClientAuth(null);
    localStorage.removeItem('client_auth');
  };

  useEffect(() => {
    console.log('🔄 [DEBUG] Verificando autenticação salva no localStorage');
    
    // Verificar autenticação salva no localStorage
    const savedAuth = localStorage.getItem('client_auth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        console.log('✅ [DEBUG] Autenticação encontrada no localStorage:', auth);
        setClientAuth(auth);
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao carregar autenticação salva:', error);
        localStorage.removeItem('client_auth');
      }
    } else {
      console.log('❌ [DEBUG] Nenhuma autenticação encontrada no localStorage');
    }
    setLoading(false);
  }, []);

  // Log sempre que clientAuth mudar
  useEffect(() => {
    console.log('🔄 [DEBUG] ClientAuth atualizado:', clientAuth);
  }, [clientAuth]);

  return {
    clientAuth,
    loading,
    loginWithEmail,
    logout,
    setClientAuth
  };
};
