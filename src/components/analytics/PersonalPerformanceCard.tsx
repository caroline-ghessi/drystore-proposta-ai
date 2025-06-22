
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, DollarSign, Clock, Calendar, Award } from 'lucide-react';
import { usePersonalSalesData } from '@/hooks/usePersonalSalesData';

export const PersonalPerformanceCard = () => {
  const { data, isLoading } = usePersonalSalesData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Performance Pessoal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 50) return 'text-blue-600';
    return 'text-red-600';
  };

  const getAchievementBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge className="bg-green-100 text-green-800"><Award className="w-3 h-3 mr-1" />Meta Atingida!</Badge>;
    if (percentage >= 80) return <Badge className="bg-yellow-100 text-yellow-800"><Target className="w-3 h-3 mr-1" />Quase lá!</Badge>;
    if (percentage >= 50) return <Badge className="bg-blue-100 text-blue-800"><TrendingUp className="w-3 h-3 mr-1" />No caminho</Badge>;
    return <Badge className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />Precisa acelerar</Badge>;
  };

  const progressColor = () => {
    const percentage = data?.targetAchievement || 0;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-red-500';
  };

  const getCurrentMonthName = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[new Date().getMonth()];
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-6 h-6 mr-3 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Performance Pessoal</CardTitle>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                {getCurrentMonthName()} {new Date().getFullYear()}
              </p>
            </div>
          </div>
          {data && getAchievementBadge(data.targetAchievement)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meta vs Realizado - Destaque Principal */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta do Mês</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(data?.target || 0)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendido no Mês</span>
            <span className={`text-lg font-bold ${getAchievementColor(data?.targetAchievement || 0)}`}>
              {formatCurrency(data?.currentMonthSales || 0)}
            </span>
          </div>
          
          <Progress 
            value={Math.min(data?.targetAchievement || 0, 100)} 
            className="h-4 mb-3"
          />
          
          <div className="flex justify-between items-center text-xs">
            <span className={`font-semibold ${getAchievementColor(data?.targetAchievement || 0)}`}>
              {(data?.targetAchievement || 0).toFixed(1)}% da meta atingida
            </span>
            <span className="text-gray-500">
              Faltam {formatCurrency(data?.remainingToTarget || 0)}
            </span>
          </div>
        </div>

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">ANUAL</span>
            </div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(data?.currentYearSales || 0)}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Vendas no ano</div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">TICKET</span>
            </div>
            <div className="text-xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(data?.averageTicket || 0)}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">Ticket médio</div>
          </div>
        </div>

        {/* Estatísticas de Propostas */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Estatísticas de Propostas</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{data?.totalProposals || 0}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-lg font-bold text-green-600">{data?.acceptedCount || 0}</div>
              <div className="text-xs text-green-700 dark:text-green-300">Aceitas</div>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-lg font-bold text-blue-600">{(data?.conversionRate || 0).toFixed(1)}%</div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Conversão</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="text-lg font-bold text-yellow-600">{data?.sentCount || 0}</div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300">Enviadas</div>
            </div>
          </div>
        </div>

        {/* Mensagem Motivacional */}
        {data?.targetAchievement && data.targetAchievement < 100 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="text-sm text-purple-800 dark:text-purple-200 text-center">
              {data.targetAchievement >= 80 
                ? "🚀 Você está muito próximo da sua meta! Continue assim!"
                : data.targetAchievement >= 50
                ? "💪 Você está no meio do caminho! Vamos acelerar!"
                : "⚡ É hora de acelerar! Sua meta está te esperando!"
              }
            </div>
          </div>
        )}

        {data?.targetAchievement && data.targetAchievement >= 100 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-200 text-center">
              🎉 Parabéns! Você atingiu sua meta mensal! Continue o excelente trabalho!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
