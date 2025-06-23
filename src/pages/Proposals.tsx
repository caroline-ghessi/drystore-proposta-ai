
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import ProposalHeader from '@/components/proposals/ProposalHeader';
import ProposalStats from '@/components/proposals/ProposalStats';
import ProposalTabs from '@/components/proposals/ProposalTabs';
import { useERPIntegration } from '@/hooks/useERPIntegration';
import { useCRMIntegration } from '@/hooks/useCRMIntegration';
import { useProposals } from '@/hooks/useProposals';

const Proposals = () => {
  // Hook para buscar propostas reais do Supabase
  const { data: supabaseProposals, isLoading, error } = useProposals();
  
  const { getERPOrders } = useERPIntegration();
  const { getCRMDeals } = useCRMIntegration();
  const [erpOrders, setErpOrders] = useState([]);
  const [crmDeals, setCrmDeals] = useState([]);

  useEffect(() => {
    setErpOrders(getERPOrders());
    setCrmDeals(getCRMDeals());
  }, []);

  // Processar propostas aceitas do Supabase
  const acceptedProposals = useMemo(() => {
    if (!supabaseProposals) return [];
    
    return supabaseProposals
      .filter(p => p.status === 'accepted')
      .map(proposal => ({
        id: proposal.id,
        clientName: proposal.clients?.nome || 'Cliente',
        clientEmail: proposal.clients?.email || '',
        clientPhone: proposal.clients?.telefone || '',
        finalPrice: proposal.valor_total || 0,
        status: 'accepted',
        items: [], // Buscar itens separadamente se necessário
        createdAt: proposal.created_at
      }));
  }, [supabaseProposals]);

  const refreshIntegrationData = () => {
    setErpOrders(getERPOrders());
    setCrmDeals(getCRMDeals());
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('❌ Proposals: Erro ao carregar propostas:', error);
  }

  return (
    <Layout>
      <div className="space-y-6">
        <ProposalHeader />
        
        <ProposalStats 
          acceptedProposalsCount={acceptedProposals.length}
          crmDealsCount={crmDeals.length}
          erpOrdersCount={erpOrders.length}
        />

        <ProposalTabs 
          acceptedProposals={acceptedProposals}
          erpOrders={erpOrders}
          crmDeals={crmDeals}
          onRefreshIntegrationData={refreshIntegrationData}
        />
      </div>
    </Layout>
  );
};

export default Proposals;
