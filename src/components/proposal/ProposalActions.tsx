
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

  // Component removido conforme solicitado
  return null;
};

export default ProposalActions;
