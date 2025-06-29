
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedProposals = () => {
  const {
    data: rawProposals,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['proposals-optimized'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id,
          proposal_number,
          valor_total,
          status,
          created_at,
          validade,
          observacoes,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoize processed data to avoid recalculation on every render
  const processedProposals = useMemo(() => {
    if (!rawProposals) return [];
    
    return rawProposals.map(proposal => ({
      id: proposal.id,
      proposalNumber: proposal.proposal_number || `#${proposal.id.slice(0, 8)}`,
      clientName: proposal.clients?.nome || 'Cliente não informado',
      clientEmail: proposal.clients?.email || '',
      clientCompany: proposal.clients?.empresa || '',
      clientPhone: proposal.clients?.telefone || '',
      finalPrice: proposal.valor_total || 0,
      status: proposal.status || 'draft',
      createdAt: proposal.created_at,
      validUntil: proposal.validade,
      notes: proposal.observacoes || ''
    }));
  }, [rawProposals]);

  // Statistics memoized for dashboard
  const statistics = useMemo(() => {
    if (!processedProposals.length) {
      return {
        total: 0,
        accepted: 0,
        pending: 0,
        rejected: 0,
        totalValue: 0,
        acceptedValue: 0,
        conversionRate: 0
      };
    }

    const accepted = processedProposals.filter(p => 
      p.status === 'aceita' || p.status === 'accepted'
    );
    const pending = processedProposals.filter(p => 
      p.status === 'pendente' || p.status === 'sent'
    );
    const rejected = processedProposals.filter(p => 
      p.status === 'rejeitada' || p.status === 'rejected'
    );

    const totalValue = processedProposals.reduce((sum, p) => sum + p.finalPrice, 0);
    const acceptedValue = accepted.reduce((sum, p) => sum + p.finalPrice, 0);
    const conversionRate = processedProposals.length > 0 
      ? (accepted.length / processedProposals.length) * 100 
      : 0;

    return {
      total: processedProposals.length,
      accepted: accepted.length,
      pending: pending.length,
      rejected: rejected.length,
      totalValue,
      acceptedValue,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }, [processedProposals]);

  return {
    proposals: processedProposals,
    statistics,
    isLoading,
    error,
    refetch
  };
};
