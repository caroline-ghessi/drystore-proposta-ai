
import React, { createContext, useContext } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthLogin } from '@/hooks/useAuthLogin';
import { useRateLimit } from '@/hooks/useRateLimit';
import { getRedirectRoute } from '@/utils/authUtils';

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
  const { user, setUser, loading } = useAuthSession();
  const { login, logout: authLogout } = useAuthLogin();
  const { checkRateLimit } = useRateLimit();

  const logout = () => {
    authLogout();
    setUser(null);
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
