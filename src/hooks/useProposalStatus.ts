
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useProposalStatus = (clientName: string, addInteraction: any) => {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const { toast } = useToast();

  const handleAccept = () => {
    setStatus('accepted');
    addInteraction({
      type: 'accept',
      description: 'Proposta aceita pelo cliente',
      user: clientName
    });
    toast({
      title: "Proposta Aceita!",
      description: "O vendedor será notificado sobre sua decisão.",
    });
  };

  const handleReject = () => {
    setStatus('rejected');
    addInteraction({
      type: 'reject',
      description: 'Proposta rejeitada pelo cliente',
      user: clientName
    });
    toast({
      title: "Proposta Rejeitada",
      description: "O vendedor foi notificado sobre sua decisão.",
    });
  };

  const handleQuestion = (question: string) => {
    addInteraction({
      type: 'question',
      description: 'Cliente enviou dúvida',
      user: clientName,
      details: question
    });
    
    toast({
      title: "Dúvida Enviada",
      description: "Sua mensagem foi enviada ao vendedor.",
    });
  };

  return {
    status,
    handleAccept,
    handleReject,
    handleQuestion
  };
};
