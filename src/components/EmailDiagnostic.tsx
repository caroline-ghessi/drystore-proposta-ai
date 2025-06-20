
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const EmailDiagnostic = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testEmailFunction = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log('Testando função de email...');
      
      // Simular dados de recuperação de senha
      const testData = {
        type: "user.recovery",
        user: {
          id: "test-user-id",
          email: "teste@example.com"
        },
        email_data: {
          token: "test-token",
          token_hash: "test-hash",
          redirect_to: `${window.location.origin}/dashboard`,
          email_action_type: "recovery",
          site_url: window.location.origin
        }
      };

      // Chamar a Edge Function diretamente
      const { data, error } = await supabase.functions.invoke('send-auth-emails', {
        body: testData
      });

      if (error) {
        setResults({
          success: false,
          error: error.message,
          details: error
        });
      } else {
        setResults({
          success: true,
          data: data
        });
      }

    } catch (err: any) {
      console.error('Erro no teste:', err);
      setResults({
        success: false,
        error: err.message,
        details: err
      });
    } finally {
      setTesting(false);
    }
  };

  const testPasswordReset = async () => {
    setTesting(true);
    setResults(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        'teste@example.com',
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (error) {
        setResults({
          success: false,
          error: error.message,
          details: error
        });
      } else {
        setResults({
          success: true,
          message: 'Solicitação de recuperação enviada via Supabase'
        });
      }

    } catch (err: any) {
      console.error('Erro no teste:', err);
      setResults({
        success: false,
        error: err.message,
        details: err
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico do Sistema de Email</CardTitle>
          <CardDescription>
            Teste o sistema de envio de emails e webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testEmailFunction}
              disabled={testing}
              variant="outline"
            >
              {testing ? 'Testando...' : 'Testar Edge Function Diretamente'}
            </Button>
            
            <Button 
              onClick={testPasswordReset}
              disabled={testing}
            >
              {testing ? 'Testando...' : 'Testar Recuperação de Senha'}
            </Button>
          </div>

          {results && (
            <Alert variant={results.success ? "default" : "destructive"}>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={results.success ? "default" : "destructive"}>
                      {results.success ? 'Sucesso' : 'Erro'}
                    </Badge>
                    {results.data?.diagnosticMode && (
                      <Badge variant="secondary">Modo Diagnóstico</Badge>
                    )}
                  </div>
                  
                  {results.success ? (
                    <div>
                      <p><strong>✅ Teste concluído com sucesso!</strong></p>
                      {results.data?.messageId && (
                        <p>ID da mensagem: {results.data.messageId}</p>
                      )}
                      {results.data?.type && (
                        <p>Tipo: {results.data.type}</p>
                      )}
                      {results.message && <p>{results.message}</p>}
                    </div>
                  ) : (
                    <div>
                      <p><strong>❌ Erro:</strong> {results.error}</p>
                      {results.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm">Ver detalhes</summary>
                          <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                            {JSON.stringify(results.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Como usar:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Testar Edge Function:</strong> Chama a função diretamente com dados simulados</li>
              <li><strong>Testar Recuperação:</strong> Usa o fluxo normal do Supabase Auth</li>
            </ul>
            <p className="text-yellow-600">
              ⚠️ A função está em modo diagnóstico (validação de webhook desabilitada)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDiagnostic;
