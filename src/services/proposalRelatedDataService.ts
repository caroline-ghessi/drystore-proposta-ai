
import { supabase } from '@/integrations/supabase/client';

export class ProposalRelatedDataService {
  static async createPaymentConditions(proposalId: string, selectedPaymentConditions: string[]) {
    const proposalPaymentConditions = [];
    
    for (const conditionId of selectedPaymentConditions) {
      const { data: paymentCondition, error: paymentConditionError } = await supabase
        .from('proposal_payment_conditions')
        .insert([{
          proposal_id: proposalId,
          payment_condition_id: conditionId
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
          valor_solucao: solution.value
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
}
