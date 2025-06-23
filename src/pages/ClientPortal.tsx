
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
import { AlertCircle, Loader2, Bug } from 'lucide-react';

const ClientPortal = () => {
  const navigate = useNavigate();
  const { clientAuth, loading: authLoading } = useClientAuth();

  // Buscar dados reais do cliente e propostas
  const { data: clientData, isLoading: isLoadingData, error } = useClientProposals(
    clientAuth?.email || ''
  );

  // Estado de debug
  const [showDebugInfo, setShowDebugInfo] = useState(false);

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
            
            {/* DEBUG INFO */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              <p>🔍 Debug: authLoading={authLoading ? 'true' : 'false'}</p>
              <p>🔍 Debug: isLoadingData={isLoadingData ? 'true' : 'false'}</p>
              <p>🔍 Debug: clientAuth={clientAuth ? clientAuth.email : 'null'}</p>
            </div>
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
            
            {/* DEBUG INFO */}
            <div className="mb-4 text-xs text-gray-400 text-center">
              <p>🔍 Debug: clientAuth é null</p>
              <p>🔍 Debug: authLoading={authLoading ? 'true' : 'false'}</p>
            </div>
            
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
            
            {/* DEBUG INFO */}
            <div className="mb-4 text-xs text-gray-400 text-center border p-2 rounded">
              <p>🔍 Debug Info:</p>
              <p>Email: {clientAuth?.email}</p>
              <p>ClientId: {clientAuth?.clientId}</p>
              <p>Error: {error?.message || 'Erro desconhecido'}</p>
              <p>ClientData: {clientData ? 'Carregado' : 'Null'}</p>
            </div>
            
            <Button onClick={() => window.location.reload()} className="mb-2">
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              <Bug className="w-4 h-4 mr-2" />
              {showDebugInfo ? 'Ocultar' : 'Mostrar'} Debug
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { client, proposals, salesRepresentative } = clientData;

  console.log('🎯 [DEBUG] Processando propostas no ClientPortal:', proposals.length);

  // Processar propostas para o formato esperado pelos componentes
  const processedProposals = proposals.map(proposal => {
    const isExpired = new Date(proposal.validade) < new Date();
    let mappedStatus: 'aceita' | 'pendente' | 'expirada' | 'rejeitada' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
    
    console.log(`📊 [DEBUG] Processando proposta ${proposal.id.substring(0, 8)}: status=${proposal.status}, expirada=${isExpired}`);
    
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
          mappedStatus = 'pendente';
      }
    }

    console.log(`✅ [DEBUG] Status final da proposta ${proposal.id.substring(0, 8)}: ${mappedStatus}`);

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

  console.log('✅ [DEBUG] Propostas aceitas:', acceptedProposals.length);

  // Verificar se há propostas aceitas com controle de entregas ativado
  const hasDeliveryTracking = acceptedProposals.some(proposal => 
    proposal.features.delivery_control === true
  );

  console.log('🚚 [DEBUG] Acompanhamento de entregas habilitado:', hasDeliveryTracking);

  // Mock data para funcionalidades ainda não implementadas
  const mockCashbackHistory = [];
  const mockDeliveryProgress = [];

  // Usar dados reais do vendedor ou fallback para mock
  const representativeData = salesRepresentative || {
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
        {/* DEBUG INFO PANEL */}
        {showDebugInfo && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-orange-800">🔍 Debug Info</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDebugInfo(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="text-sm text-orange-700 space-y-1">
                <p><strong>Email autenticado:</strong> {clientAuth?.email}</p>
                <p><strong>Client ID:</strong> {clientAuth?.clientId}</p>
                <p><strong>Cliente carregado:</strong> {client?.nome} ({client?.email})</p>
                <p><strong>Total de propostas:</strong> {proposals.length}</p>
                <p><strong>Propostas processadas:</strong> {processedProposals.length}</p>
                <p><strong>Propostas aceitas:</strong> {acceptedProposals.length}</p>
                <p><strong>Vendedor:</strong> {salesRepresentative ? salesRepresentative.name : 'Usando dados mock'}</p>
                <div className="mt-2">
                  <strong>Status das propostas:</strong>
                  {processedProposals.map(p => (
                    <div key={p.id} className="ml-2">
                      • {p.number}: {p.status}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header com botão de debug */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Portal do Cliente</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug
          </Button>
        </div>

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

        {/* Informações do Representante - AGORA COM DADOS REAIS */}
        <SalesRepContact representative={representativeData} />
      </div>
    </Layout>
  );
};

export default ClientPortal;
