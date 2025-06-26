import { supabase } from '@/integrations/supabase/client';
import { clientService } from './clientService';
import { proposalDataProcessor } from '@/utils/proposalDataProcessor';
import type { CreateProposalData } from '@/types/proposals';

export const proposalCreationService = {
  async createProposal(proposalData: CreateProposalData, userId: string) {
    console.log('🔍 Iniciando criação de proposta:', {
      userId,
      clientData: proposalData.clientData,
      itemsCount: proposalData.items.length,
      subtotal: proposalData.subtotal,
      includeVideo: proposalData.includeVideo,
      includeTechnicalDetails: proposalData.includeTechnicalDetails,
      solutionsCount: proposalData.selectedSolutions?.length || 0,
      recommendedProductsCount: proposalData.selectedRecommendedProducts?.length || 0,
      productGroup: proposalData.productGroup,
      proposalNumber: proposalData.proposalNumber
    });

    // Validações obrigatórias
    proposalDataProcessor.validateProposalData(proposalData);

    // 1. Buscar ou criar cliente
    const client = await clientService.findOrCreateClient(proposalData.clientData);

    // 2. Criar proposta
    const proposal = await this.createProposalRecord(proposalData, client.id, userId);

    // 3. Criar itens da proposta
    await this.createProposalItems(proposal.id, proposalData.items);

    // 4. Associar condições de pagamento
    if (proposalData.selectedPaymentConditions?.length) {
      await this.associatePaymentConditions(proposal.id, proposalData.selectedPaymentConditions);
    }

    // 5. Associar soluções
    if (proposalData.selectedSolutions?.length) {
      await this.associateSolutions(proposal.id, proposalData.selectedSolutions);
    }

    // 6. Associar produtos recomendados
    if (proposalData.selectedRecommendedProducts?.length) {
      await this.associateRecommendedProducts(proposal.id, proposalData.selectedRecommendedProducts);
    }

    console.log('🎉 Proposta completa criada com sucesso!');

    return {
      proposal,
      client,
      items: proposalData.items
    };
  },

  async createProposalRecord(proposalData: CreateProposalData, clientId: string, userId: string) {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + proposalData.validityDays);

    const linkAccess = `${clientId}-${Date.now()}`;

    console.log('📝 Criando proposta com dados:', {
      client_id: clientId,
      user_id: userId,
      valor_total: proposalData.subtotal,
      desconto_percentual: proposalData.discount || 0,
      include_video: proposalData.includeVideo || false,
      include_technical_details: proposalData.includeTechnicalDetails || false,
      product_group: proposalData.productGroup,
      proposal_number: proposalData.proposalNumber,
      status: 'sent'
    });

    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        client_id: clientId,
        user_id: userId,
        valor_total: proposalData.subtotal,
        desconto_percentual: proposalData.discount || 0,
        validade: validUntil.toISOString(),
        status: 'sent',
        observacoes: proposalData.observations,
        link_acesso: linkAccess,
        include_video: proposalData.includeVideo || false,
        video_url: proposalData.includeVideo ? proposalData.videoUrl : null,
        include_technical_details: proposalData.includeTechnicalDetails || false,
        product_group: proposalData.productGroup,
        proposal_number: proposalData.proposalNumber, // Salvar número do orçamento
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar proposta:', error);
      throw error;
    }

    console.log('✅ Proposta criada com sucesso:', proposal.id, proposalData.proposalNumber ? `com número ${proposalData.proposalNumber}` : 'sem número de orçamento');
    return proposal;
  },

  async createProposalItems(proposalId: string, items: CreateProposalData['items']) {
    const proposalItems = items.map(item => ({
      proposal_id: proposalId,
      produto_nome: item.description,
      quantidade: item.quantity,
      preco_unit: item.unitPrice,
      preco_total: item.total,
      descricao_item: `${item.category} - ${item.unit}`,
    }));

    console.log('📦 Criando itens da proposta:', proposalItems.length);

    const { error } = await supabase
      .from('proposal_items')
      .insert(proposalItems);

    if (error) {
      console.error('❌ Erro ao criar itens:', error);
      throw error;
    }
  },

  async associatePaymentConditions(proposalId: string, paymentConditions: string[]) {
    console.log('💳 Associando condições de pagamento:', paymentConditions.length);
    
    const paymentConditionsData = paymentConditions.map(conditionId => ({
      proposal_id: proposalId,
      payment_condition_id: conditionId,
    }));

    const { error } = await supabase
      .from('proposal_payment_conditions')
      .insert(paymentConditionsData);

    if (error) {
      console.error('❌ Erro ao associar condições de pagamento:', error);
      throw error;
    }
  },

  async associateSolutions(proposalId: string, solutions: Array<{ solutionId: string; value: number }>) {
    console.log('🔧 Associando soluções:', solutions.length);
    
    const solutionsData = solutions.map(solution => ({
      proposal_id: proposalId,
      solution_id: solution.solutionId,
      valor_solucao: solution.value,
    }));

    const { error } = await supabase
      .from('proposal_solutions')
      .insert(solutionsData);

    if (error) {
      console.error('❌ Erro ao associar soluções:', error);
      throw error;
    }
  },

  async associateRecommendedProducts(proposalId: string, recommendedProducts: string[]) {
    console.log('🛍️ Associando produtos recomendados:', recommendedProducts.length);
    
    const recommendedProductsData = recommendedProducts.map(productId => ({
      proposal_id: proposalId,
      recommended_product_id: productId,
    }));

    const { error } = await supabase
      .from('proposal_recommended_products')
      .insert(recommendedProductsData);

    if (error) {
      console.error('❌ Erro ao associar produtos recomendados:', error);
      throw error;
    }
  }
};
