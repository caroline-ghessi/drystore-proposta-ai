
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const predictionData = [
  { month: 'Jul', real: 118000, predicted: null },
  { month: 'Ago', real: null, predicted: 125000 },
  { month: 'Set', real: null, predicted: 132000 },
  { month: 'Out', real: null, predicted: 128000 },
  { month: 'Nov', real: null, predicted: 145000 },
  { month: 'Dez', real: null, predicted: 160000 },
];

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
            <p className="text-sm font-medium">Previsão Agosto</p>
            <p className="text-lg font-bold text-green-600">R$ 125k</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Crescimento Previsto</p>
            <p className="text-lg font-bold text-blue-600">+6%</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Confiabilidade</p>
            <p className="text-lg font-bold text-orange-600">87%</p>
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
