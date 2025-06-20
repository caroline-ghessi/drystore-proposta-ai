
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SMTPConfigurationTab = () => {
  return (
    <Alert>
      <AlertDescription>
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">📧 Configuração SMTP do Resend no Supabase</h4>
          
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

            <div className="p-3 bg-green-50 border-l-4 border-green-400">
              <p className="text-sm"><strong>✅ Situação Atual:</strong></p>
              <ul className="text-xs space-y-1 mt-2">
                <li>• Edge Function conflitante removida</li>
                <li>• Configuração limpa para usar apenas SMTP direto</li>
                <li>• Supabase agora usará exclusivamente o SMTP do Resend</li>
                <li>• Sem mais conflitos entre Edge Function e SMTP</li>
              </ul>
            </div>

            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-sm"><strong>⚠️ Próximos passos:</strong></p>
              <ul className="text-xs space-y-1 mt-2">
                <li>• Confirme que a configuração SMTP está ativa no Supabase</li>
                <li>• Teste o reset de senha usando a aba "Testes"</li>
                <li>• Verifique se o email chega na caixa de entrada</li>
                <li>• Monitore os logs do Supabase para confirmar funcionamento</li>
              </ul>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
