
import { supabase } from '@/integrations/supabase/client';
import type { ProposalItem } from '@/types/proposalCreation';

export class ProposalItemsService {
  static async createProposalItems(proposalId: string, items: ProposalItem[]) {
    const proposalItems = [];
    
    for (const item of items) {
      const { data: proposalItem, error: proposalItemError } = await supabase
        .from('proposal_items')
        .insert([{
          proposal_id: proposalId,
          produto_nome: item.description,
          descricao_item: item.category,
          quantidade: item.quantity,
          preco_unit: item.unitPrice,
          preco_total: item.total
        }])
        .select()
        .single();

      if (proposalItemError) {
        console.error('❌ Error creating proposal item:', proposalItemError);
        throw new Error(`Erro ao criar item da proposta: ${proposalItemError.message}`);
      }

      proposalItems.push(proposalItem);
      console.log('✅ Proposal item created:', proposalItem);
    }

    return proposalItems;
  }
}
