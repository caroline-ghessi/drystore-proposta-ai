
import { Bug, RefreshCw, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DebugHeaderProps {
  systemStatus: {
    overall: string;
    lastCheck: string;
  };
  onRefreshStatus: () => void;
}

const DebugHeader = ({ systemStatus, onRefreshStatus }: DebugHeaderProps) => {
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
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bug className="w-8 h-8 mr-3 text-drystore-blue" />
          Debug Técnico Unificado
        </h1>
        <p className="text-gray-600 mt-2">
          Central de diagnóstico, configuração e testes de todas as integrações
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
          onClick={onRefreshStatus}
          disabled={systemStatus.overall === 'checking'}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${systemStatus.overall === 'checking' ? 'animate-spin' : ''}`} />
          Atualizar Status
        </Button>
      </div>
    </div>
  );
};

export default DebugHeader;
