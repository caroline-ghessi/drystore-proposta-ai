
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MotivationDisplay } from '@/components/motivation/MotivationDisplay';
import { AdminMotivationPanel } from '@/components/motivation/AdminMotivationPanel';
import { useState, useEffect, useMemo } from 'react';
import { useProposals } from '@/hooks/useProposals';

interface RealProposal {
  id: string;
  client: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  timestamp: number;
  source: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [realProposals, setRealProposals] = useState<RealProposal[]>([]);
  
  // Buscar propostas reais do Supabase
  const { data: supabaseProposals, isLoading, error } = useProposals();

  // Carregar propostas reais do sessionStorage
  useEffect(() => {
    const loadRealProposals = () => {
      const savedData = sessionStorage.getItem('proposalExtractedData');
      if (savedData) {
        try {
          const extractedData = JSON.parse(savedData);
          if (extractedData.timestamp && extractedData.items) {
            setRealProposals([extractedData]);
            console.log('📋 Dashboard: Proposta real carregada:', extractedData);
          }
        } catch (error) {
          console.error('❌ Dashboard: Erro ao carregar proposta real:', error);
        }
      }
    };

    loadRealProposals();
  }, []);

  // Combinar e processar propostas
  const allProposals = useMemo(() => {
    const sessionProposals = realProposals.map(realProposal => ({
      id: realProposal.id,
      client: realProposal.client || 'PROPOSTA COMERCIAL',
      project: 'Proposta Extraída do PDF',
      value: `R$ ${realProposal.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      status: 'aberta',
      date: new Date(realProposal.timestamp).toLocaleDateString('pt-BR'),
      isFromSession: true
    }));

    const dbProposals = (supabaseProposals || []).map(proposal => ({
      id: proposal.id,
      client: proposal.clients?.nome || 'Cliente',
      project: 'Proposta Comercial',
      value: `R$ ${(proposal.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      status: proposal.status === 'draft' ? 'aberta' : 
              proposal.status === 'accepted' ? 'aceita' :
              proposal.status === 'rejected' ? 'negada' : 'aberta',
      date: new Date(proposal.created_at).toLocaleDateString('pt-BR'),
      isFromSession: false
    }));

    return [...sessionProposals, ...dbProposals];
  }, [realProposals, supabaseProposals]);

  // Calcular estatísticas reais
  const stats = useMemo(() => {
    const dbProposals = supabaseProposals || [];
    const openProposals = dbProposals.filter(p => ['draft', 'sent', 'viewed'].includes(p.status)).length + realProposals.length;
    const acceptedProposals = dbProposals.filter(p => p.status === 'accepted').length;
    const totalValue = dbProposals.reduce((sum, p) => sum + (p.valor_total || 0), 0) + realProposals.reduce((sum, p) => sum + p.total, 0);
    const conversionRate = dbProposals.length > 0 ? Math.round((acceptedProposals / dbProposals.length) * 100) : 67;

    return [
      {
        title: 'Propostas Abertas',
        value: String(openProposals),
        change: realProposals.length > 0 ? `+${realProposals.length} nova(s)` : '+0 esta semana',
        icon: Clock,
        color: 'text-yellow-600'
      },
      {
        title: 'Propostas Aceitas',
        value: String(acceptedProposals),
        change: '+3 este mês',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        title: 'Taxa de Conversão',
        value: `${conversionRate}%`,
        change: '+5% vs mês anterior',
        icon: TrendingUp,
        color: 'text-blue-600'
      },
      {
        title: 'Valor Total',
        value: `R$ ${Math.round(totalValue / 1000)}k`,
        change: realProposals.length > 0 ? '+17k nova proposta' : '+12% este mês',
        icon: FileText,
        color: 'text-purple-600'
      }
    ];
  }, [supabaseProposals, realProposals]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberta: {
        label: 'Em Aberto',
        variant: 'secondary' as const,
        icon: Clock
      },
      aceita: {
        label: 'Aceita',
        variant: 'default' as const,
        icon: CheckCircle
      },
      negada: {
        label: 'Negada',
        variant: 'destructive' as const,
        icon: XCircle
      },
      expirada: {
        label: 'Expirada',
        variant: 'outline' as const,
        icon: AlertCircle
      }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>;
  };

  if (isLoading) {
    return (
      <Layout showBackButton={false}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('❌ Dashboard: Erro ao carregar propostas:', error);
  }

  return (
    <Layout showBackButton={false}>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Olá, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
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

        {/* Admin Motivation Panel */}
        {user?.role === 'admin' && (
          <div className="mb-8">
            <AdminMotivationPanel />
          </div>
        )}

        {/* Motivation Display for all users */}
        {user?.role !== 'cliente' && (
          <div className="mb-8">
            <MotivationDisplay />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="animate-slide-in border-0 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-700 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Proposals */}
        <Card className="border-0 shadow-md animate-slide-in bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Propostas Recentes</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Suas últimas atividades de vendas
                  {(supabaseProposals?.length || 0) > 0 && (
                    <span className="ml-2 text-green-600 font-medium">
                      • {supabaseProposals?.length} proposta(s) no sistema
                    </span>
                  )}
                  {realProposals.length > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      • {realProposals.length} nova(s) do PDF
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/proposals')} className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allProposals.length > 0 ? (
                allProposals.slice(0, 5).map(proposal => (
                  <div 
                    key={proposal.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer" 
                    onClick={() => navigate(`/proposal/${proposal.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-drystore-blue rounded-full flex items-center justify-center bg-orange-600">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{proposal.client}</p>
                          {proposal.isFromSession && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              PDF
                            </Badge>
                          )}
                          {!proposal.isFromSession && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Sistema
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{proposal.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{proposal.value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{proposal.date}</p>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhuma proposta encontrada</p>
                  <Button 
                    onClick={() => navigate('/create-proposal')}
                    className="gradient-bg hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Proposta
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
