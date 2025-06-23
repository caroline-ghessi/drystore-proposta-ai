
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientProposals = (email: string) => {
  return useQuery({
    queryKey: ['client-proposals', email],
    queryFn: async () => {
      if (!email) throw new Error('Email is required');

      console.log('🔍 Buscando propostas para email:', email);

      // Buscar cliente pelo email
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, nome, email, empresa, telefone')
        .eq('email', email)
        .single();

      if (clientError) {
        console.error('❌ Erro ao buscar cliente:', clientError);
        throw clientError;
      }
      if (!client) {
        console.error('❌ Cliente não encontrado para email:', email);
        throw new Error('Cliente não encontrado');
      }

      console.log('✅ Cliente encontrado:', client);

      // Buscar propostas do cliente com funcionalidades - FILTRAR APENAS PROPOSTAS NÃO-DRAFT
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
        .neq('status', 'draft') // FILTRAR PROPOSTAS EM DRAFT
        .order('created_at', { ascending: false });

      if (proposalsError) {
        console.error('❌ Erro ao buscar propostas:', proposalsError);
        throw proposalsError;
      }

      console.log('📄 Propostas encontradas (filtradas):', proposals?.length || 0);
      console.log('📋 Status das propostas:', proposals?.map(p => ({ id: p.id, status: p.status })));

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
        .neq('status', 'draft') // FILTRAR PROPOSTAS EM DRAFT TAMBÉM AQUI
        .single();

      if (error) throw error;
      if (!proposal) throw new Error('Proposta não encontrada');

      return proposal;
    },
    enabled: !!linkAccess
  });
};
