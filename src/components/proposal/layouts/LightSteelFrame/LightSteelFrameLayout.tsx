
import React from 'react';
import { ProposalLayoutProps } from '@/services/proposalLayoutService';
import { LightSteelFrameHero } from './LightSteelFrameHero';
import { SustainabilitySection } from './SustainabilitySection';
import { CasesGallery } from './CasesGallery';
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import TechnicalChatCard from '@/components/proposal/TechnicalChatCard';
import { TechnicalDocumentationSection } from '@/components/proposal/TechnicalDocumentationSection';
import { ModernInvestmentSection } from '@/components/proposal/ModernInvestmentSection';
import { RecommendedSolutionsSection } from '@/components/proposal/RecommendedSolutionsSection';

const LightSteelFrameLayout: React.FC<ProposalLayoutProps> = ({
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
      {/* Hero Section Específico para Light Steel Frame */}
      <LightSteelFrameHero benefits={proposal.benefits} />

      {/* Seção de Sustentabilidade */}
      <SustainabilitySection />

      {/* Cases de Obras em Light Steel Frame */}
      <CasesGallery />

      {/* Detalhamento da Proposta */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Especificação Técnica do Projeto
          </h2>
          <p className="text-lg text-gray-600">
            Sistema construtivo completo em Light Steel Frame personalizado para seu projeto
          </p>
        </div>
        
        <ProposalItemsTable items={proposalItems} />

        <div className="mt-8">
          <TechnicalChatCard />
        </div>
      </div>

      {/* Documentação Técnica */}
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

export default LightSteelFrameLayout;
