
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientProposals = (email: string) => {
  return useQuery({
    queryKey: ['client-proposals', email],
    queryFn: async () => {
      console.log('📊 [DEBUG] === INICIANDO BUSCA DE PROPOSTAS ===');
      console.log('📊 [DEBUG] Email recebido:', email);

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

      if (clientError || !client) {
        console.error('❌ [DEBUG] Erro ao buscar cliente:', clientError);
        throw new Error('Cliente não encontrado');
      }

      console.log('✅ [DEBUG] Cliente encontrado:', client);
      console.log('📊 [DEBUG] === STEP 2: Buscando propostas do cliente ===');

      // Buscar propostas do cliente sem tentar fazer join com profiles
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
          user_id,
          product_group,
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
        .neq('status', 'draft')
        .order('created_at', { ascending: false });

      console.log('📊 [DEBUG] Query propostas executada');
      console.log('📊 [DEBUG] Resultado propostas:', proposals);

      if (proposalsError) {
        console.error('❌ [DEBUG] Erro ao buscar propostas:', proposalsError);
        throw proposalsError;
      }

      // Buscar dados do vendedor da primeira proposta (se existir)
      let salesRepresentative = null;
      if (proposals && proposals.length > 0 && proposals[0].user_id) {
        console.log('📊 [DEBUG] === STEP 3: Buscando dados do vendedor ===');
        
        const { data: vendorProfile, error: vendorError } = await supabase
          .from('profiles')
          .select('id, nome, role, user_id')
          .eq('user_id', proposals[0].user_id)
          .single();

        if (vendorProfile && !vendorError) {
          salesRepresentative = {
            id: vendorProfile.id,
            name: vendorProfile.nome,
            email: `${vendorProfile.nome.toLowerCase().replace(/\s+/g, '.')}@drystore.com`,
            phone: '(11) 99999-8888',
            whatsapp: '5511999998888',
            photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            territory: vendorProfile.role === 'admin' ? 'Administrador' : 'Região Comercial'
          };
          
          console.log('✅ [DEBUG] Vendedor encontrado:', salesRepresentative);
        } else {
          console.log('⚠️ [DEBUG] Vendedor não encontrado, usando dados padrão');
        }
      }

      console.log('📄 [DEBUG] === RESULTADO FINAL ===');
      console.log('📄 [DEBUG] Propostas encontradas:', proposals?.length || 0);

      return {
        client,
        proposals: proposals || [],
        salesRepresentative
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
          product_group,
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
        .neq('status', 'draft')
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
