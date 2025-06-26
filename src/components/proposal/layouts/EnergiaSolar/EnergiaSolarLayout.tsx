
import React from 'react';
import { ProposalLayoutProps } from '@/services/proposalLayoutService';
import { ZeroBurocraciaSection } from './ZeroBurocraciaSection';
import { PersonalizedROISection } from './PersonalizedROISection';
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import { ModernInvestmentSection } from '@/components/proposal/ModernInvestmentSection';
import { RecommendedSolutionsSection } from '@/components/proposal/RecommendedSolutionsSection';

const EnergiaSolarLayout: React.FC<ProposalLayoutProps> = ({
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
  console.log('🔥 EnergiaSolarLayout CARREGADO - Layout específico de energia solar');
  console.log('📊 Dados da proposta:', { clientName: proposal.clientName, totalPrice: proposal.totalPrice });

  return (
    <>
      {/* Nova Seção de ROI Personalizada */}
      <PersonalizedROISection 
        clientName={proposal.clientName}
        proposalValue={proposal.totalPrice}
      />

      {/* Nova Seção Zero Burocracia */}
      <ZeroBurocraciaSection />

      {/* Detalhamento da Proposta */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sistema Fotovoltaico Completo
          </h2>
          <p className="text-lg text-gray-600">
            Painéis solares e equipamentos especificados para máxima geração de energia
          </p>
        </div>
        
        <ProposalItemsTable items={proposalItems} />
      </div>

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

export default EnergiaSolarLayout;
