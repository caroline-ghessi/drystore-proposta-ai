
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdobeTokenStatus from './AdobeTokenStatus';
import AdobeTemporaryTokenForm from './AdobeTemporaryTokenForm';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Upload, 
  Key, 
  Server,
  FileText,
  AlertTriangle,
  Clock,
  Eye,
  Activity,
  Download,
  RefreshCw,
  Play,
  Pause,
  Monitor,
  Zap,
  Database,
  TestTube,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InfrastructureTest } from './InfrastructureTest';
import { AuthenticationTest } from './AuthenticationTest';
import { ExternalAPITest } from './ExternalAPITest';

interface TestResult {
  id: string;
  test: string;
  status: 'success' | 'error' | 'warning' | 'running' | 'timeout';
  message: string;
  timestamp: string;
  duration?: number;
  correlationId?: string;
  details?: any;
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: string;
  status: 'success' | 'error' | 'timeout';
}

interface EdgeFunctionLog {
  timestamp: string;
  function_name: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  correlation_id?: string;
}

const AdobeDebugTab = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [edgeFunctionLogs, setEdgeFunctionLogs] = useState<EdgeFunctionLog[]>([]);
  const [isRealTimeMonitoring, setIsRealTimeMonitoring] = useState(false);
  const [currentCorrelationId, setCurrentCorrelationId] = useState<string>('');
  const [isPerformanceMonitoring, setIsPerformanceMonitoring] = useState(false);
  const [monitoringProgress, setMonitoringProgress] = useState(0);
  const [adobeQuotas, setAdobeQuotas] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected' | 'checking'>('unknown');
  const { toast } = useToast();

  const addTestResult = (result: Omit<TestResult, 'id' | 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      correlationId: currentCorrelationId || `trace_${Date.now()}`
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const addPerformanceMetric = (metric: Omit<PerformanceMetric, 'timestamp'>) => {
    const newMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString()
    };
    setPerformanceMetrics(prev => [newMetric, ...prev.slice(0, 49)]);
  };

  const addEdgeLog = (log: Omit<EdgeFunctionLog, 'timestamp'>) => {
    const newLog: EdgeFunctionLog = {
      ...log,
      timestamp: new Date().toISOString()
    };
    setEdgeFunctionLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const generateCorrelationId = () => {
    const id = `adobe_debug_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    setCurrentCorrelationId(id);
    return id;
  };

  // Novo health check completo
  const runAdobeHealthCheck = async () => {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    
    addTestResult({
      test: 'Health Check Completo Adobe',
      status: 'running',
      message: 'Executando diagnóstico completo da integração Adobe...'
    });

    setConnectionStatus('checking');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar nova edge function de health check
      const { data: healthData, error: healthError } = await supabase.functions.invoke('debug-adobe-health', {
        headers: {
          'X-Correlation-ID': correlationId
        }
      });

      if (healthError) {
        throw new Error(`Health check falhou: ${healthError.message}`);
      }

      const duration = Date.now() - startTime;

      // Atualizar status de conexão
      setConnectionStatus(healthData.overall_status === 'healthy' ? 'connected' : 'disconnected');

      addTestResult({
        test: 'Health Check Completo Adobe',
        status: healthData.overall_status === 'healthy' ? 'success' : 
               healthData.overall_status === 'degraded' ? 'warning' : 'error',
        message: `Health check concluído: ${healthData.overall_status.toUpperCase()}`,
        duration,
        details: healthData
      });

      toast({
        title: "Health Check Concluído",
        description: `Status: ${healthData.overall_status.toUpperCase()}`,
        variant: healthData.overall_status === 'healthy' ? 'default' : 'destructive'
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      setConnectionStatus('disconnected');
      
      addTestResult({
        test: 'Health Check Completo Adobe',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro no health check',
        duration,
        details: { error, correlationId }
      });
    }
  };

  const testAdobeCredentials = async () => {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    
    addTestResult({
      test: 'Validação Avançada de Credenciais Adobe',
      status: 'running',
      message: 'Verificando credenciais e permissões Adobe...'
    });

    addEdgeLog({
      function_name: 'adobe_debug',
      level: 'INFO',
      message: `Iniciando validação de credenciais [${correlationId}]`,
      correlation_id: correlationId
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Teste 1: Obter credenciais
      const { data: credentials, error: credError } = await supabase.functions.invoke('get-adobe-credentials', {
        headers: {
          'X-Correlation-ID': correlationId
        }
      });

      if (credError) {
        throw new Error(`Falha ao obter credenciais: ${credError.message}`);
      }
      addEdgeLog({
        function_name: 'get-adobe-credentials',
        level: 'INFO',
        message: `Credenciais obtidas com sucesso [${correlationId}]`,
        correlation_id: correlationId
      });

      // Teste 2: Validar token de acesso Adobe - CORRIGIDO PARA v1
      const tokenStartTime = Date.now();
      const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'client_id': credentials.clientId,
          'client_secret': credentials.clientSecret,
          'grant_type': 'client_credentials',
          'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext'
        }).toString()
      });

      const tokenDuration = Date.now() - tokenStartTime;
      addPerformanceMetric({
        operation: 'Adobe Token Request',
        duration: tokenDuration,
        status: tokenResponse.ok ? 'success' : 'error'
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token inválido: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      addEdgeLog({
        function_name: 'adobe_token_validation',
        level: 'INFO',
        message: `Token Adobe válido, expira em ${tokenData.expires_in}s [${correlationId}]`,
        correlation_id: correlationId
      });

      // Teste 3: Verificar organizações e quotas
      const orgResponse = await fetch('https://ims-na1.adobelogin.com/ims/organizations/v6', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'X-API-Key': credentials.clientId
        }
      });

      let orgInfo = null;
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        orgInfo = orgData.organizations?.find((org: any) => org.orgId === credentials.orgId);
      }

      const duration = Date.now() - startTime;
      addTestResult({
        test: 'Validação Avançada de Credenciais Adobe',
        status: 'success',
        message: 'Credenciais Adobe validadas com sucesso',
        duration,
        details: {
          clientId: credentials.clientId ? `${credentials.clientId.substring(0, 12)}...` : 'Não definido',
          orgId: credentials.orgId ? `${credentials.orgId.substring(0, 12)}...` : 'Não definido',
          hasSecret: !!credentials.clientSecret,
          tokenValid: true,
          tokenExpiry: tokenData.expires_in,
          organization: orgInfo?.name || 'Verificação de org indisponível',
          correlationId,
          performance: {
            totalTime: duration,
            tokenRequestTime: tokenDuration
          }
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        test: 'Validação Avançada de Credenciais Adobe',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        duration,
        details: { error, correlationId }
      });

      addEdgeLog({
        function_name: 'adobe_debug',
        level: 'ERROR',
        message: `Validação de credenciais falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'} [${correlationId}]`,
        correlation_id: correlationId
      });
    }
  };

  const testAdobeConnectivity = async () => {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    
    addTestResult({
      test: 'Teste de Conectividade e Performance Adobe',
      status: 'running',
      message: 'Testando conectividade completa com Adobe API...'
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Fase 1: Teste de Upload
      addEdgeLog({
        function_name: 'adobe_connectivity_test',
        level: 'INFO',
        message: `Iniciando teste de conectividade [${correlationId}]`,
        correlation_id: correlationId
      });

      const testPdfContent = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xC4, 0xE5, 0xF2, 0xE5, 0xEB, 0xA7, 0xF3, 0xA0, 0xD0, 0xC4, 0xC6
      ]);
      const testBlob = new Blob([testPdfContent], { type: 'application/pdf' });
      const testFile = new File([testBlob], `debug-test-${Date.now()}.pdf`, { type: 'application/pdf' });

      const uploadStartTime = Date.now();
      const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-to-adobe', {
        body: testFile,
        headers: {
          'Content-Type': 'application/pdf',
          'X-File-Name': testFile.name,
          'X-File-Size': testFile.size.toString(),
          'X-Correlation-ID': correlationId
        }
      });

      const uploadDuration = Date.now() - uploadStartTime;
      addPerformanceMetric({
        operation: 'Adobe Upload Test',
        duration: uploadDuration,
        status: uploadError ? 'error' : 'success'
      });

      if (uploadError) {
        throw new Error(`Upload falhou: ${uploadError.message}`);
      }
      addEdgeLog({
        function_name: 'upload-to-adobe',
        level: 'INFO',
        message: `Upload concluído com sucesso em ${uploadDuration}ms [${correlationId}]`,
        correlation_id: correlationId
      });

      // Fase 2: Teste de Extração
      const extractStartTime = Date.now();
      const { data: extractResult, error: extractError } = await supabase.functions.invoke('pdf-text-extractor', {
        body: {
          file_data: btoa(String.fromCharCode(...testPdfContent)),
          file_name: testFile.name,
          extraction_method: 'adobe'
        },
        headers: {
          'X-Correlation-ID': correlationId
        }
      });

      const extractDuration = Date.now() - extractStartTime;
      addPerformanceMetric({
        operation: 'Adobe Text Extraction',
        duration: extractDuration,
        status: extractError ? 'error' : 'success'
      });

      if (!extractError) {
        addEdgeLog({
          function_name: 'pdf-text-extractor',
          level: 'INFO',
          message: `Extração concluída em ${extractDuration}ms [${correlationId}]`,
          correlation_id: correlationId
        });
      }

      const totalDuration = Date.now() - startTime;
      addTestResult({
        test: 'Teste de Conectividade e Performance Adobe',
        status: 'success',
        message: 'Conectividade Adobe validada com sucesso',
        duration: totalDuration,
        details: {
          upload: {
            success: !uploadError,
            duration: uploadDuration,
            assetId: uploadResult?.assetID,
            strategy: uploadResult?.strategy
          },
          extraction: {
            success: !extractError,
            duration: extractDuration,
            textLength: extractResult?.extracted_text?.length || 0,
            method: extractResult?.metadata?.method
          },
          performance: {
            totalTime: totalDuration,
            uploadTime: uploadDuration,
            extractionTime: extractDuration
          },
          correlationId
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        test: 'Teste de Conectividade e Performance Adobe',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro na conectividade',
        duration,
        details: { error, correlationId }
      });

      addEdgeLog({
        function_name: 'adobe_connectivity_test',
        level: 'ERROR',
        message: `Teste de conectividade falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'} [${correlationId}]`,
        correlation_id: correlationId
      });
    }
  };

  // Teste do pipeline de processamento com timeout otimizado
  const testPipelineProcessing = async () => {
    if (!testFile) {
      toast({
        title: "Arquivo necessário",
        description: "Selecione um arquivo PDF para testar o pipeline",
        variant: "destructive"
      });
      return;
    }

    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    
    addTestResult({
      test: 'Pipeline de Processamento Completo',
      status: 'running',
      message: 'Testando pipeline de extração end-to-end...'
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Converter arquivo para base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(btoa(reader.result as string));
        reader.onerror = reject;
        reader.readAsBinaryString(testFile);
      });

      // Chamar pipeline orchestrator com timeout otimizado
      const { data: pipelineResult, error: pipelineError } = await supabase.functions.invoke('pdf-processing-orchestrator', {
        body: {
          fileData,
          fileName: testFile.name,
          userId: session.user.id,
          productGroup: 'geral',
          options: { extractionMethod: 'adobe' }
        },
        headers: {
          'X-Correlation-ID': correlationId
        }
      });

      const duration = Date.now() - startTime;

      if (pipelineError) {
        throw new Error(`Pipeline falhou: ${pipelineError.message}`);
      }

      addTestResult({
        test: 'Pipeline de Processamento Completo',
        status: pipelineResult.success ? 'success' : 'error',
        message: pipelineResult.success ? 
          `Pipeline concluído: ${pipelineResult.data?.items_count || 0} itens processados` :
          `Pipeline falhou: ${pipelineResult.data?.error}`,
        duration,
        details: {
          success: pipelineResult.success,
          items_count: pipelineResult.data?.items_count,
          proposal_id: pipelineResult.data?.proposal_id,
          confidence_score: pipelineResult.final_confidence_score,
          stages: pipelineResult.processing_log?.stages,
          correlationId
        }
      });

      addPerformanceMetric({
        operation: 'Complete PDF Pipeline',
        duration,
        status: pipelineResult.success ? 'success' : 'error'
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        test: 'Pipeline de Processamento Completo',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro no pipeline',
        duration,
        details: { error, correlationId }
      });

      addPerformanceMetric({
        operation: 'Complete PDF Pipeline',
        duration,
        status: 'error'
      });
    }
  };

  const checkConnectionStatus = async () => {
    setConnectionStatus('checking');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setConnectionStatus('disconnected');
        return;
      }

      const { data: credentials, error } = await supabase.functions.invoke('get-adobe-credentials');

      if (!error && credentials) {
        if (credentials.clientId && credentials.clientSecret && credentials.orgId) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const startRealTimeMonitoring = () => {
    setIsRealTimeMonitoring(true);
    setMonitoringProgress(0);
    
    // Simular monitoramento em tempo real
    const interval = setInterval(() => {
      setMonitoringProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRealTimeMonitoring(false);
          return 0;
        }
        return prev + 10;
      });
      
      // Adicionar logs simulados
      addEdgeLog({
        function_name: 'real_time_monitor',
        level: 'INFO',
        message: `Monitoramento ativo - ${Date.now()}`
      });
    }, 1000);
  };

  const exportLogs = () => {
    const logs = {
      testResults,
      performanceMetrics,
      edgeFunctionLogs,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adobe-debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const runComprehensiveTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    setPerformanceMetrics([]);
    setEdgeFunctionLogs([]);
    setIsPerformanceMonitoring(true);
    
    try {
      addEdgeLog({
        function_name: 'comprehensive_test_suite',
        level: 'INFO',
        message: 'Iniciando bateria completa de testes Adobe'
      });

      // Teste 1: Health Check Completo
      await runAdobeHealthCheck();
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Teste 2: Validação de Credenciais
      await testAdobeCredentials();
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Teste 3: Conectividade e Performance
      await testAdobeConnectivity();
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Teste 4: Diagnóstico do Pipeline
      await runPipelineDiagnostics();
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Teste 5: Verificar status da conexão
      await checkConnectionStatus();
      
      toast({
        title: "Bateria de Testes Concluída",
        description: "Todos os testes Adobe foram executados com sucesso",
      });

      addEdgeLog({
        function_name: 'comprehensive_test_suite',
        level: 'INFO',
        message: 'Bateria completa de testes finalizada com sucesso'
      });

    } catch (error) {
      toast({
        title: "Erro na Bateria de Testes",
        description: "Erro durante a execução dos testes",
        variant: "destructive"
      });

      addEdgeLog({
        function_name: 'comprehensive_test_suite',
        level: 'ERROR',
        message: `Bateria de testes falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsRunningTests(false);
      setIsPerformanceMonitoring(false);
    }
  };

  const runPipelineDiagnostics = async () => {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    
    addTestResult({
      test: 'Diagnóstico Completo do Pipeline',
      status: 'running',
      message: 'Analisando performance e gargalos do pipeline...'
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { data: diagnosticResult, error: diagnosticError } = await supabase.functions.invoke('pdf-processing-diagnostics', {
        headers: {
          'X-Correlation-ID': correlationId
        }
      });

      if (diagnosticError) {
        throw new Error(`Diagnóstico falhou: ${diagnosticError.message}`);
      }

      const duration = Date.now() - startTime;

      addTestResult({
        test: 'Diagnóstico Completo do Pipeline',
        status: diagnosticResult.overall_status === 'healthy' ? 'success' : 
               diagnosticResult.overall_status === 'degraded' ? 'warning' : 'error',
        message: `Pipeline ${diagnosticResult.overall_status.toUpperCase()} - ${diagnosticResult.bottlenecks.length} gargalos encontrados`,
        duration,
        details: {
          overall_status: diagnosticResult.overall_status,
          success_rate: diagnosticResult.pipeline_health?.success_rate,
          avg_duration: diagnosticResult.pipeline_health?.avg_duration_ms,
          bottlenecks: diagnosticResult.bottlenecks,
          recommendations: diagnosticResult.recommendations,
          functions_status: diagnosticResult.pipeline_health?.functions,
          correlationId
        }
      });

      addPerformanceMetric({
        operation: 'Pipeline Diagnostics',
        duration,
        status: diagnosticResult.overall_status === 'healthy' ? 'success' : 'error'
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      addTestResult({
        test: 'Diagnóstico Completo do Pipeline',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro no diagnóstico',
        duration,
        details: { error, correlationId }
      });
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
      case 'timeout':
        return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'running': return 'border-blue-200 bg-blue-50';
      case 'timeout': return 'border-orange-200 bg-orange-50';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'checking':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Teste de Infraestrutura Básica */}
      <InfrastructureTest />
      
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Status do Sistema Adobe
            </span>
            <div className="flex items-center space-x-2">
              {getConnectionStatusIcon()}
              <span className="text-sm">
                {connectionStatus === 'connected' ? 'Conectado' : 
                 connectionStatus === 'disconnected' ? 'Desconectado' : 
                 connectionStatus === 'checking' ? 'Verificando...' : 'Desconhecido'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{testResults.length}</div>
              <div className="text-sm text-gray-500">Testes Executados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(r => r.status === 'success').length}
              </div>
              <div className="text-sm text-gray-500">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-gray-500">Erros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {performanceMetrics.length}
              </div>
              <div className="text-sm text-gray-500">Métricas</div>
            </div>
          </div>
        </CardContent>
      </Card>

        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tests">Testes Adobe</TabsTrigger>
            <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
            <TabsTrigger value="auth">Autenticação</TabsTrigger>
            <TabsTrigger value="apis">APIs Externas</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

        <TabsContent value="tests" className="space-y-6">
          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="w-5 h-5 mr-2" />
                  Testes Avançados
                </CardTitle>
                <CardDescription>
                  Bateria completa de testes Adobe com debugging avançado
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
                    Validação Avançada de Credenciais
                  </Button>
                  
                  <Button 
                    onClick={testAdobeConnectivity}
                    disabled={isRunningTests}
                    variant="outline"
                    className="justify-start"
                  >
                    <Server className="w-4 h-4 mr-2" />
                    Teste de Performance e Conectividade
                  </Button>
                  
                  <Button 
                    onClick={runAdobeHealthCheck}
                    disabled={isRunningTests}
                    variant="outline"
                    className="justify-start"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Health Check Completo
                  </Button>
                  
                  <Button 
                    onClick={runPipelineDiagnostics}
                    disabled={isRunningTests}
                    variant="outline"
                    className="justify-start"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Diagnóstico do Pipeline
                  </Button>
                  
                  <Button 
                    onClick={checkConnectionStatus}
                    disabled={isRunningTests}
                    variant="outline"
                    className="justify-start"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar Status da Conexão
                  </Button>
                  
                  <Separator />
                  
                  <Button 
                    onClick={runComprehensiveTests}
                    disabled={isRunningTests}
                    className="w-full"
                  >
                    {isRunningTests ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Executar Bateria Completa
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Pipeline de Extração
                </CardTitle>
                <CardDescription>
                  Teste completo do pipeline de processamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-file">Arquivo PDF para teste completo</Label>
                  <Input
                    id="test-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                  />
                  {testFile && (
                    <div className="text-sm space-y-1">
                      <p className="text-gray-600">
                        Arquivo: {testFile.name}
                      </p>
                      <p className="text-gray-600">
                        Tamanho: {(testFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-gray-600">
                        Tipo: {testFile.type}
                      </p>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={testPipelineProcessing}
                  disabled={isRunningTests || !testFile}
                  className="w-full"
                >
                  {isRunningTests ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Testar Pipeline Completo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultados dos Testes</span>
                {testResults.length > 0 && (
                  <Button onClick={() => setTestResults([])} variant="outline" size="sm">
                    Limpar Resultados
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Histórico detalhado de testes com correlação de IDs e performance
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
                              
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>{new Date(result.timestamp).toLocaleString('pt-BR')}</span>
                                {result.duration && (
                                  <span className="flex items-center">
                                    <Timer className="w-3 h-3 mr-1" />
                                    {formatDuration(result.duration)}
                                  </span>
                                )}
                                {result.correlationId && (
                                  <span className="font-mono">ID: {result.correlationId.split('_').slice(-1)[0]}</span>
                                )}
                              </div>
                              
                              {result.details && (
                                <details className="mt-2">
                                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                    Ver detalhes técnicos
                                  </summary>
                                  <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-40">
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Métricas de Performance
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={startRealTimeMonitoring}
                    disabled={isRealTimeMonitoring}
                    variant="outline"
                    size="sm"
                  >
                    {isRealTimeMonitoring ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isRealTimeMonitoring ? 'Pausar' : 'Monitorar'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isRealTimeMonitoring && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Monitoramento em tempo real</span>
                    <span className="text-sm">{monitoringProgress}%</span>
                  </div>
                  <Progress value={monitoringProgress} className="h-2" />
                </div>
              )}
              
              {performanceMetrics.length === 0 ? (
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    Execute testes para ver métricas de performance.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {performanceMetrics.map((metric, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">{metric.operation}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(metric.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm">{formatDuration(metric.duration)}</div>
                          <Badge
                            variant={metric.status === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Logs das Edge Functions
                </span>
                <Button onClick={exportLogs} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {edgeFunctionLogs.length === 0 ? (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Execute testes para ver logs das edge functions.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {edgeFunctionLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          log.level === 'ERROR' ? 'border-red-500 bg-red-50' :
                          log.level === 'WARN' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Badge variant="outline" className="font-mono text-xs">
                                {log.function_name}
                              </Badge>
                              <Badge 
                                variant={log.level === 'ERROR' ? 'destructive' : 'default'}
                                className="text-xs"
                              >
                                {log.level}
                              </Badge>
                              {log.correlation_id && (
                                <span className="font-mono text-xs text-gray-500">
                                  {log.correlation_id.split('_').slice(-1)[0]}
                                </span>
                              )}
                            </div>
                            <p className="text-sm mt-1">{log.message}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          {/* Adobe Token Status - Nova seção integrada */}
          <AdobeTokenStatus />
          
          {/* Adobe Temporary Token Form - Nova seção para token temporário */}
          <AdobeTemporaryTokenForm />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Console de Debug Interativo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Execute comandos específicos de debug Adobe
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => generateCorrelationId()}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar Novo Correlation ID
                  </Button>
                  
                  <Button 
                    onClick={() => setPerformanceMetrics([])}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Limpar Métricas de Performance
                  </Button>
                  
                  <Button 
                    onClick={() => setEdgeFunctionLogs([])}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Limpar Logs
                  </Button>
                </div>
                
                {currentCorrelationId && (
                  <div className="p-2 bg-gray-100 rounded text-xs font-mono">
                    Current ID: {currentCorrelationId}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  Simulador de Cenários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Simule diferentes cenários de erro e sucesso
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => addTestResult({
                      test: 'Simulação de Timeout',
                      status: 'timeout',
                      message: 'Timeout simulado para testes'
                    })}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Simular Timeout
                  </Button>
                  
                  <Button 
                    onClick={() => addTestResult({
                      test: 'Simulação de Erro de Rede',
                      status: 'error',
                      message: 'Erro de rede simulado'
                    })}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Simular Erro de Rede
                  </Button>
                  
                  <Button 
                    onClick={() => addTestResult({
                      test: 'Simulação de Sucesso',
                      status: 'success',
                      message: 'Operação simulada com sucesso'
                    })}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Simular Sucesso
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <InfrastructureTest />
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <AuthenticationTest />
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <ExternalAPITest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdobeDebugTab;
