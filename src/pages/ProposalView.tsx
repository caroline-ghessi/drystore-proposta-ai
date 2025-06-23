
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProposalHeader } from '@/components/proposal/ProposalHeader';
import VideoProposal from '@/components/proposal/VideoProposal';
import ProposalMainContent from '@/components/proposal/ProposalMainContent';
import ProposalSidebar from '@/components/proposal/ProposalSidebar';
import ProposalFeatureToggles from '@/components/proposal/ProposalFeatureToggles';
import UrgencyCard from '@/components/proposal/UrgencyCard';
import ProposalDataIndicator from '@/components/proposal/ProposalDataIndicator';
import ProposalLoadingState from '@/components/proposal/ProposalLoadingState';
import { useProposalInteractions } from '@/hooks/useProposalInteractions';
import { useProposalStatus } from '@/hooks/useProposalStatus';
import { useProposalFeatures } from '@/hooks/useProposalFeatures';
import { useProposalData } from '@/hooks/useProposalData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getMockRecommendedProducts, 
  getMockClientQuestions 
} from '@/data/mockProposalData';
import { getMockAIScore, getMockNextSteps } from '@/data/mockAIData';

const ProposalView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const showAI = searchParams.get('ai') === 'true';
  const [internalNotes, setInternalNotes] = useState<string>('');
  
  // Custom hooks - devem ser chamados SEMPRE, antes de qualquer return condicional
  const { interactions, addInteraction } = useProposalInteractions();
  const { features, toggleContractGeneration, toggleDeliveryControl } = useProposalFeatures(id || '1');
  
  // Use the new data hook
  const { proposal, proposalItems, dataSource, isLoading, error } = useProposalData(id || '');

  // Custom hooks que dependem de proposal - também devem ser chamados sempre
  const { status, handleAccept, handleReject, handleQuestion } = useProposalStatus(
    proposal.clientName, 
    addInteraction
  );

  // Loading state - agora depois de todos os hooks
  if (isLoading) {
    return <ProposalLoadingState />;
  }

  // Error state
  if (error) {
    console.error('❌ ProposalView: Erro ao carregar proposta:', error);
  }

  // Dados adicionais (usar mock para compatibilidade)
  const recommendedProducts = getMockRecommendedProducts();
  const clientQuestions = getMockClientQuestions();
  const mockAIScore = getMockAIScore(proposal.id);
  const mockNextSteps = getMockNextSteps(proposal.id);

  // Check if current user is a vendor (not client)
  const isVendor = user?.role !== 'cliente';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProposalHeader proposal={proposal} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicador de fonte dos dados - apenas para usuários internos */}
        {isVendor && (
          <ProposalDataIndicator 
            dataSource={dataSource}
            proposal={proposal}
            itemsCount={proposalItems.length}
          />
        )}

        {/* Urgency Card moved to top for better conversion */}
        <div className="mb-6">
          <UrgencyCard validUntil={proposal.validUntil} />
        </div>

        {/* Video Proposal */}
        <div className="mb-6">
          <VideoProposal
            videoUrl="https://example.com/video.mp4"
            vendorName="Carlos Vendedor"
            vendorTitle="Especialista em Soluções Residenciais"
            duration="2:35"
          />
        </div>

        {/* Feature Toggles - Only visible for vendors, representatives and admins */}
        {isVendor && ['admin', 'vendedor_interno', 'representante'].includes(user?.role || '') && (
          <div className="mb-6">
            <ProposalFeatureToggles
              proposalId={id || '1'}
              contractGeneration={features.contractGeneration}
              deliveryControl={features.deliveryControl}
              onToggleContractGeneration={toggleContractGeneration}
              onToggleDeliveryControl={toggleDeliveryControl}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <ProposalMainContent
            proposalItems={proposalItems}
            proposal={proposal}
            internalNotes={internalNotes}
            setInternalNotes={setInternalNotes}
            interactions={interactions}
            addInteraction={addInteraction}
            onQuestionSubmit={handleQuestion}
            status={status}
          />

          <ProposalSidebar
            proposal={proposal}
            status={status}
            onAccept={handleAccept}
            onReject={handleReject}
            showAI={showAI}
            mockAIScore={mockAIScore}
            mockNextSteps={mockNextSteps}
            clientQuestions={clientQuestions}
            contractGeneration={features.contractGeneration}
            deliveryControl={features.deliveryControl}
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
