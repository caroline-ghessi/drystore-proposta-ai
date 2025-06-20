
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useProposalStatus = (clientName: string, addInteraction: any) => {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected' | 'aguardando_pagamento'>('pending');
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
      description: "Você pode prosseguir com o pagamento.",
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

  const handlePaymentPending = () => {
    setStatus('aguardando_pagamento');
    addInteraction({
      type: 'payment_pending',
      description: 'Aguardando confirmação de pagamento',
      user: clientName
    });
  };

  return {
    status,
    handleAccept,
    handleReject,
    handleQuestion,
    handlePaymentPending
  };
};
