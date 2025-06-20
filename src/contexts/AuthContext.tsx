
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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        const userData: User = {
          id: supabaseUser.id,
          name: profile.nome,
          email: supabaseUser.email || '',
          role: profile.role
        };
        
        setUser(userData);
        
        // Track activity para usuário já logado
        sessionTracker.trackActivity(userData.id);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const checkRateLimit = async (identifier: string): Promise<boolean> => {
    try {
      const { data: rateLimit } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .single();

      if (rateLimit) {
        const now = new Date();
        const blockedUntil = rateLimit.blocked_until ? new Date(rateLimit.blocked_until) : null;
        
        if (blockedUntil && blockedUntil > now) {
          return false; // Still blocked
        }

        if (rateLimit.attempt_count >= 5) {
          // Block for 15 minutes after 5 failed attempts
          const blockUntil = new Date(now.getTime() + 15 * 60 * 1000);
          await supabase
            .from('auth_rate_limits')
            .update({ 
              blocked_until: blockUntil.toISOString(),
              attempt_count: rateLimit.attempt_count + 1,
              last_attempt: now.toISOString()
            })
            .eq('identifier', identifier);
          return false;
        }
      }
      
      return true; // Not rate limited
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow on error
    }
  };

  const updateRateLimit = async (identifier: string, success: boolean) => {
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
          await supabase
            .from('auth_rate_limits')
            .update({
              attempt_count: existing.attempt_count + 1,
              last_attempt: now.toISOString()
            })
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
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate email format
      const { data: isValidEmail } = await supabase
        .rpc('validate_email_format', { email_input: email });

      if (!isValidEmail) {
        return { success: false, error: 'Formato de email inválido' };
      }

      // Check rate limiting
      const isAllowed = await checkRateLimit(email);
      if (!isAllowed) {
        return { success: false, error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        await updateRateLimit(email, false);
        
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha inválidos' };
        }
        
        return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        await updateRateLimit(email, true);
        
        // Track login session
        await sessionTracker.trackLogin(data.user.id, data.user.email || '');
        
        return { success: true };
      }

      return { success: false, error: 'Erro inesperado durante o login' };
    } catch (error) {
      console.error('Login error:', error);
      await updateRateLimit(email, false);
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
