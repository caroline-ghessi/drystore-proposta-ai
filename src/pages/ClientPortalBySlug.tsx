
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useClientProposals } from '@/hooks/useClientProposals';
import { getClientNameFromSlug } from '@/utils/clientUtils';
import ClientEmailAuth from '@/components/client/ClientEmailAuth';
import ClientAuthLoadingState from '@/components/client/ClientAuthLoadingState';
import ClientAuthErrorState from '@/components/client/ClientAuthErrorState';
import ClientPortalDashboard from '@/components/client/ClientPortalDashboard';

const ClientPortalBySlug = () => {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const clientName = clientSlug ? getClientNameFromSlug(clientSlug) : '';

  const { data: clientData, isLoading: isLoadingData, error } = useClientProposals(
    isAuthenticated ? email : ''
  );

  const handleEmailSubmit = async (submittedEmail: string) => {
    setLoading(true);
    setEmail(submittedEmail);
    setIsAuthenticated(true);
    setLoading(false);
  };

  const handleRetry = () => {
    setIsAuthenticated(false);
    setEmail('');
  };

  if (!isAuthenticated) {
    return (
      <ClientEmailAuth
        clientName={clientName}
        onEmailSubmit={handleEmailSubmit}
        loading={loading}
      />
    );
  }

  if (isLoadingData || loading) {
    return <ClientAuthLoadingState />;
  }

  if (error || !clientData) {
    return <ClientAuthErrorState onRetry={handleRetry} />;
  }

  const { client, proposals } = clientData;

  console.log('🎯 Processando propostas no ClientPortalBySlug:', proposals.length);

  // Processar propostas com tipo correto - MELHOR MAPEAMENTO DE STATUS
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
          // Não deveria chegar aqui já que filtramos drafts
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
      status: mappedStatus
    };
  });

  // Separar propostas ativas e expiradas
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

export default ClientPortalBySlug;
