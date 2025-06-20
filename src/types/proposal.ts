
import type { Tables } from '@/integrations/supabase/types';

export type Proposal = Tables<'proposals'> & {
  clients?: {
    id: string;
    nome: string;
    email: string;
    empresa?: string;
    telefone?: string;
  };
  proposal_items?: ProposalItem[];
};

export type ProposalItem = Tables<'proposal_items'>;

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export interface CreateProposalData {
  client_id: string;
  valor_total: number;
  desconto_percentual?: number;
  validade: string;
  observacoes?: string;
  items: {
    produto_nome: string;
    quantidade: number;
    preco_unit: number;
    preco_total: number;
    descricao_item?: string;
  }[];
}
