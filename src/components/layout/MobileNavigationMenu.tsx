
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavigationMenuProps {
  isMenuOpen: boolean;
  onMenuClose: () => void;
}

export const MobileNavigationMenu = ({ isMenuOpen, onMenuClose }: MobileNavigationMenuProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-drystore-orange' : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100';
  };

  if (!isMenuOpen || user?.role === 'cliente') {
    return null;
  }

  return (
    <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 bg-white dark:bg-gray-800">
      <div className="flex flex-col space-y-2">
        <Link
          to="/proposals"
          className={`${isActive('/proposals')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
          onClick={onMenuClose}
        >
          Propostas
        </Link>
        <Link
          to="/clients"
          className={`${isActive('/clients')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
          onClick={onMenuClose}
        >
          Clientes
        </Link>
        <Link
          to="/products"
          className={`${isActive('/products')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
          onClick={onMenuClose}
        >
          Produtos
        </Link>
        {(user?.role === 'vendedor_interno' || user?.role === 'representante' || user?.role === 'admin') && (
          <Link
            to="/smart-scheduler"
            className={`${isActive('/smart-scheduler')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
            onClick={onMenuClose}
          >
            Agenda IA
          </Link>
        )}
        <Link
          to="/follow-up-manager"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium block transition-colors"
          onClick={onMenuClose}
        >
          Follow-ups WhatsApp
        </Link>
        {user?.role === 'admin' && (
          <Link
            to="/admin/zapi-config"
            className={`${isActive('/admin/zapi-config')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
            onClick={onMenuClose}
          >
            Config Z-API
          </Link>
        )}
      </div>
    </div>
  );
};
