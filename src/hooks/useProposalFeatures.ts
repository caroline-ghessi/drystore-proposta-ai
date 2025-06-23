
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  // Carregar funcionalidades existentes da proposta
  useEffect(() => {
    const loadFeatures = async () => {
      if (!proposalId) return;

      const { data, error } = await supabase
        .from('proposal_features')
        .select('contract_generation, delivery_control')
        .eq('proposal_id', proposalId)
        .single();

      if (data) {
        setFeatures({
          contractGeneration: data.contract_generation,
          deliveryControl: data.delivery_control
        });
      }
    };

    loadFeatures();
  }, [proposalId]);

  const toggleContractGeneration = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('proposal_features')
        .upsert({
          proposal_id: proposalId,
          contract_generation: enabled,
          delivery_control: features.deliveryControl
        });

      if (error) throw error;

      setFeatures(prev => ({ ...prev, contractGeneration: enabled }));
      toast({
        title: enabled ? "Geração de Contrato Ativada" : "Geração de Contrato Desativada",
        description: enabled 
          ? "O cliente poderá assinar o contrato após aceitar a proposta"
          : "A opção de assinatura de contrato foi removida",
      });
    } catch (error) {
      console.error('Erro ao atualizar funcionalidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive"
      });
    }
  };

  const toggleDeliveryControl = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('proposal_features')
        .upsert({
          proposal_id: proposalId,
          contract_generation: features.contractGeneration,
          delivery_control: enabled
        });

      if (error) throw error;

      setFeatures(prev => ({ ...prev, deliveryControl: enabled }));
      toast({
        title: enabled ? "Controle de Entregas Ativado" : "Controle de Entregas Desativado",
        description: enabled 
          ? "Será possível registrar e acompanhar entregas"
          : "O controle de entregas foi desabilitado",
      });
    } catch (error) {
      console.error('Erro ao atualizar funcionalidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive"
      });
    }
  };

  return {
    features,
    toggleContractGeneration,
    toggleDeliveryControl
  };
};
