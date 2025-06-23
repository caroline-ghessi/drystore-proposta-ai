
import { useParams } from 'react-router-dom';
import { useSecureClientProposals } from '@/hooks/useSecureClientProposals';
import { useSecureClientAuth } from '@/hooks/useSecureClientAuth';
import { useClientBySlugOrId } from '@/hooks/useClientBySlugOrId';
import SecureClientAuth from '@/components/security/SecureClientAuth';
import ClientAuthLoadingState from '@/components/client/ClientAuthLoadingState';
import ClientAuthErrorState from '@/components/client/ClientAuthErrorState';
import ClientPortalDashboard from '@/components/client/ClientPortalDashboard';

const SecureClientPortalBySlug = () => {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  
  // Buscar dados do cliente pelo slug/ID
  const { data: clientInfo, isLoading: isLoadingClientInfo, error: clientInfoError } = useClientBySlugOrId(
    clientSlug || ''
  );
  
  const { 
    clientAuth, 
    loading: authLoading, 
    error: authError, 
    attempts,
    isBlocked,
    loginWithEmail, 
    logout 
  } = useSecureClientAuth();

  const { 
    data: clientData, 
    isLoading: isLoadingData, 
    error: dataError 
  } = useSecureClientProposals(clientAuth?.token || '');

  const handleRetry = () => {
    logout();
  };

  // Mostrar loading enquanto busca informações do cliente
  if (isLoadingClientInfo) {
    return <ClientAuthLoadingState />;
  }

  // Mostrar erro se não conseguir carregar informações do cliente
  if (clientInfoError || !clientInfo) {
    return <ClientAuthErrorState onRetry={() => window.location.reload()} />;
  }

  const clientName = clientInfo.clientName;

  // Show authentication form if not authenticated
  if (!clientAuth) {
    return (
      <SecureClientAuth
        clientName={clientName}
        onEmailSubmit={loginWithEmail}
        loading={authLoading}
        error={authError}
        attempts={attempts}
        isBlocked={isBlocked}
      />
    );
  }

  // Show loading state while fetching data
  if (isLoadingData || authLoading) {
    return <ClientAuthLoadingState />;
  }

  // Show error state if data loading failed
  if (dataError || !clientData) {
    return <ClientAuthErrorState onRetry={handleRetry} />;
  }

  const { client, proposals } = clientData;

  // Process proposals with enhanced security validation
  const processedProposals = proposals.map(proposal => {
    const isExpired = new Date(proposal.validade) < new Date();
    let mappedStatus: 'aceita' | 'pendente' | 'expirada' | 'rejeitada' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
    
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

    return {
      id: proposal.id,
      number: `PROP-${proposal.id.substring(0, 8)}`,
      project: `Proposta ${proposal.id.substring(0, 8)}`,
      value: Number(proposal.valor_total),
      date: new Date(proposal.created_at).toLocaleDateString('pt-BR'),
      validUntil: new Date(proposal.validade).toLocaleDateString('pt-BR'),
      status: mappedStatus
    };
  });

  // Separate active and expired proposals
  const activeProposals = processedProposals.filter(proposal => 
    proposal.status !== 'expirada' && new Date(proposal.validUntil.split('/').reverse().join('-')) >= new Date()
  );
  const expiredProposals = processedProposals.filter(proposal => 
    proposal.status === 'expirada' || new Date(proposal.validUntil.split('/').reverse().join('-')) < new Date()
  );

  return (
    <ClientPortalDashboard
      client={client}
      activeProposals={activeProposals}
      expiredProposals={expiredProposals}
      totalProposals={proposals.length}
    />
  );
};

export default SecureClientPortalBySlug;
