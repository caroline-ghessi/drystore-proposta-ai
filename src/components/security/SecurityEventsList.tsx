import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Eye, Lock, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  details: any;
  ip_address: string;
  user_agent: string;
  user_id: string | null;
  client_id: string | null;
  created_at: string;
}

const SecurityEventsList = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['security-events-detailed', severityFilter, eventTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      if (eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SecurityEvent[];
    },
    refetchInterval: 30000
  });

  const { data: eventTypes } = useQuery({
    queryKey: ['security-event-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('event_type')
        .order('event_type');
      
      if (error) throw error;
      const uniqueTypes = [...new Set(data.map(item => item.event_type))];
      return uniqueTypes;
    }
  });

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('invalid')) {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    if (eventType.includes('blocked') || eventType.includes('rate_limit')) {
      return <Lock className="w-4 h-4 text-warning" />;
    }
    return <CheckCircle className="w-4 h-4 text-success" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDetails = (details: any) => {
    if (!details) return 'N/A';
    if (typeof details === 'string') return details;
    return JSON.stringify(details, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Severidade</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Tipo de Evento</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {eventTypes?.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} variant="outline">
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Eventos de Segurança Detalhados
          </CardTitle>
          <CardDescription>
            Histórico completo de atividades de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !events || events.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum evento encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.event_type)}
                      <div>
                        <h4 className="font-medium">
                          {event.event_type.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {event.ip_address && (
                      <div>
                        <span className="font-medium">IP Address:</span>
                        <span className="ml-2 font-mono">{event.ip_address}</span>
                      </div>
                    )}
                    {event.user_id && (
                      <div>
                        <span className="font-medium">User ID:</span>
                        <span className="ml-2 font-mono">{event.user_id}</span>
                      </div>
                    )}
                    {event.client_id && (
                      <div>
                        <span className="font-medium">Client ID:</span>
                        <span className="ml-2 font-mono">{event.client_id}</span>
                      </div>
                    )}
                    {event.user_agent && (
                      <div className="md:col-span-2">
                        <span className="font-medium">User Agent:</span>
                        <div className="mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                          {event.user_agent}
                        </div>
                      </div>
                    )}
                  </div>

                  {event.details && (
                    <div>
                      <span className="font-medium text-sm">Detalhes:</span>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        {formatDetails(event.details)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityEventsList;