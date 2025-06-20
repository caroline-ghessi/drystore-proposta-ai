
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, FileCheck } from 'lucide-react';

interface ProposalAcceptedActionsProps {
  proposalId: string;
  contractGeneration?: boolean;
  deliveryControl?: boolean;
}

const ProposalAcceptedActions = ({ 
  proposalId, 
  contractGeneration = false, 
  deliveryControl = false 
}: ProposalAcceptedActionsProps) => {
  const navigate = useNavigate();

  if (!contractGeneration && !deliveryControl) {
    return (
      <div className="p-4 bg-green-50 rounded-lg text-center">
        <p className="text-green-700 font-medium">Proposta Aceita!</p>
        <p className="text-sm text-green-600 mt-1">
          O vendedor entrará em contato em breve
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deliveryControl && (
        <Button 
          onClick={() => navigate(`/delivery-tracking/${proposalId}`)}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Package className="w-5 h-5 mr-2" />
          Acompanhar Entregas
        </Button>
      )}
      
      {contractGeneration && (
        <Button 
          variant="outline"
          className="w-full"
          size="lg"
        >
          <FileCheck className="w-5 h-5 mr-2" />
          Assinar Contrato Digitalmente
        </Button>
      )}
    </div>
  );
};

export default ProposalAcceptedActions;
