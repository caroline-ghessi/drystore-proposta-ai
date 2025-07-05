import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalPaineis: number;
  paineisAtivos: number;
  totalInversores: number;
  inversoresAtivos: number;
  propostas30Dias: number;
  valorTotal30Dias: number;
  produtosMaisUsados: Array<{
    nome: string;
    fabricante: string;
    uso: number;
  }>;
  margemMedia: number;
}

export const SolarDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas dos painéis
      const { data: paineis } = await supabase
        .from('paineis_solares')
        .select('ativo');

      // Carregar estatísticas dos inversores
      const { data: inversores } = await supabase
        .from('inversores_solares')
        .select('ativo');

      // Carregar propostas dos últimos 30 dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      
      const { data: propostas } = await supabase
        .from('proposals')
        .select('valor_total, created_at')
        .eq('product_group', 'energia_solar')
        .gte('created_at', dataLimite.toISOString());

      // Carregar configurações para margem
      const { data: config } = await supabase
        .from('energia_solar_configuracoes')
        .select('margem_comercial')
        .eq('ativo', true)
        .single();

      const dashboardStats: DashboardStats = {
        totalPaineis: paineis?.length || 0,
        paineisAtivos: paineis?.filter(p => p.ativo).length || 0,
        totalInversores: inversores?.length || 0,
        inversoresAtivos: inversores?.filter(i => i.ativo).length || 0,
        propostas30Dias: propostas?.length || 0,
        valorTotal30Dias: propostas?.reduce((sum, p) => sum + (p.valor_total || 0), 0) || 0,
        produtosMaisUsados: [], // TODO: implementar quando tivermos dados de uso
        margemMedia: config?.margem_comercial * 100 || 0
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-center p-8">Erro ao carregar dados do dashboard</div>;
  }

  const percentualPaineisAtivos = stats.totalPaineis > 0 
    ? (stats.paineisAtivos / stats.totalPaineis) * 100 
    : 0;

  const percentualInversoresAtivos = stats.totalInversores > 0 
    ? (stats.inversoresAtivos / stats.totalInversores) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Painéis Solares</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPaineis}</div>
            <div className="flex items-center justify-between mt-2">
              <Badge variant={percentualPaineisAtivos > 80 ? "default" : "secondary"}>
                {stats.paineisAtivos} ativos
              </Badge>
              <span className="text-xs text-muted-foreground">
                {percentualPaineisAtivos.toFixed(0)}%
              </span>
            </div>
            <Progress value={percentualPaineisAtivos} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inversores</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInversores}</div>
            <div className="flex items-center justify-between mt-2">
              <Badge variant={percentualInversoresAtivos > 80 ? "default" : "secondary"}>
                {stats.inversoresAtivos} ativos
              </Badge>
              <span className="text-xs text-muted-foreground">
                {percentualInversoresAtivos.toFixed(0)}%
              </span>
            </div>
            <Progress value={percentualInversoresAtivos} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.propostas30Dias}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.valorTotal30Dias.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Em propostas solares
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Status dos Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Painéis Disponíveis</span>
              </div>
              <span className="font-medium">{stats.paineisAtivos}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Inversores Disponíveis</span>
              </div>
              <span className="font-medium">{stats.inversoresAtivos}</span>
            </div>
            
            {(stats.totalPaineis - stats.paineisAtivos > 0) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Painéis Inativos</span>
                </div>
                <span className="font-medium">{stats.totalPaineis - stats.paineisAtivos}</span>
              </div>
            )}
            
            {(stats.totalInversores - stats.inversoresAtivos > 0) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Inversores Inativos</span>
                </div>
                <span className="font-medium">{stats.totalInversores - stats.inversoresAtivos}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Configurações Comerciais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Margem Comercial Atual</span>
              <Badge variant="outline">
                {stats.margemMedia.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Resumo de Performance</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• {stats.propostas30Dias} propostas geradas</div>
                <div>• R$ {(stats.valorTotal30Dias / Math.max(stats.propostas30Dias, 1)).toLocaleString('pt-BR')} valor médio</div>
                <div>• {((stats.paineisAtivos + stats.inversoresAtivos) / 2).toFixed(0)} produtos ativos em média</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e recomendações */}
      {(percentualPaineisAtivos < 80 || percentualInversoresAtivos < 80) && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-5 h-5" />
              Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {percentualPaineisAtivos < 80 && (
                <p>• Considere ativar mais painéis solares para aumentar as opções de propostas.</p>
              )}
              {percentualInversoresAtivos < 80 && (
                <p>• Verifique os inversores inativos e considere reativá-los se necessário.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};