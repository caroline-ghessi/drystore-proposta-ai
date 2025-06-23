import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ClientDashboard from '@/components/client/ClientDashboard';
import ClientProposalHistory from '@/components/client/ClientProposalHistory';
import SalesRepContact from '@/components/client/SalesRepContact';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useClientProposals } from '@/hooks/useClientProposals';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

const ClientPortal = () => {
  const navigate = useNavigate();
  const { clientAuth, loading: authLoading } = useClientAuth();

  // Buscar dados reais do cliente e propostas
  const { data: clientData, isLoading: isLoadingData, error } = useClientProposals(
    clientAuth?.email || ''
  );

  useEffect(() => {
    if (!authLoading && !clientAuth) {
      navigate('/client-login');
    }
  }, [authLoading, clientAuth, navigate]);

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Carregando suas propostas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-gray-600 text-center mb-6">
              Você precisa fazer login para acessar este portal.
            </p>
            <Button onClick={() => navigate('/client-login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao Carregar Dados</h2>
            <p className="text-gray-600 text-center mb-6">
              Não foi possível carregar suas propostas. Tente novamente.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { client, proposals } = clientData;

  console.log('🎯 Processando propostas no ClientPortal:', proposals.length);

  // Processar propostas para o formato esperado pelos componentes
  const processedProposals = proposals.map(proposal => {
    const isExpired = new Date(proposal.validade) < new Date();
    let mappedStatus: 'aceita' | 'pendente' | 'expirada' | 'rejeitada' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
    
    console.log(`📊 Processando proposta ${proposal.id}: status=${proposal.status}, expirada=${isExpired}`);
    
    if (isExpired) {
      mappedStatus = 'expirada';
    } else {
      switch (proposal.status) {
        case 'accepted':
          mappedStatus = 'aceita';
          break;
        case 'rejected':
          mappedStatus = 'rejeitada';
          break;
        case 'expired':
          mappedStatus = 'expirada';
          break;
        case 'sent':
        case 'viewed':
          mappedStatus = 'pendente';
          break;
        default:
          // Não deveria chegar aqui já que filtramos drafts, mas por segurança
          mappedStatus = 'pendente';
      }
    }

    console.log(`✅ Status final da proposta ${proposal.id}: ${mappedStatus}`);

    return {
      id: proposal.id,
      number: `PROP-${proposal.id.substring(0, 8)}`,
      project: `Proposta ${proposal.id.substring(0, 8)}`,
      value: Number(proposal.valor_total),
      date: new Date(proposal.created_at).toLocaleDateString('pt-BR'),
      validUntil: new Date(proposal.validade).toLocaleDateString('pt-BR'),
      status: mappedStatus,
      features: proposal.proposal_features?.[0] || { delivery_control: false, contract_generation: false }
    };
  });

  // Separar propostas aceitas
  const acceptedProposals = processedProposals.filter(p => p.status === 'aceita');

  console.log('✅ Propostas aceitas:', acceptedProposals.length);

  // Verificar se há propostas aceitas com controle de entregas ativado
  const hasDeliveryTracking = acceptedProposals.some(proposal => 
    proposal.features.delivery_control === true
  );

  console.log('🚚 Acompanhamento de entregas habilitado:', hasDeliveryTracking);

  // Mock data para funcionalidades ainda não implementadas
  const mockCashbackHistory = [];
  const mockDeliveryProgress = [];
  const mockRepresentative = {
    id: '1',
    name: 'Representante Comercial',
    email: 'vendedor@drystore.com',
    phone: '(11) 99999-8888',
    whatsapp: '5511999998888',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    territory: 'Região Comercial'
  };

  // Criar perfil do cliente baseado nos dados reais
  const clientProfile = {
    id: client.id,
    name: client.nome,
    email: client.email,
    phone: client.telefone || '(11) 99999-9999',
    totalPurchases: acceptedProposals.reduce((sum, p) => sum + p.value, 0),
    cashbackBalance: 0,
    pointsBalance: 0,
    tier: 'bronze' as const,
    createdAt: new Date().toISOString(),
    lastPurchase: acceptedProposals.length > 0 ? acceptedProposals[0].date : undefined
  };

  return (
    <Layout showBackButton={false}>
      <div className="animate-fade-in space-y-6">
        {/* Dashboard Principal */}
        <ClientDashboard
          client={clientProfile}
          proposalsAccepted={acceptedProposals}
          cashbackHistory={mockCashbackHistory}
          deliveryProgress={mockDeliveryProgress}
          showDeliveryTracking={hasDeliveryTracking}
        />

        {/* Histórico Completo de Propostas */}
        <ClientProposalHistory proposals={processedProposals} />

        {/* Informações do Representante */}
        <SalesRepContact representative={mockRepresentative} />
      </div>
    </Layout>
  );
};

export default ClientPortal;
