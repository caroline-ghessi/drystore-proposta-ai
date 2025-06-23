
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Proposal = Tables<'proposals'>;
type ProposalInsert = TablesInsert<'proposals'>;
type ProposalUpdate = TablesUpdate<'proposals'>;

interface CreateProposalData {
  clientData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  items: Array<{
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  observations?: string;
  validityDays: number;
  subtotal: number;
  discount?: number;
  selectedPaymentConditions?: string[];
  includeVideo?: boolean;
  videoUrl?: string;
  includeTechnicalDetails?: boolean;
  selectedSolutions?: Array<{ solutionId: string; value: number }>;
  selectedRecommendedProducts?: string[];
}

export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          clients:client_id (
            id,
            nome,
            email,
            empresa,
            telefone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useProposal = (id: string) => {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          clients:client_id (
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
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Buscar soluções associadas separadamente usando any temporariamente
      const { data: proposalSolutions } = await (supabase as any)
        .from('proposal_solutions')
        .select(`
          id,
          valor_solucao,
          observacoes,
          solutions (
            id,
            nome,
            descricao,
            categoria
          )
        `)
        .eq('proposal_id', id);

      // Buscar produtos recomendados associados separadamente
      const { data: proposalRecommendedProducts } = await (supabase as any)
        .from('proposal_recommended_products')
        .select(`
          id,
          recommended_products (
            id,
            nome,
            descricao,
            preco,
            categoria
          )
        `)
        .eq('proposal_id', id);

      // Adicionar os dados relacionados ao resultado principal
      return {
        ...data,
        proposal_solutions: proposalSolutions || [],
        proposal_recommended_products: proposalRecommendedProducts || []
      };
    },
    enabled: !!id,
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (proposalData: CreateProposalData) => {
      // Verificar se o usuário está autenticado
      if (!user?.id) {
        throw new Error('Usuário não autenticado. Faça login para criar propostas.');
      }

      const { 
        clientData, 
        items, 
        observations, 
        validityDays, 
        subtotal, 
        discount = 0,
        selectedPaymentConditions = [],
        includeVideo = false,
        videoUrl = '',
        includeTechnicalDetails = false,
        selectedSolutions = [],
        selectedRecommendedProducts = []
      } = proposalData;

      console.log('🔍 Iniciando criação de proposta:', {
        userId: user.id,
        clientData,
        itemsCount: items.length,
        subtotal,
        includeVideo,
        includeTechnicalDetails,
        solutionsCount: selectedSolutions.length,
        recommendedProductsCount: selectedRecommendedProducts.length
      });

      // Validações obrigatórias
      if (!clientData.name || !clientData.email) {
        throw new Error('Nome e email do cliente são obrigatórios');
      }

      if (items.length === 0) {
        throw new Error('Pelo menos um item é obrigatório');
      }

      // 1. Buscar ou criar cliente
      let client;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('email', clientData.email)
        .single();

      if (existingClient) {
        console.log('📋 Cliente existente encontrado:', existingClient.id);
        // Atualizar dados do cliente existente
        const { data: updatedClient, error: updateError } = await supabase
          .from('clients')
          .update({
            nome: clientData.name,
            telefone: clientData.phone || null,
            empresa: clientData.company || null,
          })
          .eq('id', existingClient.id)
          .select()
          .single();

        if (updateError) throw updateError;
        client = updatedClient;
      } else {
        console.log('👤 Criando novo cliente');
        // Criar novo cliente
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            nome: clientData.name,
            email: clientData.email,
            telefone: clientData.phone || null,
            empresa: clientData.company || null,
          })
          .select()
          .single();

        if (createError) throw createError;
        client = newClient;
      }

      // 2. Criar proposta
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validityDays);

      // Gerar link de acesso único
      const linkAccess = `${client.id}-${Date.now()}`;

      console.log('📝 Criando proposta com dados:', {
        client_id: client.id,
        user_id: user.id,
        valor_total: subtotal,
        desconto_percentual: discount,
        include_video: includeVideo,
        include_technical_details: includeTechnicalDetails
      });

      // Usar any temporariamente para os novos campos
      const { data: proposal, error: proposalError } = await (supabase as any)
        .from('proposals')
        .insert({
          client_id: client.id,
          user_id: user.id,
          valor_total: subtotal,
          desconto_percentual: discount,
          validade: validUntil.toISOString(),
          status: 'draft',
          observacoes: observations,
          link_acesso: linkAccess,
          include_video: includeVideo,
          video_url: includeVideo ? videoUrl : null,
          include_technical_details: includeTechnicalDetails,
        })
        .select()
        .single();

      if (proposalError) {
        console.error('❌ Erro ao criar proposta:', proposalError);
        throw proposalError;
      }

      console.log('✅ Proposta criada com sucesso:', proposal.id);

      // 3. Criar itens da proposta
      const proposalItems = items.map(item => ({
        proposal_id: proposal.id,
        produto_nome: item.description,
        quantidade: item.quantity,
        preco_unit: item.unitPrice,
        preco_total: item.total,
        descricao_item: `${item.category} - ${item.unit}`,
      }));

      console.log('📦 Criando itens da proposta:', proposalItems.length);

      const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(proposalItems);

      if (itemsError) {
        console.error('❌ Erro ao criar itens:', itemsError);
        throw itemsError;
      }

      // 4. Associar condições de pagamento selecionadas
      if (selectedPaymentConditions.length > 0) {
        console.log('💳 Associando condições de pagamento:', selectedPaymentConditions.length);
        
        const paymentConditionsData = selectedPaymentConditions.map(conditionId => ({
          proposal_id: proposal.id,
          payment_condition_id: conditionId,
        }));

        const { error: paymentConditionsError } = await supabase
          .from('proposal_payment_conditions')
          .insert(paymentConditionsData);

        if (paymentConditionsError) {
          console.error('❌ Erro ao associar condições de pagamento:', paymentConditionsError);
          throw paymentConditionsError;
        }
      }

      // 5. Associar soluções selecionadas
      if (selectedSolutions.length > 0) {
        console.log('🔧 Associando soluções:', selectedSolutions.length);
        
        const solutionsData = selectedSolutions.map(solution => ({
          proposal_id: proposal.id,
          solution_id: solution.solutionId,
          valor_solucao: solution.value,
        }));

        const { error: solutionsError } = await (supabase as any)
          .from('proposal_solutions')
          .insert(solutionsData);

        if (solutionsError) {
          console.error('❌ Erro ao associar soluções:', solutionsError);
          throw solutionsError;
        }
      }

      // 6. Associar produtos recomendados selecionados
      if (selectedRecommendedProducts.length > 0) {
        console.log('🛍️ Associando produtos recomendados:', selectedRecommendedProducts.length);
        
        const recommendedProductsData = selectedRecommendedProducts.map(productId => ({
          proposal_id: proposal.id,
          recommended_product_id: productId,
        }));

        const { error: recommendedProductsError } = await (supabase as any)
          .from('proposal_recommended_products')
          .insert(recommendedProductsData);

        if (recommendedProductsError) {
          console.error('❌ Erro ao associar produtos recomendados:', recommendedProductsError);
          throw recommendedProductsError;
        }
      }

      console.log('🎉 Proposta completa criada com sucesso!');

      return {
        proposal,
        client,
        items: proposalItems
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProposalUpdate }) => {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposals', data.id] });
    },
  });
};
