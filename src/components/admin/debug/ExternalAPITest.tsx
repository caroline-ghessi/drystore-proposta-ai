import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ExternalAPITest = () => {
  const [testingGrok, setTestingGrok] = useState(false);
  const [testingAdobe, setTestingAdobe] = useState(false);
  const [grokResult, setGrokResult] = useState<any>(null);
  const [adobeResult, setAdobeResult] = useState<any>(null);
  const { toast } = useToast();

  const testGrokAPI = async () => {
    setTestingGrok(true);
    setGrokResult(null);
    
    try {
      console.log('🤖 Iniciando teste Grok API...');
      
      const { data, error } = await supabase.functions.invoke('test-grok-api', {
        body: { test: 'connectivity' }
      });

      if (error) {
        console.error('❌ Erro no teste Grok:', error);
        setGrokResult({ error: error.message, status: 'failed' });
        toast({
          title: "Erro no Teste Grok",
          description: `Falha: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Teste Grok bem-sucedido:', data);
      setGrokResult(data);
      
      toast({
        title: data?.success ? "Grok API OK" : "Problemas com Grok API",
        description: data?.success 
          ? "Grok API funcionando corretamente" 
          : `Erro: ${data?.error}`,
        variant: data?.success ? "default" : "destructive",
      });

    } catch (error) {
      console.error('🚨 Erro crítico no teste Grok:', error);
      setGrokResult({ error: error.message, status: 'critical_failure' });
      toast({
        title: "Erro Crítico Grok",
        description: `Falha crítica: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestingGrok(false);
    }
  };

  const testAdobeAPI = async () => {
    setTestingAdobe(true);
    setAdobeResult(null);
    
    try {
      console.log('📄 Iniciando teste Adobe API...');
      
      const { data, error } = await supabase.functions.invoke('test-adobe-api', {
        body: { test: 'connectivity' }
      });

      if (error) {
        console.error('❌ Erro no teste Adobe:', error);
        setAdobeResult({ error: error.message, status: 'failed' });
        toast({
          title: "Erro no Teste Adobe",
          description: `Falha: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Teste Adobe bem-sucedido:', data);
      setAdobeResult(data);
      
      toast({
        title: data?.success ? "Adobe API OK" : "Problemas com Adobe API",
        description: data?.success 
          ? "Adobe API funcionando corretamente" 
          : `Erro: ${data?.error?.message || 'Erro desconhecido'}`,
        variant: data?.success ? "default" : "destructive",
      });

    } catch (error) {
      console.error('🚨 Erro crítico no teste Adobe:', error);
      setAdobeResult({ error: error.message, status: 'critical_failure' });
      toast({
        title: "Erro Crítico Adobe",
        description: `Falha crítica: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestingAdobe(false);
    }
  };

  const getStatusBadge = (status: boolean | null | undefined, label: string) => {
    if (status === true) return <Badge variant="default" className="bg-green-500">{label}: OK</Badge>;
    if (status === false) return <Badge variant="destructive">{label}: FALHA</Badge>;
    return <Badge variant="secondary">{label}: N/A</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Teste de APIs Externas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grok" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grok">Grok AI</TabsTrigger>
            <TabsTrigger value="adobe">Adobe PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="grok" className="space-y-4">
            <Button 
              onClick={testGrokAPI} 
              disabled={testingGrok}
              className="w-full"
            >
              {testingGrok ? 'Testando Grok...' : 'Testar Grok AI'}
            </Button>

            {grokResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getStatusBadge(grokResult?.api?.hasKey, "API Key")}
                  {getStatusBadge(grokResult?.api?.keyValid, "Key Válida")}
                  {getStatusBadge(grokResult?.success, "Conectividade")}
                  {getStatusBadge(grokResult?.response?.hasContent, "Resposta")}
                </div>
                
                {grokResult?.response?.messageContent && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <h5 className="font-semibold text-green-800">Resposta Grok:</h5>
                    <p className="text-sm text-green-700">{grokResult.response.messageContent}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Tempo: {grokResult.api.responseTime}ms | Modelo: {grokResult.response.model}
                    </p>
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">Ver Resultado Completo</summary>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 mt-2">
                    {JSON.stringify(grokResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </TabsContent>

          <TabsContent value="adobe" className="space-y-4">
            <Button 
              onClick={testAdobeAPI} 
              disabled={testingAdobe}
              className="w-full"
            >
              {testingAdobe ? 'Testando Adobe...' : 'Testar Adobe API'}
            </Button>

            {adobeResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getStatusBadge(adobeResult?.credentials?.hasClientId, "Client ID")}
                  {getStatusBadge(adobeResult?.credentials?.hasClientSecret, "Client Secret")}
                  {getStatusBadge(adobeResult?.credentials?.hasOrgId, "Org ID")}
                  {getStatusBadge(adobeResult?.authentication?.success, "Autenticação")}
                  {getStatusBadge(adobeResult?.pdfServices?.success, "PDF Services")}
                </div>
                
                {adobeResult?.authentication?.hasAccessToken && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <h5 className="font-semibold text-green-800">Autenticação Adobe OK:</h5>
                    <p className="text-sm text-green-700">
                      Token Type: {adobeResult.authentication.tokenType} | 
                      Expira em: {adobeResult.authentication.expiresIn}s
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Tempo: {adobeResult.authentication.duration}ms
                    </p>
                  </div>
                )}
                
                {adobeResult?.error && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <h5 className="font-semibold text-red-800">Erro Adobe:</h5>
                    <p className="text-sm text-red-700">{adobeResult.error.message}</p>
                    {adobeResult.error.description && (
                      <p className="text-xs text-red-600 mt-1">{adobeResult.error.description}</p>
                    )}
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">Ver Resultado Completo</summary>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 mt-2">
                    {JSON.stringify(adobeResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};