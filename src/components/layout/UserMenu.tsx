

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Home, FileText, Users, Target, Settings, User, LogOut, Menu } from 'lucide-react';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      show: true
    },
    {
      label: 'Propostas',
      icon: FileText,
      path: '/proposals',
      show: true
    },
    {
      label: 'Clientes',
      icon: Users,
      path: '/clients',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Metas de Vendas',
      icon: Target,
      path: '/sales-targets',
      show: user?.role === 'admin'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer">
          {/* Menu Icon with Text - Desktop */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-4 h-4 mr-1" />
            <span>Menu</span>
          </Button>
          
          {/* Menu Icon Only - Mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Menu</span>
          </Button>
          
          {/* Avatar */}
          <Button variant="ghost" className="h-8 w-8 p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Navegação</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        
        {/* Navigation Items */}
        {menuItems.map((item) => (
          item.show && (
            <DropdownMenuItem 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center space-x-2 cursor-pointer ${
                location.pathname === item.path 
                  ? 'bg-drystore-blue text-white' 
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          )
        ))}
        
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        
        {/* Account Section */}
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Minha Conta</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        
        {user?.role === 'admin' && (
          <DropdownMenuItem 
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        )}
        
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

