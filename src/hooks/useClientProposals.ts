
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientProposals = (email: string) => {
  return useQuery({
    queryKey: ['client-proposals', email],
    queryFn: async () => {
      if (!email) {
        console.log('❌ [DEBUG] Email não fornecido para useClientProposals');
        throw new Error('Email is required');
      }

      console.log('🔍 [DEBUG] Buscando propostas para email:', email);

      // Buscar cliente pelo email
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, nome, email, empresa, telefone')
        .eq('email', email)
        .single();

      if (clientError) {
        console.error('❌ [DEBUG] Erro ao buscar cliente:', clientError);
        throw clientError;
      }
      if (!client) {
        console.error('❌ [DEBUG] Cliente não encontrado para email:', email);
        throw new Error('Cliente não encontrado');
      }

      console.log('✅ [DEBUG] Cliente encontrado:', client);

      // Buscar propostas do cliente - FILTRAR APENAS PROPOSTAS NÃO-DRAFT
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
        console.error('❌ [DEBUG] Erro ao buscar propostas:', proposalsError);
        throw proposalsError;
      }

      console.log('📄 [DEBUG] Query executada com sucesso');
      console.log('📄 [DEBUG] Propostas encontradas (total):', proposals?.length || 0);
      console.log('📄 [DEBUG] Propostas com status:', proposals?.map(p => ({ id: p.id.substring(0, 8), status: p.status })) || []);

      // Log detalhado de cada proposta
      proposals?.forEach((proposal, index) => {
        console.log(`📋 [DEBUG] Proposta ${index + 1}:`, {
          id: proposal.id.substring(0, 8),
          status: proposal.status,
          valor: proposal.valor_total,
          validade: proposal.validade,
          items: proposal.proposal_items?.length || 0
        });
      });

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

      console.log('🔍 [DEBUG] Buscando proposta por linkAccess:', linkAccess);

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

      if (error) {
        console.error('❌ [DEBUG] Erro ao buscar proposta por link:', error);
        throw error;
      }
      if (!proposal) {
        console.error('❌ [DEBUG] Proposta não encontrada para link:', linkAccess);
        throw new Error('Proposta não encontrada');
      }

      console.log('✅ [DEBUG] Proposta encontrada por link:', proposal.id.substring(0, 8));

      return proposal;
    },
    enabled: !!linkAccess
  });
};
