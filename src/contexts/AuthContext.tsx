
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
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
    // Simular verificação de token/sessão
    const savedUser = localStorage.getItem('drystore_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Track activity para usuário já logado
      sessionTracker.trackActivity(userData.id);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulação de login - aceita qualquer email/senha válida
    if (email && password) {
      const userData: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'admin' : 'vendedor_interno'
      };
      
      setUser(userData);
      localStorage.setItem('drystore_user', JSON.stringify(userData));
      
      // Track login session
      await sessionTracker.trackLogin(userData.id, userData.email);
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('drystore_user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
