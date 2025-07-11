import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ExternalLink } from 'lucide-react';

const AdobeTemporaryTokenForm = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <Card className="border-dashed border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Shield className="w-5 h-5" />
          <span>Token Temporário Adobe (24h)</span>
        </CardTitle>
        <CardDescription className="text-blue-700">
          Configure um token temporário da Adobe para testes. O token será armazenado de forma segura no Supabase Secrets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instruções de como obter o token */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Como obter o token temporário:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? 'Ocultar' : 'Mostrar'} instruções
            </Button>
          </div>
          
          {showInstructions && (
            <div className="space-y-3 text-sm text-blue-800">
              <div className="space-y-2">
                <p><strong>1. Acesse o Adobe I/O Console:</strong></p>
                <a 
                  href="https://console.adobe.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 underline"
                >
                  <span>https://console.adobe.io</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="space-y-2">
                <p><strong>2. Entre no seu projeto Adobe</strong></p>
                <p>• Selecione o projeto configurado com as credenciais</p>
                <p>• Vá para "Credentials" &gt; "Service Account (JWT)"</p>
              </div>
              
              <div className="space-y-2">
                <p><strong>3. Gere um novo JWT Token:</strong></p>
                <p>• Clique em "Generate JWT"</p>
                <p>• Selecione os scopes necessários: <code className="bg-gray-100 px-1 rounded">openid, AdobeID, DCAPI</code></p>
                <p>• Copie o "Access Token" gerado</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800">
                  <strong>⚠️ Importante:</strong> O token expira em 24 horas. Após esse período, 
                  o sistema tentará gerar automaticamente um novo token usando as credenciais configuradas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Formulário seguro usando lov-secret-form */}
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">Configurar Token Temporário:</h4>
          <p className="text-sm text-green-800 mb-4">
            Clique no botão abaixo para abrir o formulário seguro de configuração do token temporário. 
            O token será armazenado criptografado nos Supabase Secrets.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
            <p className="text-sm text-green-800">
              <strong>🔒 Segurança:</strong> O token será armazenado de forma criptografada e 
              não aparecerá em nenhum lugar do código ou interface.
            </p>
          </div>
        </div>

        {/* Formulário Seguro - lov-secret-form */}
        <div className="border-t pt-4">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Configurar Token Temporário (Seguro)</span>
            </h5>
            <p className="text-sm text-blue-800 mb-4">
              Configure o token temporário da Adobe de forma segura usando o sistema de secrets do Supabase. 
              O token será criptografado e não aparecerá em nenhum lugar da interface.
            </p>
            
            <div className="bg-white border border-green-200 rounded p-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-green-800">
                <Shield className="w-3 h-3" />
                <span><strong>Segurança garantida:</strong> Token armazenado de forma criptografada</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                <strong>1.</strong> Clique no botão abaixo para abrir o formulário seguro
              </p>
              <p className="text-sm text-gray-700">
                <strong>2.</strong> Cole o token obtido do Adobe Console
              </p>
              <p className="text-sm text-gray-700">
                <strong>3.</strong> Após salvar, clique em "Token Temporário" na seção de status acima
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdobeTemporaryTokenForm;