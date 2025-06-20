
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, MessageCircle } from 'lucide-react';

interface ProposalActionsProps {
  status: 'pending' | 'accepted' | 'rejected' | 'aguardando_pagamento';
  onAccept: () => void;
  onReject: () => void;
}

const ProposalActions = ({ status, onAccept, onReject }: ProposalActionsProps) => {
  if (status !== 'pending') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ações da Proposta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onAccept} 
          className="w-full bg-green-600 hover:bg-green-700 text-white" 
          size="lg"
        >
          <Check className="w-5 h-5 mr-2" />
          Aceitar Proposta
        </Button>
        
        <Button 
          onClick={onReject} 
          variant="outline" 
          className="w-full border-red-300 text-red-600 hover:bg-red-50" 
          size="lg"
        >
          <X className="w-5 h-5 mr-2" />
          Recusar Proposta
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProposalActions;
