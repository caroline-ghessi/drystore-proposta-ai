import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProductGroup } from '@/types/productGroups';

interface ClientData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

interface ProposalItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface CreateProposalRequest {
  clientData: ClientData;
  items: ProposalItem[];
  observations: string;
  validityDays: number;
  subtotal: number;
  discount: number;
  selectedPaymentConditions: string[];
  includeVideo: boolean;
  videoUrl: string;
  includeTechnicalDetails: boolean;
  selectedSolutions: Array<{ solutionId: string; value: number }>;
  selectedRecommendedProducts: string[];
  productGroup: ProductGroup;
  showDetailedValues?: boolean;
}

export const useProposalCreation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientData,
      items,
      observations,
      validityDays,
      subtotal,
      discount,
      selectedPaymentConditions,
      includeVideo,
      videoUrl,
      includeTechnicalDetails,
      selectedSolutions,
      selectedRecommendedProducts,
      productGroup,
      showDetailedValues = true
    }: CreateProposalRequest) => {
      console.log('🚀 Creating proposal with data:', {
        clientData,
        itemsCount: items.length,
        subtotal,
        discount,
        paymentConditions: selectedPaymentConditions.length,
        includeVideo,
        includeTechnicalDetails,
        productGroup: productGroup.id,
        showDetailedValues
      });

      // Create or retrieve client
      let client;
      const { data: existingClient, error: existingClientError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', clientData.email)
        .single();

      if (existingClientError && existingClientError.code !== '404') {
        console.error('❌ Error checking existing client:', existingClientError);
        throw new Error(`Erro ao verificar cliente existente: ${existingClientError.message}`);
      }

      if (existingClient) {
        client = existingClient;
        console.log('✅ Client already exists:', client);
      } else {
        const { data: newClient, error: newClientError } = await supabase
          .from('clients')
          .insert([{
            nome: clientData.name,
            email: clientData.email,
            telefone: clientData.phone,
            empresa: clientData.company,
            endereco: clientData.address
          }])
          .select()
          .single();

        if (newClientError) {
          console.error('❌ Error creating client:', newClientError);
          throw new Error(`Erro ao criar cliente: ${newClientError.message}`);
        }

        client = newClient;
        console.log('✅ Client created:', client);
      }

      // Create proposal with showDetailedValues
      const proposalData = {
        client_id: client.id,
        valor_total: subtotal,
        desconto_percentual: discount,
        discount_percentage: discount,
        validade: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: observations,
        status: 'draft' as const,
        include_video: includeVideo,
        video_url: includeVideo ? videoUrl : null,
        include_technical_details: includeTechnicalDetails,
        product_group: productGroup.id,
        show_detailed_values: showDetailedValues
      };

      console.log('📋 Creating proposal with data:', proposalData);

      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
        .single();

      if (proposalError) {
        console.error('❌ Error creating proposal:', proposalError);
        throw new Error(`Erro ao criar proposta: ${proposalError.message}`);
      }

      console.log('✅ Proposal created:', proposal);

      // Create items
      const proposalItems = [];
      for (const item of items) {
        const { data: proposalItem, error: proposalItemError } = await supabase
          .from('proposal_items')
          .insert([{
            proposal_id: proposal.id,
            categoria: item.category,
            descricao: item.description,
            quantidade: item.quantity,
            unidade: item.unit,
            valor_unitario: item.unitPrice,
            valor_total: item.total
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

      // Create payment conditions
      const proposalPaymentConditions = [];
      for (const condition of selectedPaymentConditions) {
        const { data: paymentCondition, error: paymentConditionError } = await supabase
          .from('proposal_payment_conditions')
          .insert([{
            proposal_id: proposal.id,
            condicao_pagamento: condition
          }])
          .select()
          .single();

        if (paymentConditionError) {
          console.error('❌ Error creating payment condition:', paymentConditionError);
          throw new Error(`Erro ao criar condição de pagamento: ${paymentConditionError.message}`);
        }

        proposalPaymentConditions.push(paymentCondition);
        console.log('✅ Payment condition created:', paymentCondition);
      }

      // Create solutions
      const proposalSolutions = [];
      for (const solution of selectedSolutions) {
        const { data: proposalSolution, error: proposalSolutionError } = await supabase
          .from('proposal_solutions')
          .insert([{
            proposal_id: proposal.id,
            solution_id: solution.solutionId,
            value: solution.value
          }])
          .select()
          .single();

        if (proposalSolutionError) {
          console.error('❌ Error creating proposal solution:', proposalSolutionError);
          throw new Error(`Erro ao criar solução da proposta: ${proposalSolutionError.message}`);
        }

        proposalSolutions.push(proposalSolution);
        console.log('✅ Proposal solution created:', proposalSolution);
      }

      // Create recommended products
      const proposalRecommendedProducts = [];
      for (const productId of selectedRecommendedProducts) {
        const { data: recommendedProduct, error: recommendedProductError } = await supabase
          .from('proposal_recommended_products')
          .insert([{
            proposal_id: proposal.id,
            product_id: productId
          }])
          .select()
          .single();

        if (recommendedProductError) {
          console.error('❌ Error creating recommended product:', recommendedProductError);
          throw new Error(`Erro ao criar produto recomendado da proposta: ${recommendedProductError.message}`);
        }

        proposalRecommendedProducts.push(recommendedProduct);
        console.log('✅ Recommended product created:', recommendedProduct);
      }

      return {
        proposal,
        client,
        items: proposalItems,
        paymentConditions: proposalPaymentConditions,
        solutions: proposalSolutions,
        recommendedProducts: proposalRecommendedProducts
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
};
