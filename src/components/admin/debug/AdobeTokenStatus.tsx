import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Key, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TokenStatus {
  status: string;
  created_at?: string;
  expires_at?: string;
  minutes_remaining?: number;
  is_valid?: boolean;
  correlation_id?: string;
  timestamp?: string;
  actions_available?: string[];
  overall_status?: string;
}

const AdobeTokenStatus = () => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchTokenStatus = async (refresh = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('adobe-token-health', {
        body: { 
          test_credentials: false,
          refresh_token: refresh
        }
      });

      if (error) throw error;

      setTokenStatus(data);
      
      if (refresh) {
        toast({
          title: "Token Atualizado",
          description: "Status do token Adobe foi atualizado com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar status do token:', error);
      toast({
        title: "Erro",
        description: "Falha ao verificar status do token Adobe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshToken = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('adobe-token-health', {
        body: { 
          refresh_token: true
        }
      });

      if (error) throw error;

      setTokenStatus(data);
      toast({
        title: "Token Renovado",
        description: "Token Adobe foi renovado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      toast({
        title: "Erro ao Renovar",
        description: "Falha ao renovar token Adobe",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTokenStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expiring_soon':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'expired':
      case 'needs_authentication':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'needs_authentication':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} dia${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="w-5 h-5" />
          <span>Status do Token Adobe</span>
        </CardTitle>
        <CardDescription>
          Monitoramento e gerenciamento do token de autenticação Adobe (expira a cada 24h)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Verificando status do token...</span>
          </div>
        ) : tokenStatus ? (
          <>
            {/* Status Geral */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(tokenStatus.overall_status || tokenStatus.status)}
                <span className="font-medium">Status Geral:</span>
                <Badge className={getStatusColor(tokenStatus.overall_status || tokenStatus.status)}>
                  {tokenStatus.overall_status || tokenStatus.status}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTokenStatus()}
                  disabled={loading || refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={refreshToken}
                  disabled={loading || refreshing}
                >
                  <Key className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                  Renovar Token
                </Button>
              </div>
            </div>

            {/* Detalhes do Token */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tokenStatus.created_at && (
                <div>
                  <strong className="text-sm">Criado em:</strong>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tokenStatus.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              
              {tokenStatus.expires_at && (
                <div>
                  <strong className="text-sm">Expira em:</strong>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tokenStatus.expires_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              
              {tokenStatus.minutes_remaining !== undefined && (
                <div>
                  <strong className="text-sm">Tempo Restante:</strong>
                  <p className={`text-sm ${
                    tokenStatus.minutes_remaining < 60 ? 'text-red-600' : 
                    tokenStatus.minutes_remaining < 120 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {getTimeRemaining(tokenStatus.minutes_remaining)}
                  </p>
                </div>
              )}

              {tokenStatus.is_valid !== undefined && (
                <div>
                  <strong className="text-sm">Token Válido:</strong>
                  <p className={`text-sm ${tokenStatus.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                    {tokenStatus.is_valid ? 'Sim' : 'Não'}
                  </p>
                </div>
              )}
            </div>

            {/* Ações Disponíveis */}
            {tokenStatus.actions_available && tokenStatus.actions_available.length > 0 && (
              <div>
                <strong className="text-sm">Ações Disponíveis:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tokenStatus.actions_available.map((action, index) => (
                    <Badge key={index} variant="outline">
                      {action.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Avisos */}
            {tokenStatus.overall_status === 'expiring_soon' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Atenção: Token expira em menos de 1 hora
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Recomendamos renovar o token para evitar interrupções no serviço.
                </p>
              </div>
            )}

            {(tokenStatus.overall_status === 'expired' || tokenStatus.overall_status === 'needs_authentication') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Token expirado ou ausente
                  </span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  É necessário renovar o token para usar os serviços Adobe.
                </p>
              </div>
            )}

            {/* Timestamp da última verificação */}
            {tokenStatus.timestamp && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                Última verificação: {new Date(tokenStatus.timestamp).toLocaleString('pt-BR')}
                {tokenStatus.correlation_id && ` (ID: ${tokenStatus.correlation_id})`}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Nenhuma informação de token disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdobeTokenStatus;