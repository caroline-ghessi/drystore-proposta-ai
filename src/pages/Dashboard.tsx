import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dados mockados para demonstração
  const stats = [
    {
      title: 'Propostas Abertas',
      value: '12',
      change: '+2 esta semana',
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Propostas Aceitas',
      value: '8',
      change: '+3 este mês',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Taxa de Conversão',
      value: '67%',
      change: '+5% vs mês anterior',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Valor Total',
      value: 'R$ 485k',
      change: '+12% este mês',
      icon: FileText,
      color: 'text-purple-600'
    }
  ];

  const recentProposals = [
    {
      id: '1',
      client: 'João Silva',
      project: 'Residência Moderna',
      value: 'R$ 45.000',
      status: 'aberta',
      date: '2024-01-15'
    },
    {
      id: '2',
      client: 'Maria Santos',
      project: 'Cobertura Premium',
      value: 'R$ 78.000',
      status: 'aceita',
      date: '2024-01-14'
    },
    {
      id: '3',
      client: 'Carlos Oliveira',
      project: 'Casa de Campo',
      value: 'R$ 32.000',
      status: 'negada',
      date: '2024-01-13'
    },
    {
      id: '4',
      client: 'Ana Costa',
      project: 'Apartamento Duplex',
      value: 'R$ 56.000',
      status: 'expirada',
      date: '2024-01-12'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberta: { label: 'Em Aberto', variant: 'secondary' as const, icon: Clock },
      aceita: { label: 'Aceita', variant: 'default' as const, icon: CheckCircle },
      negada: { label: 'Negada', variant: 'destructive' as const, icon: XCircle },
      expirada: { label: 'Expirada', variant: 'outline' as const, icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">
              Aqui está um resumo das suas atividades
            </p>
          </div>
          <Button 
            onClick={() => navigate('/create-proposal')}
            className="gradient-bg hover:opacity-90 mt-4 sm:mt-0"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="animate-slide-in border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Proposals */}
        <Card className="border-0 shadow-md animate-slide-in">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Propostas Recentes</CardTitle>
                <CardDescription>
                  Suas últimas atividades de vendas
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/proposals')}
              >
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProposals.map((proposal) => (
                <div 
                  key={proposal.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/proposal/${proposal.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-drystore-blue rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{proposal.client}</p>
                      <p className="text-sm text-gray-600">{proposal.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{proposal.value}</p>
                      <p className="text-sm text-gray-500">{proposal.date}</p>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
