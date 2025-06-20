
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', vendas: 65000, meta: 80000 },
  { month: 'Fev', vendas: 78000, meta: 80000 },
  { month: 'Mar', vendas: 92000, meta: 85000 },
  { month: 'Abr', vendas: 87000, meta: 85000 },
  { month: 'Mai', vendas: 105000, meta: 90000 },
  { month: 'Jun', vendas: 118000, meta: 95000 },
];

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
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
