
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Menu, FileText, Users, Package, BarChart3, MessageSquare, Trophy, Calendar, ArrowUpRight, Bot, ClipboardList, UserPlus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const NavigationLinks = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role === 'cliente') {
    return null;
  }

  const mainLinks = [
    { path: '/proposals', label: 'Propostas', icon: FileText },
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/products', label: 'Produtos', icon: Package },
  ];

  const analyticsLinks = [
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/crm', label: 'CRM', icon: MessageSquare },
  ];

  const toolsLinks = [
    { path: '/gamification', label: '🏆 Ranking', icon: Trophy },
  ];

  const conditionalLinks = [];
  if (user?.role === 'vendedor_interno' || user?.role === 'representante' || user?.role === 'admin') {
    conditionalLinks.push({ path: '/smart-scheduler', label: 'Agenda IA', icon: Calendar });
  }
  conditionalLinks.push({ path: '/follow-up-manager', label: 'Follow-ups', icon: ArrowUpRight });

  const adminLinks = [];
  if (user?.role === 'admin') {
    adminLinks.push(
      { path: '/ai-center', label: '🤖 IA Center', icon: Bot },
      { path: '/reports', label: '📊 Relatórios', icon: ClipboardList },
      { path: '/approval-workflow', label: '🔄 Aprovações', icon: ClipboardList },
      { path: '/user-registration', label: '👥 Cadastrar Usuários', icon: UserPlus },
      { path: '/admin/zapi-config', label: 'Config Z-API', icon: Settings }
    );
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="hidden lg:flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-4 py-2 text-sm font-medium"
          >
            <Menu className="mr-2 h-4 w-4" />
            Menu
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          {/* Main Navigation */}
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <DropdownMenuItem key={link.path} asChild>
                <Link
                  to={link.path}
                  className={`w-full flex items-center ${isActive(link.path) ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : ''}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          
          {/* Analytics Section */}
          {analyticsLinks.map((link) => {
            const Icon = link.icon;
            return (
              <DropdownMenuItem key={link.path} asChild>
                <Link
                  to={link.path}
                  className={`w-full flex items-center ${isActive(link.path) ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : ''}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          
          {/* Tools Section */}
          {toolsLinks.map((link) => {
            const Icon = link.icon;
            return (
              <DropdownMenuItem key={link.path} asChild>
                <Link
                  to={link.path}
                  className={`w-full flex items-center ${isActive(link.path) ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : ''}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          
          {/* Conditional Links */}
          {conditionalLinks.length > 0 && (
            <>
              {conditionalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link
                      to={link.path}
                      className={`w-full flex items-center ${isActive(link.path) ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : ''}`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
          
          {/* Admin Section */}
          {adminLinks.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link
                      to={link.path}
                      className={`w-full flex items-center ${isActive(link.path) ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : ''}`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
