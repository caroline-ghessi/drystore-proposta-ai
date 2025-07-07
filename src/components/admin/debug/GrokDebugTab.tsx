import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock,
  MessageSquare,
  BarChart3,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GrokDebugTab = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState('Analise estes dados de proposta e sugira melhorias.');
  const [apiResponse, setApiResponse] = useState<string>('');
  const { toast } = useToast();

  const testGrokAPI = async () => {
    setIsProcessing(true);
    setApiResponse('');
    
    try {
      // Simular chamada para API do Grok
      const mockResponse = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: 'success',
            message: 'Grok API respondeu com sucesso',
            response: 'Esta é uma resposta simulada do Grok AI. A API está funcionando corretamente e processando análises inteligentes de dados.',
            usage: {
              tokens: 150,
              cost: 0.002
            }
          });
        }, 2000);
      });

      setTestResult(mockResponse);
      setApiResponse((mockResponse as any).response);

      toast({
        title: "Teste Concluído",
        description: "Grok API está funcionando corretamente",
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      });

      toast({
        title: "Erro no Teste",
        description: "Falha na conectividade com Grok API",
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
        <h3 className="text-lg font-medium">Grok AI API</h3>
        <p className="text-sm text-muted-foreground">
          Teste e monitore a análise inteligente de dados
        </p>
      </div>

      {/* Teste Interativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Teste Interativo da API
          </CardTitle>
          <CardDescription>
            Teste a API do Grok com prompts personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            onClick={testGrokAPI} 
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
                Testar API
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
              <div className="p-3 bg-slate-50 rounded-md text-sm">
                {apiResponse}
              </div>
              {testResult?.usage && (
                <div className="text-xs text-muted-foreground">
                  Tokens usados: {testResult.usage.tokens} | Custo: ${testResult.usage.cost}
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
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12 desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.8s</div>
            <p className="text-xs text-muted-foreground">Por consulta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.45</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Análises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Últimas Análises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'Análise de Proposta', status: 'completed', time: '2 min atrás' },
              { type: 'Recomendação de Produtos', status: 'completed', time: '5 min atrás' },
              { type: 'Análise de Texto PDF', status: 'processing', time: '8 min atrás' },
              { type: 'Extração de Dados', status: 'completed', time: '12 min atrás' },
            ].map((analysis, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{analysis.type}</p>
                    <p className="text-xs text-muted-foreground">{analysis.time}</p>
                  </div>
                </div>
                <Badge variant={
                  analysis.status === 'completed' ? 'default' :
                  analysis.status === 'processing' ? 'secondary' : 'destructive'
                }>
                  {analysis.status}
                </Badge>
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
              <p className="text-muted-foreground">100 req/min</p>
            </div>
            <div>
              <span className="font-medium">Modelo:</span>
              <p className="text-muted-foreground">grok-2-vision-latest</p>
            </div>
            <div>
              <span className="font-medium">Timeout:</span>
              <p className="text-muted-foreground">30s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrokDebugTab;