
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const NavigationLinks = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-drystore-orange' : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100';
  };

  if (user?.role === 'cliente') {
    return null;
  }

  return (
    <div className="hidden lg:flex ml-8 space-x-6">
      <Link
        to="/proposals"
        className={`${isActive('/proposals')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
      >
        Propostas
      </Link>
      <Link
        to="/clients"
        className={`${isActive('/clients')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
      >
        Clientes
      </Link>
      <Link
        to="/products"
        className={`${isActive('/products')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
      >
        Produtos
      </Link>
      {(user?.role === 'vendedor_interno' || user?.role === 'representante' || user?.role === 'admin') && (
        <Link
          to="/smart-scheduler"
          className={`${isActive('/smart-scheduler')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
        >
          Agenda IA
        </Link>
      )}
      <Link
        to="/follow-up-manager"
        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors"
      >
        Follow-ups
      </Link>
      {user?.role === 'admin' && (
        <Link
          to="/admin/zapi-config"
          className={`${isActive('/admin/zapi-config')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
        >
          Config Z-API
        </Link>
      )}
    </div>
  );
};
