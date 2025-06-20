
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Users, DollarSign } from 'lucide-react';

export const ConversionMetrics = () => {
  const metrics = [
    {
      label: 'Taxa de Conversão',
      value: 67,
      target: 70,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Leads Qualificados',
      value: 245,
      growth: '+12%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Ticket Médio',
      value: 'R$ 15.340',
      growth: '+8%',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      label: 'Crescimento Mensal',
      value: '23%',
      growth: '+5%',
      icon: TrendingUp,
      color: 'text-orange-600'
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
              {metric.target && (
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
