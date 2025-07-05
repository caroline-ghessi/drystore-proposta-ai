
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Users, DollarSign, Loader2 } from 'lucide-react';
import { useCompanyAnalytics } from '@/hooks/useCompanyAnalytics';

export const ConversionMetrics = () => {
  const { data: analytics, isLoading, error } = useCompanyAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 p-8">
            Erro ao carregar métricas
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Taxa de Conversão',
      value: Math.round(analytics.conversion_rate),
      target: 70,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Leads Qualificados',
      value: analytics.qualified_leads,
      growth: analytics.qualified_leads > 0 ? '+' + Math.round(analytics.monthly_growth) + '%' : '0%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Ticket Médio',
      value: 'R$ ' + analytics.average_ticket.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
      growth: analytics.monthly_growth > 0 ? '+' + Math.round(analytics.monthly_growth) + '%' : Math.round(analytics.monthly_growth) + '%',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      label: 'Crescimento Mensal',
      value: Math.round(analytics.monthly_growth) + '%',
      growth: analytics.monthly_growth > 0 ? 'positivo' : 'negativo',
      icon: TrendingUp,
      color: analytics.monthly_growth > 0 ? 'text-green-600' : 'text-red-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Conversão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-white ${metric.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <p className="text-lg font-bold">{metric.value}</p>
                </div>
              </div>
              {metric.growth && (
                <div className="text-right">
                  <span className="text-sm text-green-600">{metric.growth}</span>
                </div>
              )}
              {metric.target && typeof metric.value === 'number' && (
                <div className="w-20">
                  <Progress value={(metric.value / metric.target) * 100} />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
