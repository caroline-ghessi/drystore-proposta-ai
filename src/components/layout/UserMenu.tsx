
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { 
  Home, FileText, Users, Target, Settings, User, LogOut, Menu,
  BarChart3, PieChart, TrendingUp, Package, CheckCircle, Truck, 
  CreditCard, Brain, Zap, MessageSquare, Calendar, Trophy,
  Database, Bug, Download, Search, Briefcase, Bell
} from 'lucide-react';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navegação Principal
  const mainNavItems = [
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
    }
  ];

  // Ferramentas de Vendas
  const salesToolsItems = [
    {
      label: 'CRM Dashboard',
      icon: Briefcase,
      path: '/crm',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Follow-up Manager',
      icon: Bell,
      path: '/followup',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Agendador Inteligente',
      icon: Calendar,
      path: '/scheduler',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Gamificação',
      icon: Trophy,
      path: '/gamification',
      show: true
    }
  ];

  // Analytics & Relatórios
  const analyticsItems = [
    {
      label: 'Analytics Dashboard',
      icon: BarChart3,
      path: '/analytics',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Relatórios',
      icon: PieChart,
      path: '/reports',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Exportação de Dados',
      icon: Download,
      path: '/admin/export-data',
      show: user?.role === 'admin'
    }
  ];

  // Gerenciamento
  const managementItems = [
    {
      label: 'Produtos',
      icon: Package,
      path: '/products',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Aprovações',
      icon: CheckCircle,
      path: '/approvals',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Controle de Entregas',
      icon: Truck,
      path: '/deliveries',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Opções de Pagamento',
      icon: CreditCard,
      path: '/payments',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    }
  ];

  // IA & Automação
  const aiItems = [
    {
      label: 'Centro de IA',
      icon: Brain,
      path: '/ai-center',
      show: user?.role === 'admin' || user?.role === 'vendedor_interno'
    },
    {
      label: 'Prompt Tester',
      icon: MessageSquare,
      path: '/admin/prompt-tester',
      show: user?.role === 'admin'
    },
    {
      label: 'Regras de Recomendação',
      icon: Zap,
      path: '/admin/recommendation-rules',
      show: user?.role === 'admin'
    }
  ];

  // Administração (apenas admin)
  const adminItems = [
    {
      label: 'Metas de Vendas',
      icon: Target,
      path: '/sales-targets',
      show: user?.role === 'admin'
    },
    {
      label: 'Debug Técnico',
      icon: Bug,
      path: '/admin/debug',
      show: user?.role === 'admin'
    }
  ];

  const renderMenuItems = (items: any[]) => {
    return items.map((item) => (
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
    ));
  };

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
        className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-[80vh] overflow-y-auto"
        sideOffset={5}
      >
        {/* Navegação Principal */}
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Navegação Principal</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        {renderMenuItems(mainNavItems)}
        
        {/* Ferramentas de Vendas */}
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Ferramentas de Vendas</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        {renderMenuItems(salesToolsItems)}
        
        {/* Analytics & Relatórios */}
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Analytics & Relatórios</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        {renderMenuItems(analyticsItems)}
        
        {/* Gerenciamento */}
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Gerenciamento</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        {renderMenuItems(managementItems)}
        
        {/* IA & Automação */}
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">IA & Automação</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        {renderMenuItems(aiItems)}
        
        {/* Administração (apenas admin) */}
        {user?.role === 'admin' && (
          <>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Administração</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            {renderMenuItems(adminItems)}
          </>
        )}
        
        {/* Configurações e Conta */}
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        
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
