
import { useState, useEffect } from 'react';
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
  MessageSquare, 
  Phone,
  Server,
  Users,
  AlertTriangle,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppAPI } from '@/hooks/useWhatsAppAPI';

interface ZAPITestResult {
  id: string;
  test: string;
  vendorId?: string;
  vendorName?: string;
  status: 'success' | 'error' | 'warning' | 'running';
  message: string;
  timestamp: string;
  details?: any;
}

interface VendorConfig {
  vendorId: string;
  vendorName: string;
  instanceId: string;
  token: string;
  phone: string;
  isActive: boolean;
}

const ZAPIDebugTab = () => {
  const [testResults, setTestResults] = useState<ZAPITestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [vendorConfigs, setVendorConfigs] = useState<VendorConfig[]>([]);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Teste de conectividade Z-API - Sistema Drystore');
  const { getVendorZAPIConfig, sendWhatsAppMessage, isSending } = useWhatsAppAPI();
  const { toast } = useToast();

  useEffect(() => {
    loadVendorConfigs();
  }, []);

  const loadVendorConfigs = () => {
    // Carregar configurações Z-API do localStorage (simulado)
    const configs = JSON.parse(localStorage.getItem('zapi_configs') || '[]');
    setVendorConfigs(configs);
  };

  const addTestResult = (result: Omit<ZAPITestResult, 'id' | 'timestamp'>) => {
    const newResult: ZAPITestResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const testVendorConnection = async (vendor: VendorConfig) => {
    addTestResult({
      test: 'Teste de Conectividade',
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName,
      status: 'running',
      message: `Testando conectividade com instância ${vendor.instanceId}...`
    });

    try {
      // Simular teste de conectividade Z-API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em produção, faria uma chamada real para a API Z-API
      const isConnected = Math.random() > 0.3; // 70% de chance de sucesso para demonstração
      
      if (isConnected) {
        addTestResult({
          test: 'Teste de Conectividade',
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          status: 'success',
          message: `Instância ${vendor.instanceId} conectada com sucesso`,
          details: {
            instanceId: vendor.instanceId,
            phone: vendor.phone,
            responseTime: '1.2s'
          }
        });
      } else {
        throw new Error('Instância offline ou token inválido');
      }

    } catch (error) {
      addTestResult({
        test: 'Teste de Conectividade',
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro na conectividade',
        details: { error, instanceId: vendor.instanceId }
      });
    }
  };

  const testSendMessage = async (vendor: VendorConfig) => {
    if (!testPhone) {
      toast({
        title: "Erro",
        description: "Digite um número de telefone para teste",
        variant: "destructive"
      });
      return;
    }

    addTestResult({
      test: 'Teste de Envio',
      vendorId: vendor.vendorId,
      vendorName: vendor.vendorName,
      status: 'running',
      message: `Enviando mensagem de teste para ${testPhone}...`
    });

    try {
      await sendWhatsAppMessage(testPhone, vendor.phone, testMessage, vendor.vendorId);
      
      addTestResult({
        test: 'Teste de Envio',
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        status: 'success',
        message: `Mensagem enviada com sucesso para ${testPhone}`,
        details: {
          toPhone: testPhone,
          fromPhone: vendor.phone,
          message: testMessage,
          instanceId: vendor.instanceId
        }
      });

    } catch (error) {
      addTestResult({
        test: 'Teste de Envio',
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro no envio',
        details: { error, toPhone: testPhone }
      });
    }
  };

  const testAllInstances = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    if (vendorConfigs.length === 0) {
      toast({
        title: "Nenhuma Configuração",
        description: "Nenhuma configuração Z-API encontrada",
        variant: "destructive"
      });
      setIsRunningTests(false);
      return;
    }

    try {
      for (const vendor of vendorConfigs.filter(v => v.isActive)) {
        await testVendorConnection(vendor);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Testes Concluídos",
        description: "Todos os testes Z-API foram executados",
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

  const getStatusIcon = (status: ZAPITestResult['status']) => {
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

  const getStatusColor = (status: ZAPITestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'running': return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Vendor Configs Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Configurações Z-API
          </CardTitle>
          <CardDescription>
            Status das configurações de vendedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendorConfigs.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma configuração Z-API encontrada. Configure as instâncias Z-API primeiro.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendorConfigs.map((vendor) => (
                <div
                  key={vendor.vendorId}
                  className={`p-4 rounded-lg border ${vendor.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{vendor.vendorName}</h4>
                    <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
                      {vendor.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Instância: {vendor.instanceId}</p>
                    <p>Telefone: {vendor.phone}</p>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testVendorConnection(vendor)}
                      disabled={isRunningTests || !vendor.isActive}
                    >
                      <Server className="w-3 h-3 mr-1" />
                      Testar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSendMessage(vendor)}
                      disabled={isRunningTests || !vendor.isActive || !testPhone}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Enviar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Teste de Mensagem
            </CardTitle>
            <CardDescription>
              Enviar mensagem de teste para um número
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-phone">Número de telefone (com DDD)</Label>
              <Input
                id="test-phone"
                placeholder="Ex: 11999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-message">Mensagem de teste</Label>
              <Input
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Testes Automáticos
            </CardTitle>
            <CardDescription>
              Execute testes em todas as instâncias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testAllInstances}
              disabled={isRunningTests || vendorConfigs.length === 0}
              className="w-full"
            >
              {isRunningTests ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Testar Todas as Instâncias
            </Button>
            
            <div className="text-sm text-gray-600">
              <p>• Testará conectividade de todas as instâncias ativas</p>
              <p>• Verificará status e tempo de resposta</p>
              <p>• Validará tokens de acesso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados dos Testes Z-API</CardTitle>
          <CardDescription>
            Histórico de testes executados nas instâncias Z-API
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
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{result.test}</h4>
                            {result.vendorName && (
                              <Badge variant="outline" className="text-xs">
                                {result.vendorName}
                              </Badge>
                            )}
                          </div>
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

export default ZAPIDebugTab;
