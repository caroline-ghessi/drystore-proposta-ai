
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { usePersonalSalesData } from '@/hooks/usePersonalSalesData';

export const PersonalSalesChart = () => {
  const { data, isLoading } = usePersonalSalesData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução das Minhas Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Processar dados para o gráfico - últimos 6 meses
  const processChartData = () => {
    const chartData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = targetMonth.getMonth() + 1;
      const year = targetMonth.getFullYear();
      
      const monthSales = data?.salesData?.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year;
      }).reduce((sum, sale) => sum + Number(sale.valor_total), 0) || 0;

      chartData.push({
        month: targetMonth.toLocaleDateString('pt-BR', { month: 'short' }),
        vendas: monthSales,
        meta: data?.target || 0 // Assumindo mesma meta para todos os meses
      });
    }
    
    return chartData;
  };

  const chartData = processChartData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Evolução das Minhas Vendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis 
                stroke="#666"
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'vendas' ? 'Vendas' : 'Meta'
                ]}
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="meta"
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo estatístico */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(data?.currentMonthSales || 0)}
            </div>
            <div className="text-xs text-gray-600">Este mês</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(data?.target || 0)}
            </div>
            <div className="text-xs text-gray-600">Meta mensal</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">
              {(data?.targetAchievement || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Atingimento</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
