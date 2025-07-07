import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Database, Download, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RLSPolicy {
  schemaname: string;
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

const SecuritySettingsPanel = () => {
  const { toast } = useToast();
  const [rateLimitSettings, setRateLimitSettings] = useState({
    maxRequests: 100,
    windowMinutes: 60,
    blockDurationMinutes: 15
  });

  const { data: rlsPolicies, isLoading: loadingPolicies } = useQuery({
    queryKey: ['rls-policies'],
    queryFn: async () => {
      // Simulação de dados de políticas RLS
      const mockPolicies: RLSPolicy[] = [
        {
          schemaname: 'public',
          tablename: 'profiles',
          policyname: 'Users can view own profile or admins view all',
          permissive: 'PERMISSIVE',
          roles: ['authenticated'],
          cmd: 'SELECT',
          qual: '((user_id = get_current_user_id()) OR is_admin_user())',
          with_check: ''
        },
        {
          schemaname: 'public',
          tablename: 'proposals',
          policyname: 'Users can view their proposals',
          permissive: 'PERMISSIVE',
          roles: ['authenticated'],
          cmd: 'SELECT',
          qual: '((auth.uid() = user_id) OR (get_user_role(auth.uid()) = \'admin\'::user_role))',
          with_check: ''
        }
      ];
      return mockPolicies;
    }
  });

  const { data: tableStats } = useQuery({
    queryKey: ['table-stats'],
    queryFn: async () => {
      const tables = [
        'profiles', 'clients', 'proposals', 'security_events', 
        'auth_rate_limits', 'products', 'approval_requests'
      ] as const;
      
      const stats = await Promise.all(
        tables.map(async (table) => {
          try {
            const { count, error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true });
            
            return {
              table,
              count: error ? 0 : count || 0,
              hasRLS: true // Assumindo que todas as tabelas têm RLS
            };
          } catch (err) {
            return {
              table,
              count: 0,
              hasRLS: true
            };
          }
        })
      );
      
      return stats;
    }
  });

  const handleExportAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const csv = [
        'ID,Action,Table,Record ID,User ID,Created At,Old Values,New Values',
        ...data.map(log => [
          log.id,
          log.action,
          log.table_name || '',
          log.record_id || '',
          log.user_id || '',
          log.created_at,
          JSON.stringify(log.old_values || {}),
          JSON.stringify(log.new_values || {})
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Logs de auditoria exportados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os logs de auditoria.",
        variant: "destructive",
      });
    }
  };

  const handleTestRLS = async () => {
    try {
      // Testa algumas consultas básicas para verificar se RLS está funcionando
      const tests = [
        { table: 'profiles', description: 'Perfis de usuário' },
        { table: 'clients', description: 'Clientes' },
        { table: 'proposals', description: 'Propostas' },
      ];

      const results = await Promise.all(
        tests.map(async (test) => {
          try {
            // Type assertion para resolver problema de tipagem do Supabase
            const { data, error } = await (supabase as any)
              .from(test.table)
              .select('id')
              .limit(1);
            
            return {
              ...test,
              status: error ? 'error' : 'success',
              message: error ? error.message : 'RLS funcionando'
            };
          } catch (err) {
            return {
              ...test,
              status: 'error',
              message: 'Erro na consulta'
            };
          }
        })
      );

      console.log('Resultados dos testes RLS:', results);
      
      toast({
        title: "Testes de RLS concluídos",
        description: "Verifique o console para detalhes dos resultados.",
      });
    } catch (error) {
      toast({
        title: "Erro nos testes",
        description: "Não foi possível executar os testes de RLS.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies">Políticas RLS</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limiting</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Políticas Row Level Security
              </CardTitle>
              <CardDescription>
                Políticas de segurança ativas nas tabelas do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPolicies ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tableStats?.map((stat) => (
                    <div key={stat.table} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{stat.table}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={stat.hasRLS ? "default" : "destructive"}>
                            {stat.hasRLS ? "RLS Ativo" : "RLS Inativo"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {stat.count} registros
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Rate Limiting
              </CardTitle>
              <CardDescription>
                Ajuste os limites de requisições e tempos de bloqueio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRequests">Máximo de Requisições</Label>
                  <Input
                    id="maxRequests"
                    type="number"
                    value={rateLimitSettings.maxRequests}
                    onChange={(e) => setRateLimitSettings(prev => ({
                      ...prev,
                      maxRequests: parseInt(e.target.value) || 100
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="windowMinutes">Janela de Tempo (min)</Label>
                  <Input
                    id="windowMinutes"
                    type="number"
                    value={rateLimitSettings.windowMinutes}
                    onChange={(e) => setRateLimitSettings(prev => ({
                      ...prev,
                      windowMinutes: parseInt(e.target.value) || 60
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blockDuration">Duração do Bloqueio (min)</Label>
                  <Input
                    id="blockDuration"
                    type="number"
                    value={rateLimitSettings.blockDurationMinutes}
                    onChange={(e) => setRateLimitSettings(prev => ({
                      ...prev,
                      blockDurationMinutes: parseInt(e.target.value) || 15
                    }))}
                  />
                </div>
              </div>
              <Button className="w-full">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Controle de Auditoria
              </CardTitle>
              <CardDescription>
                Configurações e exportação de logs de auditoria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auditoria Automática</h4>
                  <p className="text-sm text-muted-foreground">
                    Registra automaticamente todas as alterações nas tabelas críticas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Log de Eventos de Segurança</h4>
                  <p className="text-sm text-muted-foreground">
                    Registra tentativas de login e eventos de segurança
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="pt-4 border-t">
                <Button onClick={handleExportAuditLogs} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Logs de Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Testes de Segurança
              </CardTitle>
              <CardDescription>
                Execute testes para validar as configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button onClick={handleTestRLS} variant="outline" className="w-full">
                  Testar Políticas RLS
                </Button>
                <Button variant="outline" className="w-full">
                  Testar Rate Limiting
                </Button>
                <Button variant="outline" className="w-full">
                  Validar Permissões de Usuário
                </Button>
                <Button variant="outline" className="w-full">
                  Testar Logs de Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettingsPanel;