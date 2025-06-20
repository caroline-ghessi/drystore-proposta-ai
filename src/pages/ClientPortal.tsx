
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ClientDashboard from '@/components/client/ClientDashboard';
import ClientProposalHistory from '@/components/client/ClientProposalHistory';
import SalesRepContact from '@/components/client/SalesRepContact';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientProfile, CashbackTransaction } from '@/types/client';
import { DeliveryProgress } from '@/types/delivery';
import { SalesRepresentative } from '@/types/auth';
import { AlertCircle, Loader2 } from 'lucide-react';

const ClientPortal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clientAuth, validateToken, setClientAuth, loading } = useClientAuth();
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token && !clientAuth) {
      // Validar token da URL
      const auth = validateToken(token);
      if (auth && auth.isValid) {
        setClientAuth(auth);
        localStorage.setItem('client_auth', JSON.stringify(auth));
        // Limpar token da URL
        navigate('/client-portal', { replace: true });
      } else {
        setValidating(false);
      }
    } else if (!token && !clientAuth) {
      setValidating(false);
    } else {
      setValidating(false);
    }
  }, [searchParams, clientAuth, validateToken, setClientAuth, navigate]);

  // Mock data baseado no email do cliente autenticado
  const getMockDataForClient = (email: string) => {
    const mockClient: ClientProfile = {
      id: '1',
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email,
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
        status: 'aceita' as const
      },
      {
        id: '2',
        number: 'PROP-2024-006',
        project: 'Reforma Comercial',
        value: 45000.00,
        date: '2024-01-10',
        status: 'aceita' as const
      }
    ];

    const mockAllProposals = [
      ...mockProposalsAccepted,
      {
        id: '3',
        number: 'PROP-2024-012',
        project: 'Ampliação Residencial',
        value: 32500.00,
        date: '2024-06-01',
        validUntil: '2024-06-30',
        status: 'pendente' as const
      },
      {
        id: '4',
        number: 'PROP-2024-003',
        project: 'Cobertura Gourmet',
        value: 28750.00,
        date: '2023-12-10',
        validUntil: '2024-01-10',
        status: 'expirada' as const
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

    const mockRepresentative: SalesRepresentative = {
      id: '1',
      name: 'Carlos Vendedor',
      email: 'carlos@drystore.com',
      phone: '(11) 99999-8888',
      whatsapp: '5511999998888',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      territory: 'São Paulo - Zona Sul'
    };

    return {
      mockClient,
      mockProposalsAccepted,
      mockAllProposals,
      mockCashbackHistory,
      mockDeliveryProgress,
      mockRepresentative
    };
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Validando acesso...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientAuth || !clientAuth.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-gray-600 text-center mb-6">
              Token inválido ou expirado. Solicite um novo link de acesso.
            </p>
            <Button onClick={() => navigate('/client-login')}>
              Solicitar Novo Acesso
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    mockClient,
    mockProposalsAccepted,
    mockAllProposals,
    mockCashbackHistory,
    mockDeliveryProgress,
    mockRepresentative
  } = getMockDataForClient(clientAuth.email);

  return (
    <Layout showBackButton={false}>
      <div className="animate-fade-in space-y-6">
        {/* Dashboard Principal */}
        <ClientDashboard
          client={mockClient}
          proposalsAccepted={mockProposalsAccepted}
          cashbackHistory={mockCashbackHistory}
          deliveryProgress={mockDeliveryProgress}
        />

        {/* Histórico Completo de Propostas */}
        <ClientProposalHistory proposals={mockAllProposals} />

        {/* Informações do Representante */}
        <SalesRepContact representative={mockRepresentative} />
      </div>
    </Layout>
  );
};

export default ClientPortal;
