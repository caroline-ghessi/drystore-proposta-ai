
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Trash2, 
  Filter,
  Search,
  Activity,
  AlertTriangle,
  Info,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: 'adobe' | 'zapi' | 'system' | 'auth' | 'database';
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
}

const LogsDebugTab = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    generateMockLogs();
    
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        addNewMockLog();
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, levelFilter, sourceFilter]);

  const generateMockLogs = () => {
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        source: 'adobe',
        message: 'PDF upload realizado com sucesso',
        details: { fileSize: '2.4MB', assetId: 'asset_123456' },
        userId: 'user_123'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'warning',
        source: 'zapi',
        message: 'Instância WhatsApp com latência elevada',
        details: { instanceId: 'inst_456', responseTime: '3.2s' },
        userId: 'user_456'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        level: 'error',
        source: 'adobe',
        message: 'Falha na validação de credenciais Adobe',
        details: { error: 'Invalid client secret', clientId: 'client_789' }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        level: 'info',
        source: 'auth',
        message: 'Usuário logado com sucesso',
        details: { email: 'admin@drystore.com.br', role: 'admin' },
        userId: 'user_admin'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'debug',
        source: 'system',
        message: 'Edge Function upload-to-adobe iniciada',
        details: { functionName: 'upload-to-adobe', executionTime: '1.2s' }
      }
    ];
    
    setLogs(mockLogs);
  };

  const addNewMockLog = () => {
    const sources: LogEntry['source'][] = ['adobe', 'zapi', 'system', 'auth', 'database'];
    const levels: LogEntry['level'][] = ['info', 'warning', 'error', 'debug'];
    const messages = [
      'Operação realizada com sucesso',
      'Verificação de conectividade',
      'Cache atualizado',
      'Backup automático executado',
      'Rate limit aplicado',
      'Token renovado automaticamente'
    ];

    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      details: { generated: true, randomValue: Math.random() }
    };

    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Manter apenas os últimos 100 logs
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    setFilteredLogs(filtered);
  };

  const clearLogs = () => {
    setLogs([]);
    toast({
      title: "Logs Limpos",
      description: "Todos os logs foram removidos",
    });
  };

  const exportLogs = () => {
    const logsData = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-debug-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Logs Exportados",
      description: "Arquivo de logs baixado com sucesso",
    });
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'debug':
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'debug': return 'border-gray-200 bg-gray-50';
    }
  };

  const getSourceBadgeColor = (source: LogEntry['source']) => {
    switch (source) {
      case 'adobe': return 'bg-blue-100 text-blue-800';
      case 'zapi': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      case 'auth': return 'bg-orange-100 text-orange-800';
      case 'database': return 'bg-gray-100 text-gray-800';
    }
  };

  const logsByLevel = {
    info: logs.filter(log => log.level === 'info').length,
    warning: logs.filter(log => log.level === 'warning').length,
    error: logs.filter(log => log.level === 'error').length,
    debug: logs.filter(log => log.level === 'debug').length
  };

  return (
    <div className="space-y-6">
      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{logsByLevel.info}</div>
            <p className="text-xs text-gray-500">Logs informativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
              Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{logsByLevel.warning}</div>
            <p className="text-xs text-gray-500">Avisos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="w-4 h-4 mr-2 text-red-600" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logsByLevel.error}</div>
            <p className="text-xs text-gray-500">Erros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="w-4 h-4 mr-2 text-gray-600" />
              Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{logsByLevel.debug}</div>
            <p className="text-xs text-gray-500">Debug</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Controles de Log</span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isAutoRefresh ? 'animate-spin' : ''}`} />
                {isAutoRefresh ? 'Pausar' : 'Auto-Refresh'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={exportLogs}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={clearLogs}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Fonte</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  <SelectItem value="adobe">Adobe</SelectItem>
                  <SelectItem value="zapi">Z-API</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="auth">Autenticação</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            Logs em Tempo Real ({filteredLogs.length} de {logs.length})
          </CardTitle>
          <CardDescription>
            {isAutoRefresh && (
              <Badge variant="outline" className="mr-2">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Auto-refresh ativo
              </Badge>
            )}
            Logs do sistema ordenados por mais recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum log encontrado com os filtros aplicados</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getLevelIcon(log.level)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{log.message}</h4>
                            <Badge className={`text-xs ${getSourceBadgeColor(log.source)}`}>
                              {log.source}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                            {log.userId && ` • Usuário: ${log.userId}`}
                            {log.sessionId && ` • Sessão: ${log.sessionId}`}
                          </p>
                          
                          {log.details && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                Ver detalhes técnicos
                              </summary>
                              <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      <Badge variant={log.level === 'error' ? 'destructive' : 'default'}>
                        {log.level}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsDebugTab;
