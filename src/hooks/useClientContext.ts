
import { useLocation } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';

export const useClientContext = () => {
  const location = useLocation();
  const { clientAuth } = useClientAuth();

  // Verificar se estamos em qualquer rota relacionada ao cliente
  const isClientRoute = 
    location.pathname.startsWith('/client') || 
    location.pathname === '/client-portal' ||
    location.pathname === '/client-login';

  // Verificar se temos autenticação de cliente ativa
  const isClientAuthenticated = !!clientAuth;

  // Considerar como contexto de cliente se:
  // 1. Estamos em uma rota de cliente, OU
  // 2. Temos autenticação de cliente ativa
  const isClient = isClientRoute || isClientAuthenticated;

  return {
    isClient,
    isClientRoute,
    isClientAuthenticated,
    clientAuth
  };
};
