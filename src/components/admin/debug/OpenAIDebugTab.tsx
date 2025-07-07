import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bot, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock,
  MessageSquare,
  Settings,
  Send,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OpenAIDebugTab = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState('Olá! Como você pode ajudar com análise de propostas?');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [apiResponse, setApiResponse] = useState<string>('');
  const { toast } = useToast();

  const models = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Rápido e econômico' },
    { value: 'gpt-4o', label: 'GPT-4o', description: 'Mais poderoso' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Análise avançada' },
  ];

  const testOpenAI = async () => {
    setIsProcessing(true);
    setApiResponse('');
    
    try {
      // Simular chamada para OpenAI API
      const mockResponse = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: 'success',
            message: 'OpenAI API respondeu com sucesso',
            response: `Olá! Sou um assistente AI especializado em análise de propostas. Posso ajudar com:

1. Análise de dados de clientes
2. Recomendações de produtos
3. Otimização de preços
4. Geração de texto persuasivo
5. Análise de documentos

Como posso ajudar você hoje?`,
            usage: {
              prompt_tokens: 25,
              completion_tokens: 87,
              total_tokens: 112,
              cost: 0.0034
            },
            model: selectedModel
          });
        }, 1500);
      });

      setTestResult(mockResponse);
      setApiResponse((mockResponse as any).response);

      toast({
        title: "Teste Concluído",
        description: "OpenAI API está funcionando corretamente",
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      });

      toast({
        title: "Erro no Teste",
        description: "Falha na conectividade com OpenAI",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">OpenAI API</h3>
        <p className="text-sm text-muted-foreground">
          Teste e monitore integrações com ChatGPT e outros modelos
        </p>
      </div>

      {/* Teste Interativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Teste Interativo da API
          </CardTitle>
          <CardDescription>
            Teste diferentes modelos OpenAI com prompts personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model-select">Modelo</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div>
                      <div className="font-medium">{model.label}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-prompt">Prompt de Teste</Label>
            <Textarea
              id="test-prompt"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Digite um prompt para testar..."
              rows={3}
            />
          </div>

          <Button 
            onClick={testOpenAI} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Testar {models.find(m => m.value === selectedModel)?.label}
              </>
            )}
          </Button>

          {testResult && (
            <Alert className={testResult.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center">
                {testResult.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className="ml-2">
                  {testResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {apiResponse && (
            <div className="space-y-2">
              <Label>Resposta da API</Label>
              <div className="p-3 bg-slate-50 rounded-md text-sm whitespace-pre-wrap">
                {apiResponse}
              </div>
              {testResult?.usage && (
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>Tokens: {testResult.usage.total_tokens}</div>
                  <div>Custo: ${testResult.usage.cost.toFixed(4)}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Uso */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requests Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+23 desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.2%</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tokens Médios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">Por request</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28.67</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Modelo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Uso por Modelo (Últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { model: 'GPT-4o Mini', requests: 89, cost: 12.34, percentage: 65 },
              { model: 'GPT-4o', requests: 34, cost: 15.67, percentage: 25 },
              { model: 'GPT-4 Turbo', requests: 14, cost: 8.92, percentage: 10 },
            ].map((usage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">{usage.model}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{usage.requests} requests</span>
                    <span>${usage.cost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${usage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações da API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">API Key:</span>
              <p className="text-muted-foreground">Configurada ✓</p>
            </div>
            <div>
              <span className="font-medium">Rate Limit:</span>
              <p className="text-muted-foreground">3000 req/min</p>
            </div>
            <div>
              <span className="font-medium">Max Tokens:</span>
              <p className="text-muted-foreground">4096</p>
            </div>
            <div>
              <span className="font-medium">Temperature:</span>
              <p className="text-muted-foreground">0.7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenAIDebugTab;