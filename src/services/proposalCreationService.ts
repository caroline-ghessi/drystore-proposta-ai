
import { ClientService } from './clientService';
import { ProposalService } from './proposalService';
import { ProposalItemsService } from './proposalItemsService';
import { ProposalRelatedDataService } from './proposalRelatedDataService';
import type { CreateProposalRequest, ProposalCreationResult } from '@/types/proposalCreation';

export class ProposalCreationService {
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
      const client = await ClientService.createOrRetrieveClient(request.clientData);

      // Create proposal
      const proposal = await ProposalService.createProposal(client, request);

      // Create all related data
      const [items, paymentConditions, solutions, recommendedProducts] = await Promise.all([
        ProposalItemsService.createProposalItems(proposal.id, request.items),
        ProposalRelatedDataService.createPaymentConditions(proposal.id, request.selectedPaymentConditions),
        ProposalRelatedDataService.createSolutions(proposal.id, request.selectedSolutions),
        ProposalRelatedDataService.createRecommendedProducts(proposal.id, request.selectedRecommendedProducts)
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
