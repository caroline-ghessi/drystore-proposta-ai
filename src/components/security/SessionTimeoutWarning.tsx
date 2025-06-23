
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Shield } from 'lucide-react';

interface SessionTimeoutWarningProps {
  timeLeft: number;
  onExtend: () => void;
}

const SessionTimeoutWarning = ({ timeLeft, onExtend }: SessionTimeoutWarningProps) => {
  if (timeLeft <= 0 || timeLeft > 5) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Alert className="border-orange-200 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium text-orange-800">
              Sessão expirando em {timeLeft} minuto{timeLeft !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-orange-600">
              Clique para estender sua sessão
            </p>
          </div>
          <Button 
            onClick={onExtend}
            size="sm"
            className="ml-4 bg-orange-600 hover:bg-orange-700"
          >
            <Shield className="w-4 h-4 mr-1" />
            Estender
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SessionTimeoutWarning;
