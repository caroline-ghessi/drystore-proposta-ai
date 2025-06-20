
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const StatusTab = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">📊 Status da Configuração de Email</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    ✅ Resolvido
                  </Badge>
                  <span className="font-medium">Edge Function</span>
                </div>
                <p className="text-sm text-green-700">
                  Edge Function conflitante removida com sucesso
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    ✅ Limpo
                  </Badge>
                  <span className="font-medium">Configuração</span>
                </div>
                <p className="text-sm text-green-700">
                  Config.toml limpo, sem conflitos
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    🔧 Ativo
                  </Badge>
                  <span className="font-medium">SMTP Direto</span>
                </div>
                <p className="text-sm text-blue-700">
                  Supabase usará apenas SMTP do Resend
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    ⏳ Teste
                  </Badge>
                  <span className="font-medium">Validação</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Pronto para testes na aba "Testes"
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">🔍 Diagnóstico Completo:</h5>
              <ul className="text-sm space-y-1">
                <li>✅ <strong>Problema identificado:</strong> Conflito entre Edge Function e SMTP direto</li>
                <li>✅ <strong>Solução implementada:</strong> Remoção da Edge Function conflitante</li>
                <li>✅ <strong>Configuração limpa:</strong> Apenas SMTP direto ativo</li>
                <li>🔄 <strong>Próximo passo:</strong> Testar reset de senha</li>
              </ul>
            </div>

            <div className="p-3 bg-green-100 border-l-4 border-green-500">
              <p className="text-sm font-medium text-green-800">
                🎉 Configuração otimizada! O conflito foi resolvido e agora o Supabase deve enviar emails corretamente via SMTP do Resend.
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
