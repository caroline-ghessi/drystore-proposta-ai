
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProposalHeader } from '@/components/proposal/ProposalHeader';
import RecommendedProducts from '@/components/proposal/RecommendedProducts';
import VideoProposal from '@/components/proposal/VideoProposal';
import ProposalMainContent from '@/components/proposal/ProposalMainContent';
import ProposalSidebar from '@/components/proposal/ProposalSidebar';
import { useProposalInteractions } from '@/hooks/useProposalInteractions';
import { useProposalStatus } from '@/hooks/useProposalStatus';
import { 
  getMockProposal, 
  getMockProposalItems, 
  getMockRecommendedProducts, 
  getMockClientQuestions 
} from '@/data/mockProposalData';
import { getMockAIScore, getMockNextSteps } from '@/data/mockAIData';

const ProposalView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const showAI = searchParams.get('ai') === 'true';
  const [internalNotes, setInternalNotes] = useState<string>('');
  
  // Mock data
  const proposal = getMockProposal(id || '1');
  const proposalItems = getMockProposalItems();
  const recommendedProducts = getMockRecommendedProducts();
  const clientQuestions = getMockClientQuestions();
  const mockAIScore = getMockAIScore(proposal.id);
  const mockNextSteps = getMockNextSteps(proposal.id);

  // Custom hooks
  const { interactions, addInteraction } = useProposalInteractions();
  const { status, handleAccept, handleReject, handleQuestion } = useProposalStatus(
    proposal.clientName, 
    addInteraction
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ProposalHeader proposal={proposal} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecommendedProducts products={recommendedProducts} />

        {/* Video Proposal */}
        <div className="mb-6">
          <VideoProposal
            videoUrl="https://example.com/video.mp4"
            vendorName="Carlos Vendedor"
            vendorTitle="Especialista em Soluções Residenciais"
            duration="2:35"
          />
        </div>

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
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
