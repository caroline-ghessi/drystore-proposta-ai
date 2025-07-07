import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Unlock, Shield, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RateLimit {
  id: string;
  identifier: string;
  attempt_count: number;
  blocked_until: string | null;
  first_attempt: string;
  last_attempt: string;
  created_at: string;
}

interface ApiRateLimit {
  id: string;
  endpoint: string;
  identifier: string;
  request_count: number;
  window_start: string;
  created_at: string;
}

const AccessControlPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blockedIPs, isLoading: loadingBlocked } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .gte('blocked_until', new Date().toISOString())
        .order('blocked_until', { ascending: false });
      
      if (error) throw error;
      return data as RateLimit[];
    },
    refetchInterval: 30000
  });

  const { data: rateLimitHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['rate-limit-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .order('last_attempt', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as RateLimit[];
    }
  });

  const { data: apiRateLimits } = useQuery({
    queryKey: ['api-rate-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_rate_limits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as ApiRateLimit[];
    }
  });

  const unblockIPMutation = useMutation({
    mutationFn: async (ipId: string) => {
      const { error } = await supabase
        .from('auth_rate_limits')
        .update({ blocked_until: null })
        .eq('id', ipId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      queryClient.invalidateQueries({ queryKey: ['rate-limit-history'] });
      toast({
        title: "IP desbloqueado",
        description: "O IP foi desbloqueado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível desbloquear o IP.",
        variant: "destructive",
      });
    }
  });

  const isBlocked = (blockedUntil: string | null) => {
    if (!blockedUntil) return false;
    return new Date(blockedUntil) > new Date();
  };

  const formatTimeRemaining = (blockedUntil: string) => {
    const remaining = new Date(blockedUntil).getTime() - new Date().getTime();
    if (remaining <= 0) return "Expirado";
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* IPs Bloqueados Atualmente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-destructive" />
            IPs Bloqueados Atualmente
          </CardTitle>
          <CardDescription>
            Lista de endereços IP que estão atualmente bloqueados por rate limiting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBlocked ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !blockedIPs || blockedIPs.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Nenhum IP está bloqueado no momento.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {blockedIPs.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-medium">{item.identifier}</span>
                      <Badge variant="destructive">Bloqueado</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Tentativas: {item.attempt_count}</span>
                      <span>
                        Tempo restante: {item.blocked_until ? formatTimeRemaining(item.blocked_until) : 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Última tentativa: {new Date(item.last_attempt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => unblockIPMutation.mutate(item.id)}
                    disabled={unblockIPMutation.isPending}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Desbloquear
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Rate Limiting
          </CardTitle>
          <CardDescription>
            Histórico completo de tentativas de acesso e bloqueios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !rateLimitHistory || rateLimitHistory.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum histórico de rate limiting encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {rateLimitHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {isBlocked(item.blocked_until) ? (
                        <Lock className="w-4 h-4 text-destructive" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                      <span className="font-mono text-sm">{item.identifier}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.attempt_count} tentativas
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground">
                      {new Date(item.last_attempt).toLocaleString('pt-BR')}
                    </div>
                    {isBlocked(item.blocked_until) && (
                      <Badge variant="destructive" className="mt-1">
                        Bloqueado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de API Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Rate Limiting por Endpoint
          </CardTitle>
          <CardDescription>
            Monitoramento de uso de APIs e endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!apiRateLimits || apiRateLimits.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhuma atividade de API registrada recentemente.
            </div>
          ) : (
            <div className="space-y-3">
              {apiRateLimits.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{item.endpoint}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.identifier}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.request_count} requests</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControlPanel;