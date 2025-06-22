
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Upload, 
  Key, 
  Server,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  id: string;
  test: string;
  status: 'success' | 'error' | 'warning' | 'running';
  message: string;
  timestamp: string;
  details?: any;
}

const AdobeDebugTab = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);
  const { toast } = useToast();

  const addTestResult = (result: Omit<TestResult, 'id' | 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const testAdobeCredentials = async () => {
    addTestResult({
      test: 'Validação de Credenciais Adobe',
      status: 'running',
      message: 'Verificando credenciais Adobe...'
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/get-adobe-credentials', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao obter credenciais: ${response.status} - ${errorText}`);
      }

      const credentials = await response.json();
      addTestResult({
        test: 'Validação de Credenciais Adobe',
        status: 'success',
        message: 'Credenciais Adobe obtidas com sucesso',
        details: {
          clientId: credentials.clientId ? `${credentials.clientId.substring(0, 8)}...` : 'Não definido',
          orgId: credentials.orgId ? `${credentials.orgId.substring(0, 8)}...` : 'Não definido',
          hasSecret: !!credentials.clientSecret
        }
      });

    } catch (error) {
      addTestResult({
        test: 'Validação de Credenciais Adobe',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: { error }
      });
    }
  };

  const testAdobeConnectivity = async () => {
    addTestResult({
      test: 'Conectividade Adobe API',
      status: 'running',
      message: 'Testando conectividade com Adobe API...'
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Criar um PDF de teste pequeno
      const testPdfContent = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xC4, 0xE5, 0xF2, 0xE5, 0xEB, 0xA7, 0xF3, 0xA0, 0xD0, 0xC4, 0xC6
      ]);
      const testBlob = new Blob([testPdfContent], { type: 'application/pdf' });
      const testFile = new File([testBlob], 'test.pdf', { type: 'application/pdf' });

      const uploadResponse = await fetch('https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/upload-to-adobe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/pdf',
          'X-File-Name': 'test-debug.pdf',
          'X-File-Size': testFile.size.toString()
        },
        body: testFile
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Falha no teste de upload: ${uploadResponse.status} - ${errorText}`);
      }

      const result = await uploadResponse.json();
      
      if (result.success) {
        addTestResult({
          test: 'Conectividade Adobe API',
          status: 'success',
          message: 'Conectividade com Adobe API confirmada',
          details: {
            assetId: result.assetID,
            strategy: result.strategy,
            fileSize: testFile.size
          }
        });
      } else {
        throw new Error(result.error || 'Falha no upload de teste');
      }

    } catch (error) {
      addTestResult({
        test: 'Conectividade Adobe API',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro na conectividade',
        details: { error }
      });
    }
  };

  const testFileUpload = async () => {
    if (!testFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo PDF para teste",
        variant: "destructive"
      });
      return;
    }

    addTestResult({
      test: 'Upload de Arquivo Personalizado',
      status: 'running',
      message: `Fazendo upload de ${testFile.name}...`
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const uploadResponse = await fetch('https://mlzgeceiinjwpffgsxuy.supabase.co/functions/v1/upload-to-adobe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/pdf',
          'X-File-Name': testFile.name,
          'X-File-Size': testFile.size.toString()
        },
        body: testFile
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Falha no upload: ${uploadResponse.status} - ${errorText}`);
      }

      const result = await uploadResponse.json();
      
      if (result.success) {
        addTestResult({
          test: 'Upload de Arquivo Personalizado',
          status: 'success',
          message: `Upload de ${testFile.name} realizado com sucesso`,
          details: {
            fileName: testFile.name,
            fileSize: testFile.size,
            assetId: result.assetID,
            strategy: result.strategy
          }
        });
      } else {
        throw new Error(result.error || 'Falha no upload');
      }

    } catch (error) {
      addTestResult({
        test: 'Upload de Arquivo Personalizado',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro no upload',
        details: { error, fileName: testFile.name }
      });
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      await testAdobeCredentials();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testAdobeConnectivity();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (testFile) {
        await testFileUpload();
      }
      
      toast({
        title: "Testes Concluídos",
        description: "Todos os testes Adobe foram executados",
      });
    } catch (error) {
      toast({
        title: "Erro nos Testes",
        description: "Erro durante a execução dos testes",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'running': return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Testes Automáticos
            </CardTitle>
            <CardDescription>
              Execute testes de conectividade e validação Adobe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={testAdobeCredentials}
                disabled={isRunningTests}
                variant="outline"
                className="justify-start"
              >
                <Key className="w-4 h-4 mr-2" />
                Testar Credenciais
              </Button>
              
              <Button 
                onClick={testAdobeConnectivity}
                disabled={isRunningTests}
                variant="outline"
                className="justify-start"
              >
                <Server className="w-4 h-4 mr-2" />
                Testar Conectividade
              </Button>
              
              <Separator />
              
              <Button 
                onClick={runAllTests}
                disabled={isRunningTests}
                className="w-full"
              >
                {isRunningTests ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Executar Todos os Testes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Teste de Upload
            </CardTitle>
            <CardDescription>
              Teste upload com arquivo personalizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-file">Arquivo PDF para teste</Label>
              <Input
                id="test-file"
                type="file"
                accept=".pdf"
                onChange={(e) => setTestFile(e.target.files?.[0] || null)}
              />
              {testFile && (
                <p className="text-sm text-gray-600">
                  Arquivo selecionado: {testFile.name} ({(testFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            
            <Button 
              onClick={testFileUpload}
              disabled={!testFile || isRunningTests}
              variant="outline"
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Testar Upload
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados dos Testes</CardTitle>
          <CardDescription>
            Histórico de testes executados e seus resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nenhum teste executado ainda. Execute os testes acima para ver os resultados.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <h4 className="font-medium">{result.test}</h4>
                          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(result.timestamp).toLocaleString('pt-BR')}
                          </p>
                          
                          {result.details && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                Ver detalhes técnicos
                              </summary>
                              <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdobeDebugTab;
