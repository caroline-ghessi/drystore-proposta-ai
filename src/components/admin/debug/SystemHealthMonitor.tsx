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
  overall_status?: string;
  overall_health?: string;
  timestamp: string;
  correlation_id: string;
  components?: {
    adobe_token?: any;
    database?: any;
    pdf_processing?: any;
    data_saving?: any;
  };
  metrics?: {
    response_time?: number;
    error_rate?: number;
    success_rate?: number;
    adobe_integration?: any;
    edge_functions?: any;
  };
  recommendations?: string[];
  alerts?: string[];
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
      
      // Get the actual status field (handle both overall_status and overall_health)
      const status = data.overall_status || data.overall_health || 'unknown';
      
      // Mostrar toast se houver problemas críticos
      if (status === 'critical') {
        toast({
          title: "⚠️ Problemas Críticos Detectados",
          description: `${(data.recommendations || []).length} problemas encontrados`,
          variant: "destructive",
        });
      } else if (status === 'warning') {
        toast({
          title: "⚠️ Avisos do Sistema",
          description: `${(data.recommendations || []).length} avisos encontrados`,
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

  // Helper function to safely get status
  const getOverallStatus = (health: SystemHealth) => {
    return health.overall_status || health.overall_health || 'unknown';
  };

  // Helper function to safely format status text
  const formatStatus = (status: string) => {
    return status ? status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Monitoramento do Sistema</span>
            {health && (
              <Badge className={getHealthColor(getOverallStatus(health))}>
                {formatStatus(getOverallStatus(health))}
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
                <div className="text-2xl font-bold">{health.metrics?.response_time || health.metrics?.adobe_integration?.auth_success_rate || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Tempo de Resposta / Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(health.recommendations || []).length + (health.alerts || []).length}</div>
                <div className="text-sm text-muted-foreground">Alertas e Recomendações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Date(health.timestamp).toLocaleTimeString('pt-BR')}
                </div>
                <div className="text-sm text-muted-foreground">Última Verificação</div>
              </div>
            </div>

            {/* Componentes do Sistema - Nova estrutura baseada na resposta real */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Integração Adobe */}
              {health.metrics?.adobe_integration && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span className="font-medium">Integração Adobe</span>
                    </div>
                    {getHealthIcon(health.metrics.adobe_integration.status)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Autenticação</span>
                      <span>{health.metrics.adobe_integration.auth_success_rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Upload</span>
                      <span>{health.metrics.adobe_integration.upload_success_rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Extração</span>
                      <span>{health.metrics.adobe_integration.extraction_success_rate}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Edge Functions */}
              {health.metrics?.edge_functions && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span className="font-medium">Edge Functions</span>
                    </div>
                    {getHealthIcon('healthy')}
                  </div>
                  <div className="space-y-1">
                    {Object.entries(health.metrics.edge_functions).slice(0, 3).map(([name, func]: [string, any]) => (
                      <div key={name} className="flex justify-between text-sm">
                        <span>{name.replace(/-/g, ' ')}</span>
                        <span className={func.error_rate === 0 ? 'text-green-600' : 'text-red-600'}>
                          {func.error_rate === 0 ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy components - caso existam */}
              {health.components?.adobe_token && (
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
              )}

              {/* Placeholder para dados não disponíveis */}
              {!health.metrics?.adobe_integration && !health.components?.adobe_token && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Processamento PDF</span>
                    </div>
                    {getHealthIcon('healthy')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sistema funcionando normalmente
                  </div>
                </div>
              )}
            </div>

            {/* Recomendações e Alertas */}
            {((health.recommendations && health.recommendations.length > 0) || (health.alerts && health.alerts.length > 0)) && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recomendações e Alertas</span>
                </h4>
                {[...(health.recommendations || []), ...(health.alerts || [])].map((item, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{item}</AlertDescription>
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