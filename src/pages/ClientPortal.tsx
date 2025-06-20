
import Layout from '@/components/Layout';
import ClientDashboard from '@/components/client/ClientDashboard';
import { ClientProfile, CashbackTransaction } from '@/types/client';
import { DeliveryProgress } from '@/types/delivery';

const ClientPortal = () => {
  // Mock data - em produção viria da API
  const mockClient: ClientProfile = {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    totalPurchases: 125000,
    cashbackBalance: 2500.50,
    pointsBalance: 850,
    pointsExpirationDate: '2024-12-31',
    tier: 'gold',
    createdAt: '2023-01-15',
    lastPurchase: '2024-06-15'
  };

  const mockProposalsAccepted = [
    {
      id: '1',
      number: 'PROP-2024-001',
      project: 'Residência Moderna',
      value: 48283.75,
      date: '2024-01-15',
      status: 'aceita'
    },
    {
      id: '2',
      number: 'PROP-2024-006',
      project: 'Reforma Comercial',
      value: 45000.00,
      date: '2024-01-10',
      status: 'aceita'
    }
  ];

  const mockCashbackHistory: CashbackTransaction[] = [
    {
      id: '1',
      clientId: '1',
      proposalId: '1',
      type: 'earned',
      amount: 1500.00,
      description: 'Cashback - Residência Moderna',
      date: '2024-01-20',
      expirationDate: '2024-12-31'
    },
    {
      id: '2',
      clientId: '1',
      proposalId: '2',
      type: 'earned',
      amount: 1000.50,
      description: 'Cashback - Reforma Comercial',
      date: '2024-01-15',
      expirationDate: '2024-12-31'
    }
  ];

  const mockDeliveryProgress: DeliveryProgress[] = [
    {
      proposalId: '1',
      totalContracted: 100,
      totalDelivered: 72,
      percentageDelivered: 72,
      percentageRemaining: 28,
      unit: 'placas',
      lastDeliveryDate: '2024-06-15',
      deliveries: []
    }
  ];

  return (
    <Layout>
      <div className="animate-fade-in">
        <ClientDashboard
          client={mockClient}
          proposalsAccepted={mockProposalsAccepted}
          cashbackHistory={mockCashbackHistory}
          deliveryProgress={mockDeliveryProgress}
        />
      </div>
    </Layout>
  );
};

export default ClientPortal;
