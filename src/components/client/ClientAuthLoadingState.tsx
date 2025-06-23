
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const ClientAuthLoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Carregando suas propostas...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAuthLoadingState;
