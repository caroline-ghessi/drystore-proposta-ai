
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { sessionTracker } from '@/services/sessionTracking';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendedor_interno' | 'representante' | 'cliente';
}

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser, retryCount = 0) => {
    try {
      console.log(`🔍 Carregando perfil do usuário ${supabaseUser.email} (tentativa ${retryCount + 1})`);
      
      // Timeout aumentado para 15 segundos
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile load timeout')), 15000);
      });

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error loading profile:', error);
        
        // Retry até 2 tentativas
        if (retryCount < 2) {
          console.log(`🔄 Tentando novamente carregar perfil em ${(retryCount + 1) * 2} segundos...`);
          setTimeout(() => {
            loadUserProfile(supabaseUser, retryCount + 1);
          }, (retryCount + 1) * 2000);
          return;
        }
      }

      const userData: User = {
        id: supabaseUser.id,
        name: profile?.nome || supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        role: profile?.role || 'vendedor_interno'
      };
      
      console.log(`✅ Perfil carregado com sucesso: ${userData.email} - Role: ${userData.role}`);
      setUser(userData);
      
      // Track activity em background (não bloqueia o login)
      setTimeout(() => {
        sessionTracker.trackActivity(userData.id);
      }, 0);

    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      
      // Retry até 2 tentativas
      if (retryCount < 2) {
        console.log(`🔄 Tentando novamente carregar perfil em ${(retryCount + 1) * 2} segundos...`);
        setTimeout(() => {
          loadUserProfile(supabaseUser, retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      }
      
      // Fallback: manter usuário existente se já tiver ou criar básico
      const currentUser = user;
      if (currentUser && currentUser.id === supabaseUser.id) {
        console.log(`⚠️ Mantendo dados do usuário existente: ${currentUser.email} - Role: ${currentUser.role}`);
        // Não sobrescrever o usuário atual se já temos dados válidos
        return;
      }
      
      console.log('⚠️ Criando usuário fallback com role vendedor_interno');
      const fallbackUser: User = {
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        role: 'vendedor_interno'
      };
      
      setUser(fallbackUser);
    }
  };

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, setUser, loading };
};
