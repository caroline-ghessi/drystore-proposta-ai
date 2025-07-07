import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  MessageSquare, 
  Phone,
  Server,
  Send,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWhapiAPI, type WhapiInstance, type WhatsAppMessage } from '@/hooks/useWhapiAPI';

interface TestResult {
  id: string;
  test: string;
  instanceId?: string;
  vendorName?: string;
  status: 'success' | 'error' | 'warning' | 'running';
  message: string;
  timestamp: string;
  details?: any;
}

const WhapiDebugTab = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [instances, setInstances] = useState<WhapiInstance[]>([]);
  const [messageHistory, setMessageHistory] = useState<WhatsAppMessage[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  
  // Campos de teste
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Teste de conectividade Whapi - Sistema Drystore');
  const [testClientId, setTestClientId] = useState('');

  const { 
    getWhapiInstances, 
    testWhapiInstance, 
    sendWhatsAppMessage,
    getMessageHistory,
    isSending 
  } = useWhapiAPI();
  const { toast } = useToast();

  useEffect(() => {
    loadInstances();
    loadMessageHistory();
  }, []);

  const loadInstances = async () => {
    const data = await getWhapiInstances();
    setInstances(data);
  };

  const loadMessageHistory = async () => {
    const history = await getMessageHistory();
    setMessageHistory(history);
  };

  const addTestResult = (result: Omit<TestResult, 'id' | 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const testInstanceConnection = async (instance: WhapiInstance) => {
    addTestResult({
      test: 'Teste de Conectividade',
      instanceId: instance.instance_id,
      vendorName: instance.vendor_name,
      status: 'running',
      message: `Testando conectividade com instância ${instance.instance_id}...`
    });

    try {
      const success = await testWhapiInstance(instance.instance_id);
      
      if (success) {
        addTestResult({
          test: 'Teste de Conectividade',
          instanceId: instance.instance_id,
          vendorName: instance.vendor_name,
          status: 'success',
          message: `Instância ${instance.instance_id} conectada com sucesso`,
          details: {
            instanceId: instance.instance_id,
            phoneNumber: instance.phone_number,
            webhookUrl: instance.webhook_url
          }
        });
      } else {
        throw new Error('Falha na conectividade');
      }

    } catch (error) {
      addTestResult({
        test: 'Teste de Conectividade',
        instanceId: instance.instance_id,
        vendorName: instance.vendor_name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro na conectividade',
        details: { error, instanceId: instance.instance_id }
      });
    }
  };

  const testSendMessage = async (instance: WhapiInstance) => {
    if (!testPhone || !testClientId) {
      toast({
        title: "Erro",
        description: "Digite um número de telefone e ID do cliente para teste",
        variant: "destructive"
      });
      return;
    }

    addTestResult({
      test: 'Teste de Envio',
      instanceId: instance.instance_id,
      vendorName: instance.vendor_name,
      status: 'running',
      message: `Enviando mensagem de teste para ${testPhone}...`
    });

    try {
      const result = await sendWhatsAppMessage(
        instance.instance_id,
        testPhone,
        testMessage,
        testClientId
      );
      
      if (result) {
        addTestResult({
          test: 'Teste de Envio',
          instanceId: instance.instance_id,
          vendorName: instance.vendor_name,
          status: 'success',
          message: `Mensagem enviada com sucesso para ${testPhone}`,
          details: {
            messageId: result.whapi_message_id,
            toPhone: testPhone,
            message: testMessage,
            status: result.status
          }
        });
        
        // Recarregar histórico
        await loadMessageHistory();
      } else {
        throw new Error('Falha no envio da mensagem');
      }

    } catch (error) {
      addTestResult({
        test: 'Teste de Envio',
        instanceId: instance.instance_id,
        vendorName: instance.vendor_name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro no envio',
        details: { error, toPhone: testPhone }
      });
    }
  };

  const testAllInstances = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    if (instances.length === 0) {
      toast({
        title: "Nenhuma Instância",
        description: "Nenhuma instância Whapi encontrada",
        variant: "destructive"
      });
      setIsRunningTests(false);
      return;
    }

    try {
      for (const instance of instances.filter(i => i.is_active)) {
        await testInstanceConnection(instance);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Testes Concluídos",
        description: "Todos os testes Whapi foram executados",
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

  const getMessageStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'sent': 'default',
      'delivered': 'default',
      'read': 'default',
      'pending': 'secondary',
      'failed': 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Instâncias Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Instâncias Whapi Ativas
          </CardTitle>
          <CardDescription>
            Status das instâncias configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma instância Whapi encontrada. Configure as instâncias primeiro na aba "Whapi Config".
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className={`p-4 rounded-lg border ${instance.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{instance.vendor_name}</h4>
                    <Badge variant={instance.is_active ? 'default' : 'secondary'}>
                      {instance.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Instância: {instance.instance_id}</p>
                    {instance.phone_number && <p>Telefone: {instance.phone_number}</p>}
                    {instance.last_heartbeat && (
                      <p>Último heartbeat: {new Date(instance.last_heartbeat).toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testInstanceConnection(instance)}
                      disabled={isRunningTests || !instance.is_active}
                    >
                      <Server className="w-3 h-3 mr-1" />
                      Testar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSendMessage(instance)}
                      disabled={isRunningTests || !instance.is_active || !testPhone || !testClientId}
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

      {/* Controles de Teste */}
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
                placeholder="Ex: 5511999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-client-id">ID do Cliente (UUID)</Label>
              <Input
                id="test-client-id"
                placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
                value={testClientId}
                onChange={(e) => setTestClientId(e.target.value)}
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
              disabled={isRunningTests || instances.length === 0}
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

      {/* Histórico de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Histórico de Mensagens
          </CardTitle>
          <CardDescription>
            Últimas mensagens enviadas via Whapi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por instância" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as instâncias</SelectItem>
                  {instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id}>
                      {instance.vendor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadMessageHistory}>
                Atualizar
              </Button>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-3">
                {messageHistory
                  .filter(msg => !selectedInstance || msg.whapi_instance_id === selectedInstance)
                  .slice(0, 20)
                  .map((message) => (
                    <div key={message.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Phone className="w-4 h-4" />
                            <span className="font-medium">{message.client_phone}</span>
                            {getMessageStatusBadge(message.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{message.message_content}</p>
                          <p className="text-xs text-gray-500">
                            Enviado: {new Date(message.sent_at).toLocaleString('pt-BR')}
                            {message.delivered_at && (
                              <> • Entregue: {new Date(message.delivered_at).toLocaleString('pt-BR')}</>
                            )}
                          </p>
                          {message.error_message && (
                            <p className="text-xs text-red-600 mt-1">
                              Erro: {message.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados dos Testes Whapi</CardTitle>
          <CardDescription>
            Histórico de testes executados nas instâncias Whapi
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
            <ScrollArea className="h-64">
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

export default WhapiDebugTab;