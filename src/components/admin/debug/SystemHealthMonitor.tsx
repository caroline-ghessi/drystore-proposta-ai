import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Database,
  FileText,
  Save,
  Key,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  overall_status: string;
  timestamp: string;
  correlation_id: string;
  components: {
    adobe_token: any;
    database: any;
    pdf_processing: any;
    data_saving: any;
  };
  metrics: {
    response_time: number;
    error_rate: number;
    success_rate: number;
  };
  recommendations: string[];
}

const SystemHealthMonitor = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const fetchSystemHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-monitor');

      if (error) {
        console.error('System monitor error:', error);
        throw new Error(error.message || 'Erro no monitoramento');
      }

      setHealth(data);
      
      // Mostrar toast se houver problemas críticos
      if (data.overall_status === 'critical') {
        toast({
          title: "⚠️ Problemas Críticos Detectados",
          description: `${data.recommendations.length} problemas encontrados`,
          variant: "destructive",
        });
      } else if (data.overall_status === 'warning') {
        toast({
          title: "⚠️ Avisos do Sistema",
          description: `${data.recommendations.length} avisos encontrados`,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar saúde do sistema:', error);
      toast({
        title: "Erro no Monitoramento",
        description: `Falha ao verificar saúde: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 2 * 60 * 1000); // 2 minutos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Monitoramento do Sistema</span>
            {health && (
              <Badge className={getHealthColor(health.overall_status)}>
                {health.overall_status.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-pulse' : ''}`} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSystemHealth}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Monitoramento automático de todos os componentes críticos do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading && !health ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Verificando saúde do sistema...</span>
          </div>
        ) : health ? (
          <>
            {/* Status Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{health.metrics.response_time}ms</div>
                <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{health.recommendations.length}</div>
                <div className="text-sm text-muted-foreground">Recomendações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Date(health.timestamp).toLocaleTimeString('pt-BR')}
                </div>
                <div className="text-sm text-muted-foreground">Última Verificação</div>
              </div>
            </div>

            {/* Componentes do Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Token Adobe */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span className="font-medium">Token Adobe</span>
                  </div>
                  {getHealthIcon(health.components.adobe_token.health)}
                </div>
                {health.components.adobe_token.minutes_remaining !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Tempo Restante</span>
                      <span>{Math.floor(health.components.adobe_token.minutes_remaining / 60)}h {health.components.adobe_token.minutes_remaining % 60}m</span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, (health.components.adobe_token.minutes_remaining / 1440) * 100))} 
                      className="h-2"
                    />
                  </div>
                )}
                {health.components.adobe_token.auto_renewed && (
                  <Badge variant="outline" className="mt-2">🔄 Renovado automaticamente</Badge>
                )}
              </div>

              {/* Banco de Dados */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span className="font-medium">Banco de Dados</span>
                  </div>
                  {getHealthIcon(health.components.database.health)}
                </div>
                {health.components.database.response_time && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Tempo de Resposta</span>
                      <span>{health.components.database.response_time}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Erros Recentes</span>
                      <span>{health.components.database.recent_errors || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Processamento PDF */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Processamento PDF</span>
                  </div>
                  {getHealthIcon(health.components.pdf_processing.health)}
                </div>
                {health.components.pdf_processing.error_rate !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Erro</span>
                      <span>{health.components.pdf_processing.error_rate}%</span>
                    </div>
                    <Progress 
                      value={100 - health.components.pdf_processing.error_rate} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{health.components.pdf_processing.total_attempts_24h} tentativas</span>
                      <span>{health.components.pdf_processing.total_errors_24h} erros</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Salvamento de Dados */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span className="font-medium">Salvamento</span>
                  </div>
                  {getHealthIcon(health.components.data_saving.health)}
                </div>
                {health.components.data_saving.success_rate !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Sucesso</span>
                      <span>{health.components.data_saving.success_rate}%</span>
                    </div>
                    <Progress 
                      value={health.components.data_saving.success_rate} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{health.components.data_saving.recent_saves} recentes</span>
                      <span>{health.components.data_saving.successful_saves} sucessos</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recomendações */}
            {health.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recomendações do Sistema</span>
                </h4>
                {health.recommendations.map((recommendation, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{recommendation}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Timestamp e Correlation ID */}
            <div className="text-xs text-muted-foreground border-t pt-2">
              <div className="flex justify-between">
                <span>ID: {health.correlation_id}</span>
                <span>Atualizado: {new Date(health.timestamp).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Nenhum dado de monitoramento disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthMonitor;