import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SecurityMetricsChart = () => {
  const { data: eventsTrend } = useQuery({
    queryKey: ['security-events-trend'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('created_at, severity')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar eventos por dia
      const eventsByDay = data.reduce((acc: any, event) => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, total: 0, high: 0, medium: 0, low: 0 };
        }
        acc[date].total++;
        acc[date][event.severity]++;
        return acc;
      }, {});

      return Object.values(eventsByDay).slice(-7); // Últimos 7 dias
    },
    refetchInterval: 60000
  });

  const { data: severityStats } = useQuery({
    queryKey: ['security-severity-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('severity')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const stats = data.reduce((acc: any, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {});

      return [
        { name: 'Alta', value: stats.high || 0, color: '#ef4444' },
        { name: 'Média', value: stats.medium || 0, color: '#f97316' },
        { name: 'Baixa', value: stats.low || 0, color: '#22c55e' }
      ];
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tendência de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tendência de Eventos (7 dias)
          </CardTitle>
          <CardDescription>
            Evolução dos eventos de segurança nos últimos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventsTrend && eventsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Total"
                />
                <Line 
                  type="monotone" 
                  dataKey="high" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Alta"
                />
                <Line 
                  type="monotone" 
                  dataKey="medium" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Média"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Dados insuficientes para gerar gráfico
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribuição por Severidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Distribuição por Severidade
          </CardTitle>
          <CardDescription>
            Últimos 100 eventos classificados por severidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          {severityStats && severityStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum evento encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMetricsChart;