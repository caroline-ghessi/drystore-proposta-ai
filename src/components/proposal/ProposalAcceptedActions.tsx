
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface ProposalAcceptedActionsProps {
  proposalId: string;
}

const ProposalAcceptedActions = ({ proposalId }: ProposalAcceptedActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Button 
        onClick={() => navigate(`/delivery-tracking/${proposalId}`)}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        <Package className="w-5 h-5 mr-2" />
        Acompanhar Entregas
      </Button>
      
      <Button 
        variant="outline"
        className="w-full"
        size="lg"
      >
        Assinar Contrato Digitalmente
      </Button>
    </div>
  );
};

export default ProposalAcceptedActions;
