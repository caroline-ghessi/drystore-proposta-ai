
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProposalActionsProps {
  status: 'pending' | 'accepted' | 'rejected';
  onAccept: () => void;
  onReject: () => void;
}

const ProposalActions = ({ status, onAccept, onReject }: ProposalActionsProps) => {
  const { toast } = useToast();

  if (status !== 'pending') {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 space-y-4">
        <Button 
          onClick={onAccept}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          ✅ Aceitar Proposta
        </Button>
        
        <Button 
          onClick={() => toast({ title: "Redirecionando para WhatsApp" })}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          size="lg"
        >
          <Phone className="w-4 h-4 mr-2" />
          Falar no WhatsApp
        </Button>
        
        <Button 
          onClick={onReject}
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
        >
          Recusar Proposta
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProposalActions;
