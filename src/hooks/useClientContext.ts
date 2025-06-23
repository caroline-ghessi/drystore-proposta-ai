
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ClientContext {
  isClient: boolean;
  isVendor: boolean;
  clientAuth: any;
}

export const useClientContext = (): ClientContext => {
  const { user } = useAuth();
  const [clientAuth, setClientAuth] = useState<any>(null);

  useEffect(() => {
    // Verificar se há autenticação de cliente no localStorage
    const savedClientAuth = localStorage.getItem('client_auth');
    if (savedClientAuth) {
      try {
        setClientAuth(JSON.parse(savedClientAuth));
      } catch (error) {
        console.error('Erro ao carregar autenticação do cliente:', error);
      }
    }
  }, []);

  const isClient = !!clientAuth && !user;
  const isVendor = !!user && !clientAuth;

  return {
    isClient,
    isVendor,
    clientAuth
  };
};
