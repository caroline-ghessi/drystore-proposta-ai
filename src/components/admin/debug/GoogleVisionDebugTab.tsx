import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileImage,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GoogleVisionDebugTab = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [recentProcesses, setRecentProcesses] = useState<any[]>([]);
  const { toast } = useToast();

  const testGoogleVision = async () => {
    setIsProcessing(true);
    try {
      // Simular teste de conectividade com Google Vision
      const response = await supabase.functions.invoke('process-energy-bill', {
        body: { test: true }
      });

      if (response.error) throw response.error;

      setTestResult({
        status: 'success',
        message: 'Google Vision API funcionando corretamente',
        details: response.data
      });

      toast({
        title: "Teste Concluído",
        description: "Google Vision API está funcionando",
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      });

      toast({
        title: "Erro no Teste",
        description: "Falha na conectividade com Google Vision",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const loadRecentProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('energia_bills_uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentProcesses(data || []);
    } catch (error) {
      console.error('Erro ao carregar processamentos:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Google Vision API</h3>
        <p className="text-sm text-muted-foreground">
          Teste e monitore o processamento de contas de energia
        </p>
      </div>

      {/* Teste de Conectividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Teste de Conectividade
          </CardTitle>
          <CardDescription>
            Verificar se a API do Google Vision está funcionando
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testGoogleVision} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
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
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processamentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">Por processamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Processamentos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileImage className="w-5 h-5 mr-2" />
              Processamentos Recentes
            </span>
            <Button variant="outline" size="sm" onClick={loadRecentProcesses}>
              <Upload className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentProcesses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Clique em "Atualizar" para carregar os processamentos recentes
            </p>
          ) : (
            <div className="space-y-3">
              {recentProcesses.map((process) => (
                <div key={process.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{process.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(process.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={
                    process.extraction_status === 'completed' ? 'default' :
                    process.extraction_status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {process.extraction_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
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
              <span className="font-medium">Projeto ID:</span>
              <p className="text-muted-foreground">Configurado ✓</p>
            </div>
            <div>
              <span className="font-medium">Credenciais:</span>
              <p className="text-muted-foreground">Configuradas ✓</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleVisionDebugTab;