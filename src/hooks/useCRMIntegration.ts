
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CRMDeal } from '@/types/erp';

export const useCRMIntegration = () => {
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const [isUpdatingDeal, setIsUpdatingDeal] = useState(false);
  const { toast } = useToast();

  const createCRMDeal = async (proposalData: any): Promise<CRMDeal> => {
    setIsCreatingDeal(true);
    
    try {
      console.log('Criando negócio no CRM para proposta:', proposalData.id);
      
      // Aqui será feita a integração real com Freshsales via Supabase Edge Function
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const crmDeal: CRMDeal = {
        id: Date.now().toString(),
        proposalId: proposalData.id,
        clientName: proposalData.clientName,
        clientEmail: proposalData.clientEmail || 'cliente@email.com',
        clientPhone: proposalData.clientPhone || '11999999999',
        dealValue: proposalData.finalPrice,
        status: 'created',
        freshsalesDealId: `FS_${Date.now()}`,
        stage: 'Proposta Enviada',
        createdAt: new Date().toISOString(),
        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Salvar no localStorage temporariamente
      const existingDeals = JSON.parse(localStorage.getItem('crm_deals') || '[]');
      existingDeals.push(crmDeal);
      localStorage.setItem('crm_deals', JSON.stringify(existingDeals));

      toast({
        title: "Negócio CRM Criado!",
        description: `Negócio criado no Freshsales para ${proposalData.clientName}`,
      });

      return crmDeal;
    } catch (error) {
      console.error('Erro ao criar negócio no CRM:', error);
      toast({
        title: "Erro no CRM",
        description: "Não foi possível criar o negócio no CRM",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreatingDeal(false);
    }
  };

  const updateDealStatus = async (dealId: string, status: CRMDeal['status'], stage?: string): Promise<void> => {
    setIsUpdatingDeal(true);
    
    try {
      console.log('Atualizando status do negócio:', dealId, status);
      
      // Aqui será feita a atualização real no CRM
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar no localStorage
      const deals = JSON.parse(localStorage.getItem('crm_deals') || '[]');
      const updatedDeals = deals.map((deal: CRMDeal) =>
        deal.id === dealId 
          ? { ...deal, status, stage: stage || deal.stage }
          : deal
      );
      localStorage.setItem('crm_deals', JSON.stringify(updatedDeals));

      toast({
        title: "Negócio Atualizado!",
        description: `Status atualizado para: ${status}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar negócio:', error);
      throw error;
    } finally {
      setIsUpdatingDeal(false);
    }
  };

  const getCRMDeals = (): CRMDeal[] => {
    return JSON.parse(localStorage.getItem('crm_deals') || '[]');
  };

  return {
    createCRMDeal,
    updateDealStatus,
    getCRMDeals,
    isCreatingDeal,
    isUpdatingDeal
  };
};
