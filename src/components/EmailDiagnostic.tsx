
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const EmailDiagnostic = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('caroline@drystore.com.br');

  const testEmailFunction = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log('🔍 Testando função de email diretamente...');
      
      // Simular dados de recuperação de senha
      const testData = {
        type: "user.recovery",
        user: {
          id: "test-user-id",
          email: testEmail
        },
        email_data: {
          token: "test-token-123",
          token_hash: "test-hash-456",
          redirect_to: `${window.location.origin}/reset-password`,
          email_action_type: "recovery",
          site_url: window.location.origin
        }
      };

      console.log('📤 Dados sendo enviados:', testData);

      // Chamar a Edge Function diretamente
      const { data, error } = await supabase.functions.invoke('send-auth-emails', {
        body: testData
      });

      console.log('📥 Resposta recebida:', { data, error });

      if (error) {
        setResults({
          success: false,
          error: error.message,
          details: error
        });
      } else {
        setResults({
          success: true,
          data: data,
          testType: 'direct'
        });
      }

    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
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
      console.log('🔍 Testando recuperação de senha via Supabase Auth...');
      console.log('📧 Email:', testEmail);

      const { error } = await supabase.auth.resetPasswordForEmail(
        testEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      console.log('📥 Resposta do Supabase:', { error });

      if (error) {
        setResults({
          success: false,
          error: error.message,
          details: error,
          testType: 'supabase'
        });
      } else {
        setResults({
          success: true,
          message: 'Solicitação de recuperação enviada via Supabase Auth',
          testType: 'supabase'
        });
      }

    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
      setResults({
        success: false,
        error: err.message,
        details: err,
        testType: 'supabase'
      });
    } finally {
      setTesting(false);
    }
  };

  const testUserExists = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log('🔍 Verificando se usuário existe...');
      
      // Simular uma tentativa de login para verificar se o usuário existe
      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'senha-incorreta-propositalmente'
      });

      if (error?.message.includes('Invalid login credentials')) {
        setResults({
          success: true,
          message: 'Usuário existe no sistema (credenciais inválidas esperadas)',
          testType: 'user-check'
        });
      } else if (error?.message.includes('Email not confirmed')) {
        setResults({
          success: true,
          message: 'Usuário existe mas email não confirmado',
          testType: 'user-check'
        });
      } else {
        setResults({
          success: false,
          error: error?.message || 'Usuário pode não existir',
          testType: 'user-check'
        });
      }

    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
      setResults({
        success: false,
        error: err.message,
        details: err,
        testType: 'user-check'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Diagnóstico Avançado do Sistema de Email</CardTitle>
          <CardDescription>
            Ferramentas completas para diagnosticar problemas no sistema de emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email para teste</Label>
              <Input
                id="test-email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="email@exemplo.com"
                type="email"
              />
            </div>

            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tests">Testes</TabsTrigger>
                <TabsTrigger value="config">Configuração</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={testUserExists}
                    disabled={testing}
                    variant="outline"
                    className="w-full"
                  >
                    {testing ? '⏳' : '👤'} Verificar Usuário
                  </Button>

                  <Button 
                    onClick={testPasswordReset}
                    disabled={testing}
                    className="w-full"
                  >
                    {testing ? '⏳' : '🔑'} Teste Supabase Auth
                  </Button>
                  
                  <Button 
                    onClick={testEmailFunction}
                    disabled={testing}
                    variant="destructive"
                    className="w-full"
                  >
                    {testing ? '⏳' : '⚡'} Teste Edge Function
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="config" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">URLs Importantes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>
                        <strong>Project URL:</strong><br />
                        <code>https://mlzgeceiinjwpffgsxuy.supabase.co</code>
                      </div>
                      <div>
                        <strong>Webhook URL:</strong><br />
                        <code>https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/send-auth-emails</code>
                      </div>
                      <div>
                        <strong>Site URL atual:</strong><br />
                        <code>{window.location.origin}</code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Status da Configuração</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Badge variant="default">Edge Function: Ativa</Badge>
                      <Badge variant="secondary">Modo Diagnóstico: ON</Badge>
                      <Badge variant="outline">Webhook Validation: OFF</Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>📋 Para ver logs detalhados:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Acesse o Supabase Dashboard</li>
                        <li>Vá em "Edge Functions"</li>
                        <li>Clique em "send-auth-emails"</li>
                        <li>Acesse a aba "Logs"</li>
                        <li>Execute um teste e acompanhe em tempo real</li>
                      </ol>
                    </div>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            {results && (
              <Alert variant={results.success ? "default" : "destructive"}>
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={results.success ? "default" : "destructive"}>
                        {results.success ? '✅ Sucesso' : '❌ Erro'}
                      </Badge>
                      {results.testType && (
                        <Badge variant="secondary">
                          {results.testType === 'direct' ? '⚡ Edge Function' : 
                           results.testType === 'supabase' ? '🔑 Supabase Auth' : 
                           '👤 Verificação de Usuário'}
                        </Badge>
                      )}
                      {results.data?.diagnosticMode && (
                        <Badge variant="outline">🔧 Modo Diagnóstico</Badge>
                      )}
                    </div>
                    
                    {results.success ? (
                      <div className="space-y-2">
                        <p><strong>✅ Teste concluído com sucesso!</strong></p>
                        {results.data?.messageId && (
                          <p><strong>📧 ID da mensagem:</strong> {results.data.messageId}</p>
                        )}
                        {results.data?.type && (
                          <p><strong>📋 Tipo:</strong> {results.data.type}</p>
                        )}
                        {results.message && <p><strong>💬 Mensagem:</strong> {results.message}</p>}
                        {results.data?.validated !== undefined && (
                          <p><strong>🔒 Webhook validado:</strong> {results.data.validated ? 'Sim' : 'Não'}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p><strong>❌ Erro:</strong> {results.error}</p>
                        {results.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium">🔍 Ver detalhes técnicos</summary>
                            <pre className="text-xs mt-2 p-3 bg-gray-100 rounded overflow-auto max-h-40">
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📖 Guia de Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🔄 Ordem recomendada de testes:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>Verificar Usuário:</strong> Confirma se o email existe no sistema</li>
                <li><strong>Teste Supabase Auth:</strong> Testa o fluxo normal de recuperação</li>
                <li><strong>Teste Edge Function:</strong> Testa a função de email diretamente</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">🐛 Problemas comuns:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Webhook não configurado:</strong> Edge Function não é chamada</li>
                <li><strong>RESEND_API_KEY inválida:</strong> Emails não são enviados</li>
                <li><strong>Domínio não verificado:</strong> Resend rejeita emails</li>
                <li><strong>Site URL incorreta:</strong> Links de redirecionamento quebrados</li>
              </ul>
            </div>

            <Alert>
              <AlertDescription>
                <p><strong>⚠️ Modo Diagnóstico Ativo:</strong> A validação de webhook está desabilitada para facilitar os testes. Lembre-se de reativar em produção.</p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDiagnostic;
