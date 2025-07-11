import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export const AuthenticationTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testAuthentication = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('🔐 Iniciando teste de autenticação...');
      
      const { data, error } = await supabase.functions.invoke('test-auth', {
        body: { test: 'authentication' }
      });

      if (error) {
        console.error('❌ Erro no teste de autenticação:', error);
        setResult({ error: error.message, status: 'failed' });
        toast({
          title: "Erro no Teste de Autenticação",
          description: `Falha: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Teste de autenticação bem-sucedido:', data);
      setResult(data);
      
      const isAuthenticated = data?.user?.hasUser && data?.session?.hasSession;
      
      toast({
        title: isAuthenticated ? "Autenticação OK" : "Problemas de Autenticação",
        description: isAuthenticated 
          ? "Usuário autenticado corretamente" 
          : "Usuário não autenticado ou sessão inválida",
        variant: isAuthenticated ? "default" : "destructive",
      });

    } catch (error) {
      console.error('🚨 Erro crítico no teste de autenticação:', error);
      setResult({ error: error.message, status: 'critical_failure' });
      toast({
        title: "Erro Crítico",
        description: `Falha crítica: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (status: boolean | null | undefined, label: string) => {
    if (status === true) return <Badge variant="default" className="bg-green-500">{label}: OK</Badge>;
    if (status === false) return <Badge variant="destructive">{label}: FALHA</Badge>;
    return <Badge variant="secondary">{label}: N/A</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Teste de Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testAuthentication} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testando Autenticação...' : 'Testar Autenticação'}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getStatusBadge(result?.headers?.hasAuthHeader, "Auth Header")}
              {getStatusBadge(result?.user?.hasUser, "Usuário")}
              {getStatusBadge(result?.session?.hasSession, "Sessão")}
              {getStatusBadge(result?.database?.canQueryDb, "Banco de Dados")}
            </div>
            
            {result?.user?.hasUser && (
              <div className="bg-green-50 p-3 rounded-md">
                <h5 className="font-semibold text-green-800">Usuário Logado:</h5>
                <p className="text-sm text-green-700">ID: {result.user.userId}</p>
                <p className="text-sm text-green-700">Email: {result.user.userEmail}</p>
              </div>
            )}
            
            {result?.error && (
              <div className="bg-red-50 p-3 rounded-md">
                <h5 className="font-semibold text-red-800">Erro:</h5>
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
            )}
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Resultado Completo:</h4>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};