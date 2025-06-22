
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Trash2,
  Settings,
  MessageSquare,
  FileText
} from 'lucide-react';
import PermissionGuard from '@/components/PermissionGuard';
import AdobeDebugTab from '@/components/admin/debug/AdobeDebugTab';
import ZAPIDebugTab from '@/components/admin/debug/ZAPIDebugTab';
import SystemDebugTab from '@/components/admin/debug/SystemDebugTab';
import LogsDebugTab from '@/components/admin/debug/LogsDebugTab';

const TechnicalDebug = () => {
  const [activeTab, setActiveTab] = useState('adobe');
  const [systemStatus, setSystemStatus] = useState({
    overall: 'healthy',
    lastCheck: new Date().toISOString()
  });

  const handleRefreshStatus = () => {
    setSystemStatus({
      overall: 'checking',
      lastCheck: new Date().toISOString()
    });
    
    // Simular verificação do sistema
    setTimeout(() => {
      setSystemStatus({
        overall: 'healthy',
        lastCheck: new Date().toISOString()
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'checking': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'checking': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <PermissionGuard requiredRole={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bug className="w-8 h-8 mr-3 text-drystore-blue" />
              Debug Técnico
            </h1>
            <p className="text-gray-600 mt-2">
              Diagnóstico e testes de integrações do sistema
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status geral:</span>
              <div className={`flex items-center space-x-1 ${getStatusColor(systemStatus.overall)}`}>
                {getStatusIcon(systemStatus.overall)}
                <span className="font-medium capitalize">{systemStatus.overall}</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={systemStatus.overall === 'checking'}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${systemStatus.overall === 'checking' ? 'animate-spin' : ''}`} />
              Atualizar Status
            </Button>
          </div>
        </div>

        {/* Status Cards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Adobe PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Conectado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                Z-API WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Verificando</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Settings className="w-4 h-4 mr-2 text-gray-600" />
                Edge Functions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Funcionando</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="w-4 h-4 mr-2 text-purple-600" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Saudável</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Debug Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Ferramentas de Diagnóstico</CardTitle>
            <CardDescription>
              Selecione uma aba para testar e diagnosticar diferentes componentes do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="adobe" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Adobe PDF</span>
                </TabsTrigger>
                <TabsTrigger value="zapi" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Z-API</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Sistema</span>
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Logs</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="adobe" className="space-y-4">
                  <AdobeDebugTab />
                </TabsContent>

                <TabsContent value="zapi" className="space-y-4">
                  <ZAPIDebugTab />
                </TabsContent>

                <TabsContent value="system" className="space-y-4">
                  <SystemDebugTab />
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                  <LogsDebugTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Teste Completo</span>
                <span className="text-xs text-gray-500 text-center">
                  Executar todos os testes de integração
                </span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Download className="w-6 h-6 text-blue-600" />
                <span>Export de Logs</span>
                <span className="text-xs text-gray-500 text-center">
                  Baixar logs para análise externa
                </span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <RefreshCw className="w-6 h-6 text-purple-600" />
                <span>Reset Cache</span>
                <span className="text-xs text-gray-500 text-center">
                  Limpar cache e reiniciar conexões
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>Última verificação:</strong> {new Date(systemStatus.lastCheck).toLocaleString('pt-BR')}
            <br />
            Esta página é restrita a administradores e contém informações sensíveis do sistema.
          </AlertDescription>
        </Alert>
      </div>
    </PermissionGuard>
  );
};

export default TechnicalDebug;
