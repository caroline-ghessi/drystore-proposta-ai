
import { supabase } from '@/integrations/supabase/client';
import type { CreateProposalRequest } from '@/types/proposalCreation';

export class ProposalService {
  static async createProposal(client: any, request: CreateProposalRequest) {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Error getting user:', userError);
      throw new Error('Usuário não autenticado');
    }

    const proposalData = {
      client_id: client.id,
      user_id: user.id,
      valor_total: request.subtotal,
      desconto_percentual: request.discount,
      discount_percentage: request.discount,
      validade: new Date(Date.now() + request.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      observacoes: request.observations,
      status: 'draft' as const,
      include_video: request.includeVideo,
      video_url: request.includeVideo ? request.videoUrl : null,
      include_technical_details: request.includeTechnicalDetails,
      product_group: request.productGroup,
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
}
