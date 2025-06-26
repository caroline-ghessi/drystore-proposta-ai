
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProposalCreationService } from '@/services/proposalCreationService';
import type { CreateProposalRequest } from '@/types/proposalCreation';

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateProposalRequest) => {
      return ProposalCreationService.createCompleteProposal(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
};
