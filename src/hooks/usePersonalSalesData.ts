
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePersonalSalesData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-sales-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Buscar meta do mês atual
      const { data: targetData } = await supabase
        .from('sales_targets')
        .select('target_amount')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      // Buscar propostas aceitas do usuário
      const { data: acceptedProposals } = await supabase
        .from('proposals')
        .select('valor_total, created_at, status')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      // Buscar todas as propostas para calcular taxa de conversão
      const { data: allProposals } = await supabase
        .from('proposals')
        .select('id, status, valor_total, created_at')
        .eq('user_id', user.id);

      // Calcular vendas do mês atual
      const currentMonthSales = acceptedProposals?.filter(proposal => {
        const proposalDate = new Date(proposal.created_at);
        return proposalDate.getMonth() + 1 === currentMonth && 
               proposalDate.getFullYear() === currentYear;
      }).reduce((sum, proposal) => sum + Number(proposal.valor_total), 0) || 0;

      // Calcular vendas do ano atual
      const currentYearSales = acceptedProposals?.filter(proposal => {
        const proposalDate = new Date(proposal.created_at);
        return proposalDate.getFullYear() === currentYear;
      }).reduce((sum, proposal) => sum + Number(proposal.valor_total), 0) || 0;

      // Calcular estatísticas de propostas
      const totalProposals = allProposals?.length || 0;
      const acceptedCount = allProposals?.filter(p => p.status === 'accepted').length || 0;
      const sentCount = allProposals?.filter(p => p.status === 'sent').length || 0;
      const viewedCount = allProposals?.filter(p => p.status === 'viewed').length || 0;
      const rejectedCount = allProposals?.filter(p => p.status === 'rejected').length || 0;

      const conversionRate = totalProposals > 0 ? (acceptedCount / totalProposals) * 100 : 0;
      const averageTicket = acceptedCount > 0 ? currentYearSales / acceptedCount : 0;

      const target = targetData?.target_amount || 0;
      const targetAchievement = target > 0 ? (currentMonthSales / target) * 100 : 0;
      const remainingToTarget = Math.max(0, target - currentMonthSales);

      return {
        currentMonthSales,
        currentYearSales,
        target,
        targetAchievement,
        remainingToTarget,
        totalProposals,
        acceptedCount,
        sentCount,
        viewedCount,
        rejectedCount,
        conversionRate,
        averageTicket,
        salesData: acceptedProposals || []
      };
    },
    enabled: !!user?.id
  });
};
