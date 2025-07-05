
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useSalesPredictionData } from '@/hooks/useCompanyAnalytics';

const chartConfig = {
  real: {
    label: "Vendas Reais",
    color: "#2563eb",
  },
  predicted: {
    label: "Previsão IA",
    color: "#16a34a",
  },
};

export const SalesPrediction = () => {
  const { data: predictionData, isLoading, error } = useSalesPredictionData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Previsão de Vendas com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !predictionData || predictionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Previsão de Vendas com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 p-8">
            {error ? 'Erro ao carregar previsões' : 'Dados insuficientes para previsão'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextMonthPrediction = predictionData.find(d => d.predicted !== null);
  const currentRealSales = predictionData.find(d => d.real !== null);
  const growthRate = currentRealSales && nextMonthPrediction ? 
    ((nextMonthPrediction.predicted - currentRealSales.real) / currentRealSales.real * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Previsão de Vendas com IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Próximo Mês</p>
            <p className="text-lg font-bold text-green-600">
              R$ {nextMonthPrediction ? (nextMonthPrediction.predicted / 1000).toFixed(0) + 'k' : '0k'}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Crescimento Previsto</p>
            <p className="text-lg font-bold text-blue-600">
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Confiabilidade</p>
            <p className="text-lg font-bold text-orange-600">75%</p>
          </div>
        </div>
        
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="real" 
                stroke="var(--color-real)" 
                fill="var(--color-real)" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="var(--color-predicted)" 
                fill="var(--color-predicted)" 
                fillOpacity={0.3}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
