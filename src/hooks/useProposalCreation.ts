
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { proposalCreationService } from '@/services/proposalCreationService';
import type { CreateProposalData } from '@/types/proposals';

export const useProposalCreation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (proposalData: CreateProposalData) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado. Faça login para criar propostas.');
      }

      return await proposalCreationService.createProposal(proposalData, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
