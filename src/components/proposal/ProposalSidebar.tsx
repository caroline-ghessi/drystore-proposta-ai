
import { InvestmentCard } from '@/components/proposal/InvestmentCard';
import AIScoreCard from '@/components/ai/AIScoreCard';
import NextStepSuggestions from '@/components/ai/NextStepSuggestions';
import AIAssistant from '@/components/proposal/AIAssistant';
import ProposalAcceptedActions from '@/components/proposal/ProposalAcceptedActions';
import { AIScore, NextStepSuggestion } from '@/types/aiScore';

interface ProposalSidebarProps {
  proposal: any;
  status: 'pending' | 'accepted' | 'rejected' | 'aguardando_pagamento';
  onAccept: () => void;
  onReject: () => void;
  showAI: boolean;
  mockAIScore: AIScore;
  mockNextSteps: NextStepSuggestion;
  clientQuestions: string[];
  contractGeneration?: boolean;
  deliveryControl?: boolean;
}

const ProposalSidebar = ({
  proposal,
  status,
  onAccept,
  onReject,
  showAI,
  mockAIScore,
  mockNextSteps,
  clientQuestions,
  contractGeneration = false,
  deliveryControl = false
}: ProposalSidebarProps) => {
  return (
    <div className="space-y-6">
      <InvestmentCard 
        proposal={proposal}
        status={status}
        onAccept={onAccept}
        onQuestion={() => {}}
        onReject={onReject}
      />

      {showAI && (
        <>
          <AIScoreCard aiScore={mockAIScore} />
          {status === 'rejected' && (
            <NextStepSuggestions suggestions={mockNextSteps} />
          )}
          <AIAssistant
            proposalId={proposal.id!}
            clientQuestions={clientQuestions}
            proposalData={proposal}
          />
        </>
      )}

      {status === 'accepted' && (
        <ProposalAcceptedActions 
          proposalId={proposal.id}
          contractGeneration={contractGeneration}
          deliveryControl={deliveryControl}
        />
      )}
    </div>
  );
};

export default ProposalSidebar;
