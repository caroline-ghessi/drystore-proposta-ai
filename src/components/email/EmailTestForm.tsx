
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface EmailTestFormProps {
  testEmail: string;
  setTestEmail: (email: string) => void;
  testing: boolean;
  setTesting: (testing: boolean) => void;
  results: any;
  setResults: (results: any) => void;
}

export const EmailTestForm = ({ 
  testEmail, 
  setTestEmail, 
  testing, 
  setTesting, 
  results, 
  setResults 
}: EmailTestFormProps) => {
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
  );
};
