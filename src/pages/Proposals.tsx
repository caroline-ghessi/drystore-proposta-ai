
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProposalHeader from '@/components/proposals/ProposalHeader';
import ProposalStats from '@/components/proposals/ProposalStats';
import ProposalTabs from '@/components/proposals/ProposalTabs';
import { useERPIntegration } from '@/hooks/useERPIntegration';
import { useCRMIntegration } from '@/hooks/useCRMIntegration';

const Proposals = () => {
  const [mockProposals] = useState([
    {
      id: 'PROP-001',
      clientName: 'João Silva Construções',
      clientEmail: 'joao@email.com',
      clientPhone: '11999887766',
      finalPrice: 15000.00,
      status: 'accepted',
      items: [
        { id: '1', name: 'Placas Drywall 12,5mm', quantity: 50, price: 25.00 },
        { id: '2', name: 'Perfis de Aço', quantity: 100, price: 8.50 },
        { id: '3', name: 'Massa para Junta', quantity: 10, price: 45.00 }
      ],
      createdAt: '2024-01-15'
    },
    {
      id: 'PROP-002',
      clientName: 'Maria Santos Arquitetura',
      clientEmail: 'maria@email.com',
      clientPhone: '11988776655',
      finalPrice: 23500.00,
      status: 'accepted',
      items: [
        { id: '1', name: 'Sistema Drywall Completo', quantity: 1, price: 23500.00 }
      ],
      createdAt: '2024-01-16'
    }
  ]);

  const { getERPOrders } = useERPIntegration();
  const { getCRMDeals } = useCRMIntegration();
  const [erpOrders, setErpOrders] = useState([]);
  const [crmDeals, setCrmDeals] = useState([]);

  useEffect(() => {
    setErpOrders(getERPOrders());
    setCrmDeals(getCRMDeals());
  }, []);

  const acceptedProposals = mockProposals.filter(p => p.status === 'accepted');

  const refreshIntegrationData = () => {
    setErpOrders(getERPOrders());
    setCrmDeals(getCRMDeals());
  };

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
