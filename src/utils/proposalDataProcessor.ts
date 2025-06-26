
import type { CreateProposalData } from '@/types/proposals';

export const proposalDataProcessor = {
  validateProposalData(proposalData: CreateProposalData): void {
    const { clientData, items, productGroup } = proposalData;

    if (!clientData.name || !clientData.email) {
      throw new Error('Nome e email do cliente são obrigatórios');
    }

    if (items.length === 0) {
      throw new Error('Pelo menos um item é obrigatório');
    }

    if (!productGroup) {
      throw new Error('Grupo de produtos é obrigatório');
    }
  }
};
