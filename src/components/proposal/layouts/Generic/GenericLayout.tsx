
import React from 'react';
import { ProposalLayoutProps } from '@/services/proposalLayoutService';
import { DreamHomeSection } from '@/components/proposal/DreamHomeSection';
import { RecommendedSolutionsSection } from '@/components/proposal/RecommendedSolutionsSection';
import { ModernInvestmentSection } from '@/components/proposal/ModernInvestmentSection';
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import TechnicalChatCard from '@/components/proposal/TechnicalChatCard';
import { TechnicalDocumentationSection } from '@/components/proposal/TechnicalDocumentationSection';

const GenericLayout: React.FC<ProposalLayoutProps> = ({
  proposal,
  proposalItems,
  selectedSolutions,
  canInteract,
  isExpired,
  onAcceptProposal,
  onRejectProposal,
  onSolutionSelect,
  onCloseDeal
}) => {
  return (
    <>
      {/* Dream Home Section */}
      <DreamHomeSection benefits={proposal.benefits} />

      {/* Detailed Proposal Items */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Detalhamento da Proposta
          </h2>
          <p className="text-lg text-gray-600">
            Confira todas as soluções e materiais inclusos no seu projeto personalizado
          </p>
        </div>
        
        <ProposalItemsTable items={proposalItems} />

        <div className="mt-8">
          <TechnicalChatCard />
        </div>
      </div>

      {/* Technical Documentation Section */}
      <TechnicalDocumentationSection />

      {/* Investment Section */}
      {canInteract && !isExpired && (
        <div id="investment-section" className="bg-gray-50">
          <ModernInvestmentSection
            totalPrice={proposal.finalPrice}
            discount={proposal.discount}
            validUntil={proposal.validUntil}
            onAccept={onAcceptProposal}
            onReject={onRejectProposal}
          />
        </div>
      )}

      {/* Recommended Solutions */}
      <RecommendedSolutionsSection 
        onSolutionSelect={onSolutionSelect}
        selectedSolutions={selectedSolutions}
        onCloseDeal={onCloseDeal}
      />
    </>
  );
};

export default GenericLayout;
