
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientProposals = (email: string) => {
  return useQuery({
    queryKey: ['client-proposals', email],
    queryFn: async () => {
      console.log('📊 [DEBUG] === INICIANDO BUSCA DE PROPOSTAS ===');
      console.log('📊 [DEBUG] Email recebido:', email);
      console.log('📊 [DEBUG] Tipo do email:', typeof email);
      console.log('📊 [DEBUG] Email válido?', !!email);

      if (!email) {
        console.log('❌ [DEBUG] Email não fornecido para useClientProposals');
        throw new Error('Email is required');
      }

      console.log('📊 [DEBUG] === STEP 1: Buscando cliente pelo email ===');

      // Buscar cliente pelo email
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, nome, email, empresa, telefone')
        .eq('email', email)
        .single();

      console.log('📊 [DEBUG] Query cliente executada');
      console.log('📊 [DEBUG] Resultado cliente:', client);
      console.log('📊 [DEBUG] Erro cliente:', clientError);

      if (clientError) {
        console.error('❌ [DEBUG] Erro ao buscar cliente:', clientError);
        throw clientError;
      }
      if (!client) {
        console.error('❌ [DEBUG] Cliente não encontrado para email:', email);
        throw new Error('Cliente não encontrado');
      }

      console.log('✅ [DEBUG] Cliente encontrado:', client);
      console.log('📊 [DEBUG] === STEP 2: Buscando propostas do cliente ===');

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

      console.log('📊 [DEBUG] Query propostas executada');
      console.log('📊 [DEBUG] Client ID usado na busca:', client.id);
      console.log('📊 [DEBUG] Resultado propostas:', proposals);
      console.log('📊 [DEBUG] Erro propostas:', proposalsError);

      if (proposalsError) {
        console.error('❌ [DEBUG] Erro ao buscar propostas:', proposalsError);
        throw proposalsError;
      }

      console.log('📄 [DEBUG] === RESULTADO FINAL ===');
      console.log('📄 [DEBUG] Propostas encontradas (total):', proposals?.length || 0);
      console.log('📄 [DEBUG] Propostas com status:', proposals?.map(p => ({ 
        id: p.id.substring(0, 8), 
        status: p.status,
        validade: p.validade,
        valor: p.valor_total 
      })) || []);

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

      console.log('📊 [DEBUG] === BUSCA FINALIZADA COM SUCESSO ===');

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
