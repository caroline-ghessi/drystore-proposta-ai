
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity } from 'lucide-react';

interface SystemInfoProps {
  lastCheck: string;
}

const SystemInfo = ({ lastCheck }: SystemInfoProps) => {
  return (
    <Alert>
      <Activity className="h-4 w-4" />
      <AlertDescription>
        <strong>Última verificação:</strong> {new Date(lastCheck).toLocaleString('pt-BR')}
        <br />
        <strong>Páginas consolidadas:</strong> /email-diagnostic e /admin/zapi-config foram unificadas nesta central.
        <br />
        Esta página é restrita a administradores e contém informações sensíveis do sistema.
      </AlertDescription>
    </Alert>
  );
};

export default SystemInfo;
