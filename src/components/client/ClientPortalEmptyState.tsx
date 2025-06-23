
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const ClientPortalEmptyState = () => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma proposta encontrada
        </h3>
        <p className="text-gray-500">
          Você ainda não possui propostas disponíveis.
        </p>
      </CardContent>
    </Card>
  );
};

export default ClientPortalEmptyState;
