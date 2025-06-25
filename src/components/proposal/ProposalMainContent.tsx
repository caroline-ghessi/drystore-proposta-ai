
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
  console.log('📋 ProposalMainContent: Renderizando com proposta:', proposal?.id);
  console.log('📋 ProposalMainContent: Produtos recomendados da proposta:', proposal?.recommendedProducts);

  // Usar produtos recomendados da proposta ou fallback para mock apenas se houver produtos
  let recommendedProducts = [];
  
  if (proposal?.recommendedProducts && proposal.recommendedProducts.length > 0) {
    console.log('📋 ProposalMainContent: Usando produtos recomendados da proposta');
    recommendedProducts = proposal.recommendedProducts;
  } else {
    console.log('📋 ProposalMainContent: Nenhum produto recomendado na proposta');
    // Não usar mock por padrão - só mostrar se explicitamente configurado
  }

  return (
    <div className="lg:col-span-2 space-y-6">
      <ProposalItemsTable items={proposalItems} />

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
