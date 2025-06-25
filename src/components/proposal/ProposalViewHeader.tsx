
import { ModernProposalHeader } from '@/components/proposal/ModernProposalHeader';
import ProposalLoadingState from '@/components/proposal/ProposalLoadingState';

interface ProposalViewHeaderProps {
  isLoading: boolean;
  error: any;
  proposal: any;
  clientName: string;
  proposalNumber: string;
  validUntil: string;
  isExpired: boolean;
}

export const ProposalViewHeader = ({
  isLoading,
  error,
  proposal,
  clientName,
  proposalNumber,
  validUntil,
  isExpired
}: ProposalViewHeaderProps) => {
  // Loading state
  if (isLoading) {
    return <ProposalLoadingState />;
  }

  // Error state
  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposta não encontrada</h1>
          <p className="text-gray-600">A proposta solicitada não foi encontrada ou não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <ModernProposalHeader
      clientName={clientName}
      proposalNumber={proposalNumber}
      validUntil={validUntil}
      isExpired={isExpired}
    />
  );
};
