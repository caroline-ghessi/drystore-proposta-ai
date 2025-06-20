
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, FileCheck, CreditCard } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* Botão principal de pagamento */}
      <Button 
        onClick={() => navigate(`/payment-options/${proposalId}`)}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Pagar Agora
      </Button>

      {deliveryControl && (
        <Button 
          onClick={() => navigate(`/delivery-tracking/${proposalId}`)}
          variant="outline"
          className="w-full"
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
