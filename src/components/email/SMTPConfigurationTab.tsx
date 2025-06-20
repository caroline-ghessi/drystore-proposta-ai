
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
                <code className="text-sm bg-white px-2 py-1 rounded">DryStore Portal</code>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Sender Email (IMPORTANTE):</strong><br />
                <code className="text-sm bg-white px-2 py-1 rounded">portal@propostas.drystore.com.br</code>
                <p className="text-xs mt-2 text-yellow-700">
                  ⚠️ <strong>ATENÇÃO:</strong> Use o subdomínio correto! O email deve ser do domínio propostas.drystore.com.br
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50 border-l-4 border-red-400">
              <p className="text-sm"><strong>❌ Problema Identificado:</strong></p>
              <ul className="text-xs space-y-1 mt-2">
                <li>• Email remetente estava configurado como: <code>caroline@drystore.com.br</code></li>
                <li>• Deve ser alterado para: <code>portal@propostas.drystore.com.br</code></li>
                <li>• O subdomínio <code>propostas.drystore.com.br</code> deve estar verificado no Resend</li>
                <li>• Configuração inconsistente causava problemas de entrega</li>
              </ul>
            </div>

            <div className="p-3 bg-green-50 border-l-4 border-green-400">
              <p className="text-sm"><strong>✅ Solução:</strong></p>
              <ul className="text-xs space-y-1 mt-2">
                <li>• Alterar "Sender Email" no Supabase para <code>portal@propostas.drystore.com.br</code></li>
                <li>• Verificar se o domínio está ativo no Resend</li>
                <li>• Testar envio após a alteração</li>
                <li>• Monitorar logs para confirmar funcionamento</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
              <p className="text-sm"><strong>🔍 Verificações no Resend:</strong></p>
              <ul className="text-xs space-y-1 mt-2">
                <li>• Acesse <a href="https://resend.com/domains" target="_blank" className="text-blue-600 underline">resend.com/domains</a></li>
                <li>• Confirme que <code>propostas.drystore.com.br</code> está verificado</li>
                <li>• Verifique se <code>portal@propostas.drystore.com.br</code> é um sender válido</li>
                <li>• Se não estiver configurado, configure antes de prosseguir</li>
              </ul>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
