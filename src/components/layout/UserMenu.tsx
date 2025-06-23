
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from 'lucide-react';
import { MenuTrigger } from './menu/MenuTrigger';
import { MenuSection } from './menu/MenuSection';
import {
  getMainNavItems,
  getSalesToolsItems,
  getAnalyticsItems,
  getManagementItems,
  getAIItems,
  getAdminItems,
  getAccountItems
} from './menu/MenuData';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userRole = user?.role || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuTrigger />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-[80vh] overflow-y-auto"
        sideOffset={5}
      >
        <MenuSection 
          title="Navegação Principal" 
          items={getMainNavItems(userRole)} 
        />
        
        <MenuSection 
          title="Ferramentas de Vendas" 
          items={getSalesToolsItems(userRole)} 
        />
        
        <MenuSection 
          title="Analytics & Relatórios" 
          items={getAnalyticsItems(userRole)} 
        />
        
        <MenuSection 
          title="Gerenciamento" 
          items={getManagementItems(userRole)} 
        />
        
        <MenuSection 
          title="IA & Automação" 
          items={getAIItems(userRole)} 
        />
        
        <MenuSection 
          title="Administração" 
          items={getAdminItems(userRole)}
          showSection={user?.role === 'admin'} 
        />
        
        <MenuSection 
          title="Minha Conta" 
          items={getAccountItems(userRole)} 
        />
        
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
