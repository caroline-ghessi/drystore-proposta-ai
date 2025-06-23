
import Layout from '@/components/Layout';
import ClientProposalHistory from '@/components/client/ClientProposalHistory';
import ClientWelcomeHeader from '@/components/client/ClientWelcomeHeader';
import ClientPortalStats from '@/components/client/ClientPortalStats';
import ClientPortalEmptyState from '@/components/client/ClientPortalEmptyState';

interface ProcessedProposal {
  id: string;
  number: string;
  project: string;
  value: number;
  date: string;
  validUntil: string;
  status: 'aceita' | 'pendente' | 'expirada' | 'rejeitada' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
}

interface ClientPortalDashboardProps {
  client: {
    nome: string;
  };
  activeProposals: ProcessedProposal[];
  expiredProposals: ProcessedProposal[];
  totalProposals: number;
}

const ClientPortalDashboard = ({ 
  client, 
  activeProposals, 
  expiredProposals, 
  totalProposals 
}: ClientPortalDashboardProps) => {
  return (
    <Layout showBackButton={false}>
      <div className="animate-fade-in space-y-6">
        {/* Header do Cliente */}
        <ClientWelcomeHeader clientName={client.nome} />

        {/* Dashboard Simplificado */}
        <ClientPortalStats 
          activeProposals={activeProposals}
          expiredProposals={expiredProposals}
        />

        {/* Propostas Ativas */}
        {activeProposals.length > 0 && (
          <ClientProposalHistory 
            proposals={activeProposals}
            title="Propostas Ativas"
          />
        )}

        {/* Propostas Expiradas (se houver) */}
        {expiredProposals.length > 0 && (
          <ClientProposalHistory 
            proposals={expiredProposals}
            title="Propostas Expiradas"
          />
        )}

        {/* Mensagem quando não há propostas */}
        {totalProposals === 0 && <ClientPortalEmptyState />}
      </div>
    </Layout>
  );
};

export default ClientPortalDashboard;
