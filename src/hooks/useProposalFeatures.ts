
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProposalFeatures {
  contractGeneration: boolean;
  deliveryControl: boolean;
}

export const useProposalFeatures = (proposalId: string) => {
  const [features, setFeatures] = useState<ProposalFeatures>({
    contractGeneration: false,
    deliveryControl: false
  });
  const { toast } = useToast();

  const toggleContractGeneration = (enabled: boolean) => {
    setFeatures(prev => ({ ...prev, contractGeneration: enabled }));
    toast({
      title: enabled ? "Geração de Contrato Ativada" : "Geração de Contrato Desativada",
      description: enabled 
        ? "O cliente poderá assinar o contrato após aceitar a proposta"
        : "A opção de assinatura de contrato foi removida",
    });
  };

  const toggleDeliveryControl = (enabled: boolean) => {
    setFeatures(prev => ({ ...prev, deliveryControl: enabled }));
    toast({
      title: enabled ? "Controle de Entregas Ativado" : "Controle de Entregas Desativado",
      description: enabled 
        ? "Será possível registrar e acompanhar entregas"
        : "O controle de entregas foi desabilitado",
    });
  };

  return {
    features,
    toggleContractGeneration,
    toggleDeliveryControl
  };
};
