import {
  Home, FileText, Users, Target, Settings, User, LogOut,
  BarChart3, PieChart, TrendingUp, Package, CheckCircle, Truck, 
  CreditCard, Brain, Zap, MessageSquare, Calendar, Trophy,
  Database, Bug, Download, Search, Briefcase, Bell, Shield, UserPlus
} from 'lucide-react';

export interface MenuItem {
  label: string;
  icon: any;
  path: string;
  show: boolean;
}

export const getMainNavItems = (userRole: string): MenuItem[] => [
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
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  }
];

export const getSalesToolsItems = (userRole: string): MenuItem[] => [
  {
    label: 'CRM Dashboard',
    icon: Briefcase,
    path: '/crm',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Follow-up Manager',
    icon: Bell,
    path: '/followup',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Agendador Inteligente',
    icon: Calendar,
    path: '/scheduler',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Gamificação',
    icon: Trophy,
    path: '/gamification',
    show: true
  }
];

export const getAnalyticsItems = (userRole: string): MenuItem[] => [
  {
    label: 'Analytics Dashboard',
    icon: BarChart3,
    path: '/analytics',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Relatórios',
    icon: PieChart,
    path: '/reports',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Exportação de Dados',
    icon: Download,
    path: '/admin/export-data',
    show: userRole === 'admin'
  }
];

export const getManagementItems = (userRole: string): MenuItem[] => [
  {
    label: 'Produtos',
    icon: Package,
    path: '/products',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Aprovações',
    icon: CheckCircle,
    path: '/approvals',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Controle de Entregas',
    icon: Truck,
    path: '/deliveries',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Opções de Pagamento',
    icon: CreditCard,
    path: '/payments',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  }
];

export const getAIItems = (userRole: string): MenuItem[] => [
  {
    label: 'Centro de IA',
    icon: Brain,
    path: '/ai-center',
    show: userRole === 'admin' || userRole === 'vendedor_interno'
  },
  {
    label: 'Prompt Tester',
    icon: MessageSquare,
    path: '/admin/prompt-tester',
    show: userRole === 'admin'
  },
  {
    label: 'Regras de Recomendação',
    icon: Zap,
    path: '/admin/recommendation-rules',
    show: userRole === 'admin'
  }
];

export const getAdminItems = (userRole: string): MenuItem[] => {
  return [
    { href: '/admin/security-management', label: 'Gerenciamento de Segurança', icon: Shield },
    { href: '/admin/content-management', label: 'Gestão de Conteúdo', icon: Settings },
    { href: '/sales-targets', label: 'Metas de Vendas', icon: Target },
    { href: '/user-registration', label: 'Cadastro de Usuários', icon: UserPlus },
    { href: '/admin/technical-debug', label: 'Debug Técnico', icon: Bug },
    { href: '/admin/recommendation-rules', label: 'Regras de Recomendação', icon: Zap },
    { href: '/admin/export-data', label: 'Exportar Dados', icon: Download },
    { href: '/admin/ai-prompt-tester', label: 'Testador de Prompts IA', icon: MessageSquare }
  ];
};

export const getAccountItems = (userRole: string): MenuItem[] => [
  {
    label: 'Perfil',
    icon: User,
    path: '/profile',
    show: true
  },
  {
    label: 'Configurações',
    icon: Settings,
    path: '/settings',
    show: userRole === 'admin'
  }
];
