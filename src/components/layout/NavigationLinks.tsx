
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Home, FileText, Users, Settings, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavigationLinks = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="hidden lg:flex items-center space-x-1">
      <Link
        to="/dashboard"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          location.pathname === '/dashboard'
            ? "bg-drystore-blue text-white"
            : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
        )}
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>

      <Link
        to="/proposals"
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          location.pathname === '/proposals'
            ? "bg-drystore-blue text-white"
            : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
        )}
      >
        <FileText className="w-4 h-4" />
        <span>Propostas</span>
      </Link>

      {(user?.role === 'admin' || user?.role === 'vendedor_interno') && (
        <Link
          to="/clients"
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === '/clients'
              ? "bg-drystore-blue text-white"
              : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Clientes</span>
        </Link>
      )}

      {(user?.role === 'admin') && (
        <Link
          to="/sales-targets"
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === '/sales-targets'
              ? "bg-drystore-blue text-white"
              : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
          )}
        >
          <Target className="w-4 h-4" />
          <span>Metas de Vendas</span>
        </Link>
      )}

      {(user?.role === 'admin') && (
        <Link
          to="/settings"
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === '/settings'
              ? "bg-drystore-blue text-white"
              : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </Link>
      )}
    </div>
  );
};

export default NavigationLinks;
