
import { supabase } from '@/integrations/supabase/client';
import { sessionTracker } from '@/services/sessionTracking';
import { useRateLimit } from './useRateLimit';

export const useAuthLogin = () => {
  const { checkRateLimit, updateRateLimit } = useRateLimit();

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Quick rate limit check
      const isAllowed = await checkRateLimit(email);
      if (!isAllowed) {
        return { success: false, error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' };
      }

      // Main login call
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        updateRateLimit(email, false);
        
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha inválidos' };
        }
        
        return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
      }

      if (data.user) {
        // Update rate limit in background
        updateRateLimit(email, true);
        
        // Track login in background
        setTimeout(() => {
          sessionTracker.trackLogin(data.user.id, data.user.email || '');
        }, 0);
        
        return { success: true };
      }

      return { success: false, error: 'Erro inesperado durante o login' };
    } catch (error) {
      console.error('Login error:', error);
      updateRateLimit(email, false);
      return { success: false, error: 'Erro inesperado. Tente novamente.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { login, logout };
};
