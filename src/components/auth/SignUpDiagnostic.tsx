
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const SignUpDiagnostic = () => {
  const [diagnosing, setDiagnosing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setDiagnosing(true);
    const diagnosticResults: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // 1. Verificar se o enum user_role existe
      console.log('🔍 Verificando enum user_role...');
      const { data: enumData, error: enumError } = await supabase
        .rpc('validate_email_format', { email_input: 'test@test.com' });
      
      diagnosticResults.checks.enumExists = !enumError;

      // 2. Verificar se a tabela profiles existe e tem a estrutura correta
      console.log('🔍 Verificando tabela profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      diagnosticResults.checks.profilesTableExists = !profilesError;

      // 3. Verificar se a função get_user_role funciona
      console.log('🔍 Verificando função get_user_role...');
      try {
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role', { user_uuid: '00000000-0000-0000-0000-000000000000' });
        
        diagnosticResults.checks.getUserRoleWorks = !roleError;
      } catch (err) {
        diagnosticResults.checks.getUserRoleWorks = false;
      }

      // 4. Verificar conexão com Supabase
      console.log('🔍 Verificando conexão...');
      const { data: sessionData } = await supabase.auth.getSession();
      diagnosticResults.checks.connectionWorks = true;
      diagnosticResults.currentSession = !!sessionData.session;

      // 5. Verificar se há usuários órfãos
      console.log('🔍 Verificando usuários órfãos...');
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        diagnosticResults.checks.profileCount = count || 0;
      } catch (err) {
        diagnosticResults.checks.profileCount = 'error';
      }

      setResults(diagnosticResults);
      console.log('📊 Resultados do diagnóstico:', diagnosticResults);

    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error);
      diagnosticResults.error = error;
      setResults(diagnosticResults);
    } finally {
      setDiagnosing(false);
    }
  };

  const getStatusBadge = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? (
        <Badge className="bg-green-100 text-green-800">✅ OK</Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800">❌ Erro</Badge>
      );
    }
    return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 Diagnóstico de Cadastro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostic} 
          disabled={diagnosing}
          className="w-full"
        >
          {diagnosing ? 'Executando diagnóstico...' : 'Executar Diagnóstico'}
        </Button>

        {results && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">
                Executado em: {new Date(results.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <span>Enum user_role</span>
                {getStatusBadge(results.checks.enumExists)}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <span>Tabela profiles</span>
                {getStatusBadge(results.checks.profilesTableExists)}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <span>Função get_user_role</span>
                {getStatusBadge(results.checks.getUserRoleWorks)}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <span>Conexão Supabase</span>
                {getStatusBadge(results.checks.connectionWorks)}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <span>Total de perfis</span>
                {getStatusBadge(results.checks.profileCount)}
              </div>
            </div>

            {results.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                  <strong>Erro:</strong> {results.error.message}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
