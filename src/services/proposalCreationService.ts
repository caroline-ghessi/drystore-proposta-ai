
import { supabase } from '@/integrations/supabase/client';
import type { CreateProposalRequest, ProposalCreationResult, ClientData, ProposalItem } from '@/types/proposalCreation';

export class ProposalCreationService {
  static async createOrRetrieveClient(clientData: ClientData) {
    console.log('🎯 Creating or retrieving client:', clientData.email);

    const { data: existingClient, error: existingClientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', clientData.email)
      .single();

    if (existingClientError && existingClientError.code !== 'PGRST116') {
      console.error('❌ Error checking existing client:', existingClientError);
      throw new Error(`Erro ao verificar cliente existente: ${existingClientError.message}`);
    }

    if (existingClient) {
      console.log('✅ Client already exists:', existingClient);
      return existingClient;
    }

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

    console.log('✅ Client created:', newClient);
    return newClient;
  }

  static async createProposal(client: any, request: CreateProposalRequest) {
    const proposalData = {
      client_id: client.id,
      valor_total: request.subtotal,
      desconto_percentual: request.discount,
      discount_percentage: request.discount,
      validade: new Date(Date.now() + request.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      observacoes: request.observations,
      status: 'draft' as const,
      include_video: request.includeVideo,
      video_url: request.includeVideo ? request.videoUrl : null,
      include_technical_details: request.includeTechnicalDetails,
      product_group: request.productGroup.id, // Use the ID instead of the whole object
      show_detailed_values: request.showDetailedValues
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
    return proposal;
  }

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

  static async createPaymentConditions(proposalId: string, selectedPaymentConditions: string[]) {
    const proposalPaymentConditions = [];
    
    for (const conditionId of selectedPaymentConditions) {
      const { data: paymentCondition, error: paymentConditionError } = await supabase
        .from('proposal_payment_conditions')
        .insert([{
          proposal_id: proposalId,
          payment_condition_id: conditionId // Use payment_condition_id instead of condicao_pagamento
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

    return proposalPaymentConditions;
  }

  static async createSolutions(proposalId: string, selectedSolutions: Array<{ solutionId: string; value: number }>) {
    const proposalSolutions = [];
    
    for (const solution of selectedSolutions) {
      const { data: proposalSolution, error: proposalSolutionError } = await supabase
        .from('proposal_solutions')
        .insert([{
          proposal_id: proposalId,
          solution_id: solution.solutionId,
          valor_solucao: solution.value // Use valor_solucao instead of value
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

    return proposalSolutions;
  }

  static async createRecommendedProducts(proposalId: string, selectedRecommendedProducts: string[]) {
    const proposalRecommendedProducts = [];
    
    for (const productId of selectedRecommendedProducts) {
      const { data: recommendedProduct, error: recommendedProductError } = await supabase
        .from('proposal_recommended_products')
        .insert([{
          proposal_id: proposalId,
          recommended_product_id: productId
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

    return proposalRecommendedProducts;
  }

  static async createCompleteProposal(request: CreateProposalRequest): Promise<ProposalCreationResult> {
    console.log('🚀 Creating complete proposal with data:', {
      clientData: request.clientData,
      itemsCount: request.items.length,
      subtotal: request.subtotal,
      discount: request.discount,
      paymentConditions: request.selectedPaymentConditions.length,
      includeVideo: request.includeVideo,
      includeTechnicalDetails: request.includeTechnicalDetails,
      productGroup: request.productGroup,
      showDetailedValues: request.showDetailedValues
    });

    try {
      // Create or retrieve client
      const client = await this.createOrRetrieveClient(request.clientData);

      // Create proposal
      const proposal = await this.createProposal(client, request);

      // Create all related data
      const [items, paymentConditions, solutions, recommendedProducts] = await Promise.all([
        this.createProposalItems(proposal.id, request.items),
        this.createPaymentConditions(proposal.id, request.selectedPaymentConditions),
        this.createSolutions(proposal.id, request.selectedSolutions),
        this.createRecommendedProducts(proposal.id, request.selectedRecommendedProducts)
      ]);

      return {
        proposal,
        client,
        items,
        paymentConditions,
        solutions,
        recommendedProducts
      };
    } catch (error) {
      console.error('❌ Error in createCompleteProposal:', error);
      throw error;
    }
  }
}
