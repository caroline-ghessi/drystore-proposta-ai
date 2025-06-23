
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
    console.log('🚀 [DEBUG] === INICIANDO LOGIN ===');
    console.log('🚀 [DEBUG] Email para login:', email);
    console.log('🚀 [DEBUG] URL atual:', window.location.href);
    
    const validation = await validateClientEmail(email);
    
    if (validation.isValid && validation.client) {
      const auth: ClientAuth = {
        email,
        isValid: true,
        clientId: validation.client.id
      };
      
      console.log('✅ [DEBUG] === LOGIN SUCESSO ===');
      console.log('✅ [DEBUG] Definindo clientAuth:', auth);
      console.log('✅ [DEBUG] Cliente encontrado:', validation.client);
      
      setClientAuth(auth);
      localStorage.setItem('client_auth', JSON.stringify(auth));
      
      console.log('✅ [DEBUG] Auth salvo no localStorage');
      console.log('✅ [DEBUG] Estado clientAuth atualizado');
      
      return { success: true, client: validation.client };
    }
    
    console.log('❌ [DEBUG] === LOGIN FALHOU ===');
    console.log('❌ [DEBUG] Validation result:', validation);
    return { success: false };
  };

  const logout = () => {
    console.log('🔓 [DEBUG] === FAZENDO LOGOUT ===');
    setClientAuth(null);
    localStorage.removeItem('client_auth');
    console.log('🔓 [DEBUG] Auth removido e estado limpo');
  };

  useEffect(() => {
    console.log('🔄 [DEBUG] === INICIALIZANDO useClientAuth ===');
    console.log('🔄 [DEBUG] URL atual:', window.location.href);
    
    // Verificar autenticação salva no localStorage
    const savedAuth = localStorage.getItem('client_auth');
    console.log('🔄 [DEBUG] Auth salvo encontrado:', savedAuth);
    
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        console.log('✅ [DEBUG] Auth parseado com sucesso:', auth);
        setClientAuth(auth);
        console.log('✅ [DEBUG] Estado clientAuth restaurado');
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao carregar autenticação salva:', error);
        localStorage.removeItem('client_auth');
      }
    } else {
      console.log('❌ [DEBUG] Nenhuma autenticação encontrada no localStorage');
    }
    setLoading(false);
    console.log('🔄 [DEBUG] === useClientAuth INICIALIZADO ===');
  }, []);

  // Log sempre que clientAuth mudar
  useEffect(() => {
    console.log('🔄 [DEBUG] === CLIENT AUTH MUDOU ===');
    console.log('🔄 [DEBUG] Novo valor de clientAuth:', clientAuth);
    console.log('🔄 [DEBUG] URL atual:', window.location.href);
  }, [clientAuth]);

  return {
    clientAuth,
    loading,
    loginWithEmail,
    logout,
    setClientAuth
  };
};
