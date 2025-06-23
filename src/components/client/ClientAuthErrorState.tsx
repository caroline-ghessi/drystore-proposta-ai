
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ClientAuthErrorStateProps {
  onRetry: () => void;
}

const ClientAuthErrorState = ({ onRetry }: ClientAuthErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Email não encontrado</h2>
          <p className="text-gray-600 text-center mb-6">
            Este email não possui propostas em nosso sistema.
          </p>
          <Button onClick={onRetry}>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAuthErrorState;
