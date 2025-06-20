
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
          <CardTitle>🔧 Configuração SMTP do Resend</CardTitle>
          <CardDescription>
            Instruções para configurar o SMTP direto do Resend no Supabase
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

            <Tabs defaultValue="smtp-config" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="smtp-config">Configuração SMTP</TabsTrigger>
                <TabsTrigger value="tests">Testes</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>

              <TabsContent value="smtp-config" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">📧 Configurar SMTP do Resend no Supabase</h4>
                      
                      <div className="space-y-3">
                        <p><strong>1. Acesse o painel do Supabase:</strong></p>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">• Vá para <code>Authentication → Settings</code></p>
                          <p className="text-sm">• Encontre a seção <strong>"Email Provider"</strong></p>
                          <p className="text-sm">• Selecione <strong>"Custom SMTP"</strong></p>
                        </div>

                        <p><strong>2. Configure com as credenciais corretas do Resend:</strong></p>
                        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                          <div>
                            <strong>SMTP Host:</strong><br />
                            <code className="text-sm bg-white px-2 py-1 rounded">smtp.resend.com</code>
                          </div>
                          <div>
                            <strong>SMTP Port:</strong><br />
                            <code className="text-sm bg-white px-2 py-1 rounded">465</code>
                          </div>
                          <div>
                            <strong>Enable SSL:</strong><br />
                            <code className="text-sm bg-white px-2 py-1 rounded">Sim (marcado)</code>
                          </div>
                          <div>
                            <strong>SMTP User:</strong><br />
                            <code className="text-sm bg-white px-2 py-1 rounded">resend</code>
                          </div>
                          <div>
                            <strong>SMTP Password:</strong><br />
                            <code className="text-sm bg-white px-2 py-1 rounded">SUA_API_KEY_DO_RESEND</code>
                          </div>
                          <div>
                            <strong>Sender Name:</strong><br />
                            <code className="text-sm bg-white px-2 py-1 rounded">DryStore</code>
                          </div>
                          <div>
                            <strong>Sender Email:</strong><br />
                            <code className="text-sm bg-white px-2 py-1 rounded">caroline@drystore.com.br</code>
                          </div>
                        </div>

                        <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                          <p className="text-sm"><strong>⚠️ Importante:</strong></p>
                          <ul className="text-xs space-y-1 mt-2">
                            <li>• Use sua API Key do Resend como senha SMTP</li>
                            <li>• Certifique-se que o domínio está verificado no Resend</li>
                            <li>• O email do remetente deve usar um domínio verificado</li>
                            <li>• Teste após a configuração para confirmar funcionamento</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-green-50 border-l-4 border-green-400">
                          <p className="text-sm"><strong>✅ Vantagens desta configuração:</strong></p>
                          <ul className="text-xs space-y-1 mt-2">
                            <li>• Configuração mais simples e direta</li>
                            <li>• Usa a infraestrutura SMTP nativa do Supabase</li>
                            <li>• Menos complexidade de código</li>
                            <li>• Funciona com templates padrão do Supabase</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="tests" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {testing ? '⏳' : '🔑'} Testar Reset de Senha
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Status da Configuração</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Badge variant="default">SMTP Resend: Configurado</Badge>
                      <Badge variant="secondary">Template: Supabase Padrão</Badge>
                      <Badge variant="outline">Configuração: Simplificada</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">URLs Importantes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>
                        <strong>Supabase Auth:</strong><br />
                        <code>https://mlzgeceiinjwpffgsxuy.supabase.co</code>
                      </div>
                      <div>
                        <strong>Reset URL:</strong><br />
                        <code>{window.location.origin}/reset-password</code>
                      </div>
                      <div>
                        <strong>Resend Dashboard:</strong><br />
                        <code>https://resend.com/domains</code>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                          {results.testType === 'supabase' ? '🔑 Supabase Auth' : '👤 Verificação de Usuário'}
                        </Badge>
                      )}
                    </div>
                    
                    {results.success ? (
                      <div className="space-y-2">
                        <p><strong>✅ Teste concluído com sucesso!</strong></p>
                        {results.message && <p><strong>💬 Mensagem:</strong> {results.message}</p>}
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
          <CardTitle className="text-lg">📋 Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🔄 Para implementar a configuração:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>Configure o SMTP:</strong> Use as credenciais acima no painel do Supabase</li>
                <li><strong>Teste a funcionalidade:</strong> Use o botão "Testar Reset de Senha" acima</li>
                <li><strong>Verifique o email:</strong> Confirme que o email chegou na caixa de entrada</li>
                <li><strong>Teste o link:</strong> Clique no link e redefina a senha</li>
              </ol>
            </div>

            <Alert>
              <AlertDescription>
                <p><strong>🎯 Esta configuração SMTP direta do Resend é mais simples e deve resolver o problema de emails não chegando.</strong></p>
                <p className="text-xs mt-2">Após configurar no Supabase, teste usando o botão acima para confirmar que está funcionando.</p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDiagnostic;
