import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateProposalData } from '@/types/proposals';

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
        selectedRecommendedProducts = [],
        productGroup // Novo campo
      } = proposalData;

      console.log('🔍 Iniciando criação de proposta:', {
        userId: user.id,
        clientData,
        itemsCount: items.length,
        subtotal,
        includeVideo,
        includeTechnicalDetails,
        solutionsCount: selectedSolutions.length,
        recommendedProductsCount: selectedRecommendedProducts.length,
        productGroup // Log do novo campo
      });

      // Validações obrigatórias
      if (!clientData.name || !clientData.email) {
        throw new Error('Nome e email do cliente são obrigatórios');
      }

      if (items.length === 0) {
        throw new Error('Pelo menos um item é obrigatório');
      }

      if (!productGroup) {
        throw new Error('Grupo de produtos é obrigatório');
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
        include_technical_details: includeTechnicalDetails,
        product_group: productGroup, // Novo campo
        status: 'sent'
      });

      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          client_id: client.id,
          user_id: user.id,
          valor_total: subtotal,
          desconto_percentual: discount,
          validade: validUntil.toISOString(),
          status: 'sent',
          observacoes: observations,
          link_acesso: linkAccess,
          include_video: includeVideo,
          video_url: includeVideo ? videoUrl : null,
          include_technical_details: includeTechnicalDetails,
          product_group: productGroup, // Salvar o grupo de produtos
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

        const { error: solutionsError } = await supabase
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

        const { error: recommendedProductsError } = await supabase
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
