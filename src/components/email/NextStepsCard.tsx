
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const NextStepsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📋 Próximos Passos - Correção de Domínio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">🔧 Para corrigir a configuração de email:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li><strong>Verificar no Resend:</strong> Confirme se propostas.drystore.com.br está verificado</li>
              <li><strong>Alterar no Supabase:</strong> Mude Sender Email para portal@propostas.drystore.com.br</li>
              <li><strong>Testar:</strong> Use o botão "Testar Reset de Senha" acima</li>
              <li><strong>Verificar:</strong> Confirme que o email chega com o remetente correto</li>
            </ol>
          </div>

          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>🎯 Problema Identificado:</strong></p>
                <p className="text-xs">O Supabase está enviando emails com <code>caroline@drystore.com.br</code>, mas deveria usar <code>portal@propostas.drystore.com.br</code> para manter consistência com o subdomínio do portal de propostas.</p>
                
                <p><strong>📍 Onde alterar:</strong></p>
                <p className="text-xs">Supabase Dashboard → Authentication → Settings → Email Provider → Custom SMTP → Sender Email</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-xs"><strong>✅ Após a correção:</strong> Os emails de reset de senha serão enviados de portal@propostas.drystore.com.br, mantendo consistência com o domínio do portal.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
