
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import RecommendedProducts from '@/components/proposal/RecommendedProducts';
import { ProposalBenefits } from '@/components/proposal/ProposalBenefits';
import { TechnicalDetails } from '@/components/proposal/TechnicalDetails';
import InteractionLog from '@/components/proposal/InteractionLog';
import InternalNotes from '@/components/proposal/InternalNotes';
import ClientQuestionForm from '@/components/proposal/ClientQuestionForm';
import { StatusMessage } from '@/components/proposal/StatusMessage';
import TechnicalChatCard from '@/components/proposal/TechnicalChatCard';
import { getMockRecommendedProducts } from '@/data/mockProposalData';

interface ProposalMainContentProps {
  proposalItems: any[];
  proposal: any;
  internalNotes: string;
  setInternalNotes: (notes: string) => void;
  interactions: any[];
  addInteraction: (interaction: any) => void;
  onQuestionSubmit: (question: string) => void;
  status: 'pending' | 'accepted' | 'rejected' | 'aguardando_pagamento';
}

const ProposalMainContent = ({
  proposalItems,
  proposal,
  internalNotes,
  setInternalNotes,
  interactions,
  addInteraction,
  onQuestionSubmit,
  status
}: ProposalMainContentProps) => {
  // Usar produtos recomendados da proposta ou fallback para mock
  const recommendedProducts = proposal.recommendedProducts?.length > 0 
    ? proposal.recommendedProducts 
    : getMockRecommendedProducts();

  return (
    <div className="lg:col-span-2 space-y-6">
      <ProposalItemsTable items={proposalItems} totalPrice={proposal.finalPrice} />

      {/* Produtos Recomendados - apenas se houver produtos selecionados */}
      {recommendedProducts.length > 0 && (
        <RecommendedProducts products={recommendedProducts} />
      )}

      <ProposalBenefits benefits={proposal.benefits} />
      
      {/* Detalhes Técnicos - apenas se estiver habilitado na proposta */}
      {proposal.includeTechnicalDetails && proposal.solutions?.length > 0 && (
        <TechnicalDetails 
          technicalDetails={proposal.solutions.map(s => s.description).filter(Boolean)}
          technicalImages={proposal.technicalImages}
          solutions={proposal.solutions}
        />
      )}

      <TechnicalChatCard />

      <InternalNotes
        proposalId={proposal.id!}
        notes={internalNotes}
        onNotesChange={setInternalNotes}
      />

      <InteractionLog
        proposalId={proposal.id!}
        interactions={interactions}
        onAddInteraction={addInteraction}
        proposalCreatedBy={proposal.createdBy}
      />

      <ClientQuestionForm onQuestionSubmit={onQuestionSubmit} />

      <StatusMessage status={status} />
    </div>
  );
};

export default ProposalMainContent;
