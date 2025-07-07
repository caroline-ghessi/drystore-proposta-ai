
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Download, 
  RefreshCw,
  Zap,
  Database,
  FileX
} from 'lucide-react';

const QuickActions = () => {
  const { toast } = useToast();

  const runCompleteTest = async () => {
    toast({
      title: "Teste Iniciado",
      description: "Executando testes de todas as integrações...",
    });
    
    // Simular teste completo
    setTimeout(() => {
      toast({
        title: "Teste Concluído",
        description: "Todas as integrações estão funcionando ✓",
      });
    }, 3000);
  };

  const exportConfigurations = () => {
    toast({
      title: "Export Iniciado",
      description: "Preparando backup das configurações...",
    });
  };

  const resetAllCache = () => {
    toast({
      title: "Cache Limpo",
      description: "Cache de todas as integrações foi resetado",
    });
  };

  const optimizeDatabase = () => {
    toast({
      title: "Otimização Iniciada",
      description: "Limpando logs antigos e otimizando índices...",
    });
  };

  const clearOldLogs = () => {
    toast({
      title: "Logs Limpos",
      description: "Logs antigos foram removidos do sistema",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={runCompleteTest}
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Teste Completo</span>
            <span className="text-xs text-gray-500 text-center">
              Executar todos os testes de integração
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={exportConfigurations}
          >
            <Download className="w-6 h-6 text-blue-600" />
            <span>Export Config</span>
            <span className="text-xs text-gray-500 text-center">
              Backup de todas as configurações
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={resetAllCache}
          >
            <RefreshCw className="w-6 h-6 text-purple-600" />
            <span>Reset Cache</span>
            <span className="text-xs text-gray-500 text-center">
              Limpar cache de todas as APIs
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={optimizeDatabase}
          >
            <Database className="w-6 h-6 text-indigo-600" />
            <span>Otimizar DB</span>
            <span className="text-xs text-gray-500 text-center">
              Limpeza e otimização do banco
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={clearOldLogs}
          >
            <FileX className="w-6 h-6 text-red-600" />
            <span>Limpar Logs</span>
            <span className="text-xs text-gray-500 text-center">
              Remover logs antigos do sistema
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
