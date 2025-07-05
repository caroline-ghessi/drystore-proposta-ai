import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalesPerformanceData {
  month: string;
  vendas: number;
  meta: number;
  proposals_count: number;
}

export interface ConversionMetricsData {
  conversion_rate: number;
  qualified_leads: number;
  average_ticket: number;
  monthly_growth: number;
  total_proposals: number;
  accepted_proposals: number;
  previous_month_sales: number;
  current_month_sales: number;
}

export interface ProductSalesData {
  name: string;
  sales: number;
  percentage: number;
  total_revenue: number;
}

export interface ClientROIData {
  name: string;
  invested: number;
  returned: number;
  roi: number;
  proposal_count: number;
}

export const useCompanySalesData = () => {
  return useQuery({
    queryKey: ['company-sales-data'],
    queryFn: async () => {
      // Get sales data for the last 12 months
      const currentDate = new Date();
      const twelveMonthsAgo = new Date(currentDate);
      twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);

      const { data: proposals, error } = await supabase
        .from('proposals')
        .select('valor_total, created_at, status')
        .eq('status', 'accepted')
        .gte('created_at', twelveMonthsAgo.toISOString());

      if (error) throw error;

      // Get sales targets for comparison
      const { data: targets, error: targetsError } = await supabase
        .from('sales_targets')
        .select('*')
        .gte('year', twelveMonthsAgo.getFullYear());

      if (targetsError) throw targetsError;

      // Process data by month
      const monthlyData: Record<string, { vendas: number; proposals_count: number }> = {};
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        const monthKey = monthNames[date.getMonth()];
        monthlyData[monthKey] = { vendas: 0, proposals_count: 0 };
      }

      // Aggregate proposals by month
      proposals?.forEach(proposal => {
        const proposalDate = new Date(proposal.created_at);
        const monthKey = monthNames[proposalDate.getMonth()];
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].vendas += proposal.valor_total || 0;
          monthlyData[monthKey].proposals_count += 1;
        }
      });

      // Combine with targets
      const result: SalesPerformanceData[] = Object.entries(monthlyData).map(([month, data]) => {
        // Find target for this month
        const monthIndex = monthNames.indexOf(month) + 1;
        const yearTargets = targets?.filter(t => 
          t.month === monthIndex && 
          (t.year === currentDate.getFullYear() || t.year === currentDate.getFullYear() - 1)
        );
        
        const totalTarget = yearTargets?.reduce((sum, target) => sum + (target.target_amount || 0), 0) || 0;
        
        return {
          month,
          vendas: data.vendas,
          meta: totalTarget || data.vendas * 1.2, // Default to 20% above current if no target
          proposals_count: data.proposals_count
        };
      });

      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCompanyAnalytics = () => {
  return useQuery({
    queryKey: ['company-analytics'],
    queryFn: async () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Get current month proposals
      const { data: currentProposals, error: currentError } = await supabase
        .from('proposals')
        .select('valor_total, status')
        .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      if (currentError) throw currentError;

      // Get previous month proposals
      const { data: previousProposals, error: previousError } = await supabase
        .from('proposals')
        .select('valor_total, status')
        .gte('created_at', `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${previousYear}-${previousMonth === 12 ? currentYear : previousYear}-${previousMonth === 12 ? '01' : (previousMonth + 1).toString().padStart(2, '0')}-01`);

      if (previousError) throw previousError;

      const totalProposals = currentProposals?.length || 0;
      const acceptedProposals = currentProposals?.filter(p => p.status === 'accepted').length || 0;
      const currentMonthSales = currentProposals?.filter(p => p.status === 'accepted').reduce((sum, p) => sum + (p.valor_total || 0), 0) || 0;
      const previousMonthSales = previousProposals?.filter(p => p.status === 'accepted').reduce((sum, p) => sum + (p.valor_total || 0), 0) || 0;
      
      const conversionRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;
      const averageTicket = acceptedProposals > 0 ? currentMonthSales / acceptedProposals : 0;
      const monthlyGrowth = previousMonthSales > 0 ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100 : 0;

      return {
        conversion_rate: conversionRate,
        qualified_leads: totalProposals,
        average_ticket: averageTicket,
        monthly_growth: monthlyGrowth,
        total_proposals: totalProposals,
        accepted_proposals: acceptedProposals,
        current_month_sales: currentMonthSales,
        previous_month_sales: previousMonthSales
      } as ConversionMetricsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductAnalytics = () => {
  return useQuery({
    queryKey: ['product-analytics'],
    queryFn: async () => {
      // Get proposal items for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: proposalItems, error } = await supabase
        .from('proposal_items')
        .select(`
          produto_nome,
          quantidade,
          preco_total,
          proposals!inner(status, created_at)
        `)
        .gte('proposals.created_at', thirtyDaysAgo.toISOString())
        .eq('proposals.status', 'accepted');

      if (error) throw error;

      // Aggregate by product
      const productMap: Record<string, { sales: number; revenue: number }> = {};

      proposalItems?.forEach(item => {
        const productName = item.produto_nome;
        if (!productMap[productName]) {
          productMap[productName] = { sales: 0, revenue: 0 };
        }
        productMap[productName].sales += item.quantidade || 0;
        productMap[productName].revenue += item.preco_total || 0;
      });

      // Convert to array and sort by revenue
      const products = Object.entries(productMap)
        .map(([name, data]) => ({
          name,
          sales: data.sales,
          total_revenue: data.revenue,
          percentage: 0 // Will be calculated after sorting
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10); // Top 10 products

      // Calculate percentages based on max revenue
      const maxRevenue = products[0]?.total_revenue || 1;
      products.forEach(product => {
        product.percentage = Math.round((product.total_revenue / maxRevenue) * 100);
      });

      return products as ProductSalesData[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useClientAnalytics = () => {
  return useQuery({
    queryKey: ['client-analytics'],
    queryFn: async () => {
      // Get accepted proposals with client data
      const { data: proposals, error } = await supabase
        .from('proposals')
        .select(`
          valor_total,
          clients!inner(nome, empresa)
        `)
        .eq('status', 'accepted')
        .order('valor_total', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Group by client and calculate metrics
      const clientMap: Record<string, { 
        name: string; 
        totalInvested: number; 
        proposalCount: number; 
      }> = {};

      proposals?.forEach(proposal => {
        const clientName = proposal.clients.empresa || proposal.clients.nome;
        if (!clientMap[clientName]) {
          clientMap[clientName] = {
            name: clientName,
            totalInvested: 0,
            proposalCount: 0
          };
        }
        clientMap[clientName].totalInvested += proposal.valor_total || 0;
        clientMap[clientName].proposalCount += 1;
      });

      // Convert to ROI analysis (simulate return as 2.5x investment for demo)
      const clients = Object.values(clientMap)
        .map(client => ({
          name: client.name,
          invested: client.totalInvested,
          returned: client.totalInvested * 2.5, // Simulated return
          roi: 150, // Simulated 150% ROI
          proposal_count: client.proposalCount
        }))
        .sort((a, b) => b.invested - a.invested)
        .slice(0, 10);

      return clients as ClientROIData[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useSalesPredictionData = () => {
  return useQuery({
    queryKey: ['sales-prediction'],
    queryFn: async () => {
      // Get last 6 months of data for trend analysis
      const currentDate = new Date();
      const sixMonthsAgo = new Date(currentDate);
      sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

      const { data: proposals, error } = await supabase
        .from('proposals')
        .select('valor_total, created_at')
        .eq('status', 'accepted')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (error) throw error;

      // Group by month
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyData: Record<string, number> = {};

      proposals?.forEach(proposal => {
        const date = new Date(proposal.created_at);
        const monthKey = monthNames[date.getMonth()];
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (proposal.valor_total || 0);
      });

      // Calculate trend and make simple predictions
      const values = Object.values(monthlyData);
      const averageGrowth = values.length > 1 ? 
        (values[values.length - 1] - values[0]) / values.length : 0;

      const currentMonthSales = values[values.length - 1] || 0;
      
      // Generate next 6 months predictions with some variance
      const predictions = [];
      let baseValue = currentMonthSales;
      
      for (let i = 1; i <= 6; i++) {
        baseValue += averageGrowth * (1 + (Math.random() * 0.2 - 0.1)); // Add 10% variance
        const futureDate = new Date(currentDate);
        futureDate.setMonth(currentDate.getMonth() + i);
        
        predictions.push({
          month: monthNames[futureDate.getMonth()],
          real: null,
          predicted: Math.max(0, Math.round(baseValue))
        });
      }

      // Add current month as real data
      const realData = [{
        month: monthNames[currentDate.getMonth()],
        real: currentMonthSales,
        predicted: null
      }];

      return [...realData, ...predictions];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};