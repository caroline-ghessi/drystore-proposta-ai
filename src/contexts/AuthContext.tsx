
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { sessionTracker } from '@/services/sessionTracking';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendedor_interno' | 'representante' | 'cliente';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  checkRateLimit: (identifier: string) => Promise<boolean>;
  getRedirectRoute: (userRole: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Timeout de 5 segundos para carregamento do perfil
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile load timeout')), 5000);
      });

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading profile:', error);
        // Continuar com dados básicos se profile não carregar
      }

      const userData: User = {
        id: supabaseUser.id,
        name: profile?.nome || supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        role: profile?.role || 'vendedor_interno'
      };
      
      setUser(userData);
      
      // Track activity em background (não bloqueia o login)
      setTimeout(() => {
        sessionTracker.trackActivity(userData.id);
      }, 0);

    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Fallback: criar usuário básico mesmo se profile falhar
      const fallbackUser: User = {
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        role: 'vendedor_interno'
      };
      
      setUser(fallbackUser);
    }
  };

  const checkRateLimit = async (identifier: string): Promise<boolean> => {
    try {
      // Simplified rate limiting - only check if blocked
      const { data: rateLimit } = await supabase
        .from('auth_rate_limits')
        .select('blocked_until')
        .eq('identifier', identifier)
        .single();

      if (rateLimit?.blocked_until) {
        const blockedUntil = new Date(rateLimit.blocked_until);
        const now = new Date();
        return blockedUntil <= now; // Not blocked if time has passed
      }
      
      return true; // Allow if no rate limit record
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow on error
    }
  };

  const updateRateLimit = async (identifier: string, success: boolean) => {
    // Move to background - don't block login flow
    setTimeout(async () => {
      try {
        const now = new Date();
        
        if (success) {
          // Reset rate limit on successful login
          await supabase
            .from('auth_rate_limits')
            .delete()
            .eq('identifier', identifier);
        } else {
          // Increment failed attempts
          const { data: existing } = await supabase
            .from('auth_rate_limits')
            .select('*')
            .eq('identifier', identifier)
            .single();

          if (existing) {
            const newCount = existing.attempt_count + 1;
            const updateData: any = {
              attempt_count: newCount,
              last_attempt: now.toISOString()
            };

            // Block after 5 attempts
            if (newCount >= 5) {
              updateData.blocked_until = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
            }

            await supabase
              .from('auth_rate_limits')
              .update(updateData)
              .eq('identifier', identifier);
          } else {
            await supabase
              .from('auth_rate_limits')
              .insert({
                identifier,
                attempt_count: 1,
                first_attempt: now.toISOString(),
                last_attempt: now.toISOString()
              });
          }
        }
      } catch (error) {
        console.error('Error updating rate limit:', error);
      }
    }, 0);
  };

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
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Função para obter a rota de redirecionamento baseada na role
  const getRedirectRoute = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return '/dashboard';
      case 'vendedor_interno':
        return '/dashboard';
      case 'representante':
        return '/dashboard';
      case 'cliente':
        return '/client-portal';
      default:
        return '/dashboard';
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    checkRateLimit,
    getRedirectRoute
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
