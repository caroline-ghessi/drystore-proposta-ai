
import React from 'react';
import { ProposalLayoutProps } from '@/services/proposalLayoutService';
import { ShingleHeroSection } from './ShingleHeroSection';
import { OwensCorningSection } from './OwensCorningSection';
import { DurabilitySection } from './DurabilitySection';
import { ShingleSystemSection } from './ShingleSystemSection';
import { ShingleComparisonSection } from './ShingleComparisonSection';
import { ShingleAdvantagesSection } from './ShingleAdvantagesSection';
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import TechnicalChatCard from '@/components/proposal/TechnicalChatCard';
import { TechnicalDocumentationSection } from '@/components/proposal/TechnicalDocumentationSection';
import { ModernInvestmentSection } from '@/components/proposal/ModernInvestmentSection';
import { RecommendedSolutionsSection } from '@/components/proposal/RecommendedSolutionsSection';

const TelhaShingleLayout: React.FC<ProposalLayoutProps> = ({
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
      {/* Hero Section Específico para Telha Shingle */}
      <ShingleHeroSection benefits={proposal.benefits} />

      {/* Por que escolher telhas Owens Corning */}
      <OwensCorningSection />

      {/* Seção de Durabilidade e Proteção */}
      <DurabilitySection />

      {/* Sistema Completo de Cobertura */}
      <ShingleSystemSection />

      {/* Detalhamento da Proposta */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sistema de Cobertura Completo
          </h2>
          <p className="text-lg text-gray-600">
            Telhas Shingle e acessórios especificados para máxima proteção e beleza
          </p>
        </div>
        
        <ProposalItemsTable items={proposalItems} />

        <div className="mt-8">
          <TechnicalChatCard />
        </div>
      </div>

      {/* Comparativo Técnico */}
      <ShingleComparisonSection />

      {/* Principais Vantagens */}
      <ShingleAdvantagesSection />

      {/* Technical Documentation */}
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

export default TelhaShingleLayout;
