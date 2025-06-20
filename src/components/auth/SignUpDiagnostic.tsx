
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
      // 1. Testar a nova função test_user_role_enum
      console.log('🔍 Testando enum user_role...');
      const { data: enumTestData, error: enumTestError } = await supabase
        .rpc('test_user_role_enum');
      
      diagnosticResults.checks.enumTest = {
        success: !enumTestError,
        result: enumTestData,
        error: enumTestError?.message
      };

      // 2. Verificar se a tabela profiles existe
      console.log('🔍 Verificando tabela profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      diagnosticResults.checks.profilesTable = {
        success: !profilesError,
        error: profilesError?.message
      };

      // 3. Verificar função get_user_role
      console.log('🔍 Verificando função get_user_role...');
      try {
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role', { user_uuid: '00000000-0000-0000-0000-000000000000' });
        
        diagnosticResults.checks.getUserRole = {
          success: !roleError,
          result: roleData,
          error: roleError?.message
        };
      } catch (err: any) {
        diagnosticResults.checks.getUserRole = {
          success: false,
          error: err.message
        };
      }

      // 4. Verificar conexão geral
      console.log('🔍 Verificando conexão...');
      const { data: sessionData } = await supabase.auth.getSession();
      diagnosticResults.checks.connection = {
        success: true,
        hasSession: !!sessionData.session
      };

      // 5. Contar perfis existentes
      console.log('🔍 Contando perfis...');
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      diagnosticResults.checks.profileCount = {
        success: !countError,
        count: count || 0,
        error: countError?.message
      };

      setResults(diagnosticResults);
      console.log('📊 Resultados completos:', diagnosticResults);

    } catch (error: any) {
      console.error('❌ Erro no diagnóstico:', error);
      diagnosticResults.error = error.message;
      setResults(diagnosticResults);
    } finally {
      setDiagnosing(false);
    }
  };

  const getStatusBadge = (check: any) => {
    if (typeof check === 'boolean') {
      return check ? (
        <Badge className="bg-green-100 text-green-800">✅ OK</Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800">❌ Erro</Badge>
      );
    }
    
    if (check?.success) {
      return <Badge className="bg-green-100 text-green-800">✅ OK</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">❌ Erro</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 Diagnóstico Avançado do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostic} 
          disabled={diagnosing}
          className="w-full"
        >
          {diagnosing ? 'Executando diagnóstico...' : '🚀 Executar Diagnóstico Completo'}
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
                <div>
                  <span className="font-medium">Teste Enum user_role</span>
                  {results.checks.enumTest?.result && (
                    <p className="text-xs text-gray-600">{results.checks.enumTest.result}</p>
                  )}
                </div>
                {getStatusBadge(results.checks.enumTest)}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <span>Tabela profiles</span>
                {getStatusBadge(results.checks.profilesTable)}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <span className="font-medium">Função get_user_role</span>
                  {results.checks.getUserRole?.result && (
                    <p className="text-xs text-gray-600">Retorno: {results.checks.getUserRole.result}</p>
                  )}
                </div>
                {getStatusBadge(results.checks.getUserRole)}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <span>Conexão Supabase</span>
                {getStatusBadge(results.checks.connection)}
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <span className="font-medium">Total de perfis</span>
                  <p className="text-xs text-gray-600">
                    {results.checks.profileCount?.count || 0} perfis encontrados
                  </p>
                </div>
                {getStatusBadge(results.checks.profileCount)}
              </div>
            </div>

            {/* Mostrar erros específicos */}
            {Object.entries(results.checks).map(([key, check]: [string, any]) => (
              check?.error && (
                <div key={key} className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Erro em {key}:</strong> {check.error}
                  </p>
                </div>
              )
            ))}

            {results.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                  <strong>Erro geral:</strong> {results.error}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
