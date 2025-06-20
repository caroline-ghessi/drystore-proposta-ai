
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const NextStepsCard = () => {
  return (
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
  );
};
