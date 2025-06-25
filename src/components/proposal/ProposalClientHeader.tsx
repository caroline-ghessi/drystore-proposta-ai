
import { ModernProposalHeader } from '@/components/proposal/ModernProposalHeader';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ProposalClientHeaderProps {
  clientName: string;
  proposalNumber: string;
  validUntil: string;
  isExpired: boolean;
  isLoading?: boolean;
  error?: any;
}

export const ProposalClientHeader = ({
  clientName,
  proposalNumber,
  validUntil,
  isExpired,
  isLoading,
  error
}: ProposalClientHeaderProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposta não encontrada</h2>
            <p className="text-gray-600 text-center">
              O link de acesso é inválido ou a proposta não existe mais.
            </p>
          </CardContent>
        </Card>
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
