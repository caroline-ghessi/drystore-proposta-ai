
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, DollarSign, Clock } from 'lucide-react';
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
    return 'text-red-600';
  };

  const getAchievementBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge className="bg-green-100 text-green-800">Meta Atingida!</Badge>;
    if (percentage >= 80) return <Badge className="bg-yellow-100 text-yellow-800">Quase lá!</Badge>;
    return <Badge className="bg-red-100 text-red-800">Precisa acelerar</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Performance Pessoal
          </div>
          {data && getAchievementBadge(data.targetAchievement)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meta vs Realizado */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Meta do Mês</span>
            <span className="text-sm text-gray-600">{formatCurrency(data?.target || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Vendido no Mês</span>
            <span className={`text-sm font-semibold ${getAchievementColor(data?.targetAchievement || 0)}`}>
              {formatCurrency(data?.currentMonthSales || 0)}
            </span>
          </div>
          <Progress 
            value={Math.min(data?.targetAchievement || 0, 100)} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{(data?.targetAchievement || 0).toFixed(1)}% da meta</span>
            <span>Faltam {formatCurrency(data?.remainingToTarget || 0)}</span>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600">ANO</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-semibold text-blue-900">
                {formatCurrency(data?.currentYearSales || 0)}
              </div>
              <div className="text-xs text-blue-700">Vendas no ano</div>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">TICKET</span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-semibold text-green-900">
                {formatCurrency(data?.averageTicket || 0)}
              </div>
              <div className="text-xs text-green-700">Ticket médio</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
