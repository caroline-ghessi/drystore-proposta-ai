
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useCompanySalesData } from '@/hooks/useCompanyAnalytics';

const chartConfig = {
  vendas: {
    label: "Vendas",
    color: "#2563eb",
  },
  meta: {
    label: "Meta",
    color: "#dc2626",
  },
};

export const SalesPerformanceChart = () => {
  const { data: salesData, isLoading, error } = useCompanySalesData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Erro ao carregar dados de vendas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="vendas" 
                stroke="var(--color-vendas)" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                stroke="var(--color-meta)" 
                strokeWidth={2} 
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
