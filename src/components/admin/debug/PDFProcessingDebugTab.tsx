import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

interface ProcessingLog {
  id: string;
  processing_id: string;
  user_id: string;
  file_name: string;
  stage: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  details: any;
  created_at: string;
}

interface ProcessingMetrics {
  date: string;
  stage: string;
  success_count: number;
  error_count: number;
  total_attempts: number;
  avg_duration_ms: number;
  most_common_error: string | null;
}

export const PDFProcessingDebugTab = () => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [metrics, setMetrics] = useState<ProcessingMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar logs recentes
      const { data: logsData, error: logsError } = await supabase
        .from('pdf_processing_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Carregar métricas dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: metricsData, error: metricsError } = await supabase
        .from('pdf_processing_metrics')
        .select('*')
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (metricsError) throw metricsError;

      setLogs(logsData || []);
      setMetrics(metricsData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const calculateSuccessRate = () => {
    const totalAttempts = metrics.reduce((sum, m) => sum + m.total_attempts, 0);
    const totalSuccess = metrics.reduce((sum, m) => sum + m.success_count, 0);
    return totalAttempts > 0 ? ((totalSuccess / totalAttempts) * 100).toFixed(1) : '0';
  };

  const getAverageDuration = () => {
    const validMetrics = metrics.filter(m => m.avg_duration_ms > 0);
    if (validMetrics.length === 0) return 0;
    const avgDuration = validMetrics.reduce((sum, m) => sum + m.avg_duration_ms, 0) / validMetrics.length;
    return (avgDuration / 1000).toFixed(1); // Convert to seconds
  };

  return (
    <div className="space-y-6">
      {/* Header com métricas resumidas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PDF Processing Debug</h2>
          <p className="text-muted-foreground">Monitoramento do sistema de processamento PDF</p>
        </div>
        <Button onClick={loadData} disabled={loading} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{calculateSuccessRate()}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{getAverageDuration()}s</p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-sm text-muted-foreground">Logs Recentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {metrics.reduce((sum, m) => sum + m.error_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Erros (7 dias)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList>
          <TabsTrigger value="logs">Logs Recentes</TabsTrigger>
          <TabsTrigger value="metrics">Métricas por Etapa</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Processamento</CardTitle>
              <CardDescription>
                Últimos 50 logs do sistema de processamento PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">{log.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.stage} • {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.error_message && (
                          <p className="text-sm text-red-600 mt-1">{log.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(log.status)}
                      {log.duration_ms && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {(log.duration_ms / 1000).toFixed(1)}s
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum log encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['text_extraction', 'data_organization', 'data_formatting', 'data_validation', 'data_saving'].map((stage) => {
              const stageMetrics = metrics.filter(m => m.stage === stage);
              const totalSuccess = stageMetrics.reduce((sum, m) => sum + m.success_count, 0);
              const totalErrors = stageMetrics.reduce((sum, m) => sum + m.error_count, 0);
              const totalAttempts = totalSuccess + totalErrors;
              const successRate = totalAttempts > 0 ? ((totalSuccess / totalAttempts) * 100).toFixed(1) : '0';

              return (
                <Card key={stage}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">
                      {stage.replace(/_/g, ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taxa de Sucesso:</span>
                        <span className="font-bold">{successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Tentativas:</span>
                        <span>{totalAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sucessos:</span>
                        <span className="text-green-600">{totalSuccess}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Erros:</span>
                        <span className="text-red-600">{totalErrors}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};