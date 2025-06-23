
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientProposals = (email: string) => {
  return useQuery({
    queryKey: ['client-proposals', email],
    queryFn: async () => {
      if (!email) throw new Error('Email is required');

      // Buscar cliente pelo email
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, nome, email, empresa, telefone')
        .eq('email', email)
        .single();

      if (clientError) throw clientError;
      if (!client) throw new Error('Cliente não encontrado');

      // Buscar propostas do cliente com funcionalidades
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          id,
          valor_total,
          desconto_percentual,
          validade,
          status,
          created_at,
          observacoes,
          link_acesso,
          proposal_items (
            id,
            produto_nome,
            quantidade,
            preco_unit,
            preco_total,
            descricao_item
          ),
          proposal_features (
            contract_generation,
            delivery_control
          )
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;

      return {
        client,
        proposals: proposals || []
      };
    },
    enabled: !!email
  });
};

export const useClientProposal = (linkAccess: string) => {
  return useQuery({
    queryKey: ['client-proposal', linkAccess],
    queryFn: async () => {
      if (!linkAccess) throw new Error('Link de acesso é obrigatório');

      const { data: proposal, error } = await supabase
        .from('proposals')
        .select(`
          id,
          valor_total,
          desconto_percentual,
          validade,
          status,
          created_at,
          observacoes,
          link_acesso,
          clients (
            id,
            nome,
            email,
            empresa,
            telefone
          ),
          proposal_items (
            id,
            produto_nome,
            quantidade,
            preco_unit,
            preco_total,
            descricao_item
          ),
          proposal_features (
            contract_generation,
            delivery_control
          )
        `)
        .eq('link_acesso', linkAccess)
        .single();

      if (error) throw error;
      if (!proposal) throw new Error('Proposta não encontrada');

      return proposal;
    },
    enabled: !!linkAccess
  });
};
