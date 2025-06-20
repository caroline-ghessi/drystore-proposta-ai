
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const NavigationLinks = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-drystore-orange' : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100';
  };

  if (user?.role === 'cliente') {
    return null;
  }

  const mainLinks = [
    { path: '/proposals', label: 'Propostas' },
    { path: '/clients', label: 'Clientes' },
    { path: '/products', label: 'Produtos' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/crm', label: 'CRM' },
    { path: '/gamification', label: '🏆 Ranking' },
  ];

  const conditionalLinks = [];
  
  if (user?.role === 'vendedor_interno' || user?.role === 'representante' || user?.role === 'admin') {
    conditionalLinks.push({ path: '/smart-scheduler', label: 'Agenda IA' });
  }
  
  conditionalLinks.push({ path: '/follow-up-manager', label: 'Follow-ups' });

  const adminOnlyLinks = [];
  if (user?.role === 'admin') {
    adminOnlyLinks.push(
      { path: '/ai-center', label: '🤖 IA Center' },
      { path: '/reports', label: '📊 Relatórios' },
      { path: '/approval-workflow', label: '🔄 Aprovações' },
      { path: '/user-registration', label: '👥 Cadastrar Usuários' },
      { path: '/admin/zapi-config', label: 'Config Z-API' }
    );
  }

  // For admin users, we'll show main links + some conditional links normally,
  // and put admin-only links in a dropdown
  const isAdmin = user?.role === 'admin';

  return (
    <div className="hidden lg:flex ml-8 items-center">
      {/* Main navigation links with consistent spacing */}
      <div className="flex items-center space-x-6">
        {mainLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`${isActive(link.path)} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
          >
            {link.label}
          </Link>
        ))}
        
        {conditionalLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`${isActive(link.path)} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Admin dropdown menu with proper spacing */}
      {isAdmin && adminOnlyLinks.length > 0 && (
        <div className="ml-6 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-3 py-2 text-sm font-medium admin-dropdown-button"
              >
                Admin
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              {adminOnlyLinks.map((link) => (
                <DropdownMenuItem key={link.path} asChild>
                  <Link
                    to={link.path}
                    className={`w-full ${location.pathname === link.path ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
