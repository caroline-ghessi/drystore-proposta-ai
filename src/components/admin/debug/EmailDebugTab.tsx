
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Key,
  Globe,
  User
} from 'lucide-react';

const EmailDebugTab = () => {
  const [testEmail, setTestEmail] = useState('caroline@drystore.com.br');
  const [vendorEmail, setVendorEmail] = useState('vendedor@drystore.com.br');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runEmailTest = async (testType: string) => {
    setTesting(true);
    setResults(null);

    try {
      console.log('🔧 Running email test:', testType);
      
      const { data, error } = await supabase.functions.invoke('test-resend-email', {
        body: {
          testType,
          email: testEmail,
          vendorEmail
        }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      
      if (data.success) {
        toast({
          title: "Teste realizado com sucesso!",
          description: data.message,
        });
      } else {
        toast({
          title: "Teste falhou",
          description: data.error || "Erro desconhecido",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Email test error:', error);
      const errorMessage = error.message || 'Erro inesperado durante o teste';
      
      setResults({
        success: false,
        error: errorMessage
      });

      toast({
        title: "Erro no teste",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2 text-blue-600" />
            Configuração SMTP & Resend
          </CardTitle>
          <CardDescription>
            Status atual das configurações de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800">✅ Ativo</Badge>
                <span className="font-medium">SMTP Direto</span>
              </div>
              <p className="text-sm text-green-700">
                Supabase → Resend SMTP configurado
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-100 text-yellow-800">⚠️ Verificar</Badge>
                <span className="font-medium">Domínio</span>
              </div>
              <p className="text-sm text-yellow-700">
                propostas.drystore.com.br
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800">🔑 API</Badge>
                <span className="font-medium">Resend</span>
              </div>
              <p className="text-sm text-blue-700">
                API Key configurada via Secrets
              </p>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Instruções SMTP no Supabase:</strong><br />
              1. Acesse Authentication → Settings → SMTP Settings<br />
              2. Enable custom SMTP: ✅<br />
              3. Host: smtp.resend.com<br />
              4. Port: 587<br />
              5. Username: resend<br />
              6. Password: [RESEND_API_KEY]<br />
              7. Sender email: portal@propostas.drystore.com.br
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="w-5 h-5 mr-2 text-purple-600" />
            Testes de Email
          </CardTitle>
          <CardDescription>
            Execute diferentes tipos de teste de envio de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEmail">Email para Teste</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="vendorEmail">Email do Vendedor</Label>
              <Input
                id="vendorEmail"
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="vendedor@drystore.com.br"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => runEmailTest('reset_password')}
              disabled={testing || !testEmail}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <RefreshCw className={`w-6 h-6 text-blue-600 ${testing ? 'animate-spin' : ''}`} />
              <span>Reset Senha</span>
              <span className="text-xs text-gray-500 text-center">
                Via Supabase Auth
              </span>
            </Button>

            <Button
              onClick={() => runEmailTest('client_proposal')}
              disabled={testing || !testEmail}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <User className="w-6 h-6 text-green-600" />
              <span>Email Cliente</span>
              <span className="text-xs text-gray-500 text-center">
                Simulação de proposta
              </span>
            </Button>

            <Button
              onClick={() => runEmailTest('resend_api')}
              disabled={testing || !testEmail}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Send className="w-6 h-6 text-purple-600" />
              <span>Resend Direto</span>
              <span className="text-xs text-gray-500 text-center">
                Via API direta
              </span>
            </Button>

            <Button
              onClick={() => runEmailTest('domain_validation')}
              disabled={testing}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Globe className="w-6 h-6 text-orange-600" />
              <span>Validar Domínio</span>
              <span className="text-xs text-gray-500 text-center">
                Verificar DNS
              </span>
            </Button>
          </div>

          {results && (
            <Alert className={results.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {results.success ? 
                <CheckCircle className="h-4 w-4 text-green-600" /> : 
                <XCircle className="h-4 w-4 text-red-600" />
              }
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {results.success ? '✅ Teste Realizado com Sucesso' : '❌ Teste Falhou'}
                  </p>
                  <p>{results.message || results.error}</p>
                  {results.email && (
                    <p className="text-sm"><strong>Email:</strong> {results.email}</p>
                  )}
                  {results.resendResponse && (
                    <div className="text-sm">
                      <strong>Resend ID:</strong> {results.resendResponse.id}
                    </div>
                  )}
                  {results.domain && (
                    <div className="text-sm">
                      <strong>Domínio:</strong> {results.domain} - 
                      <span className={results.accessible ? 'text-green-600' : 'text-red-600'}>
                        {results.accessible ? ' Acessível' : ' Inacessível'}
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-gray-600" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-100 border-l-4 border-blue-500">
              <p className="text-sm font-medium text-blue-800">
                🎯 <strong>Para resolver completamente:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>1. Verificar domínio no Resend: <code>propostas.drystore.com.br</code></li>
                <li>2. Alterar "Sender Email" no Supabase para: <code>portal@propostas.drystore.com.br</code></li>
                <li>3. Testar todos os fluxos de email após as alterações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDebugTab;
