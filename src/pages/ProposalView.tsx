
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ModernProposalHeader } from '@/components/proposal/ModernProposalHeader';
import { ModernHeroSection } from '@/components/proposal/ModernHeroSection';
import { DreamHomeSection } from '@/components/proposal/DreamHomeSection';
import { WhyChooseSection } from '@/components/proposal/WhyChooseSection';
import { OrderBumpSection } from '@/components/proposal/OrderBumpSection';
import { RecommendedSolutionsSection } from '@/components/proposal/RecommendedSolutionsSection';
import { ModernInvestmentSection } from '@/components/proposal/ModernInvestmentSection';
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import RecommendedProducts from '@/components/proposal/RecommendedProducts';
import { TechnicalDetails } from '@/components/proposal/TechnicalDetails';
import InteractionLog from '@/components/proposal/InteractionLog';
import InternalNotes from '@/components/proposal/InternalNotes';
import ClientQuestionForm from '@/components/proposal/ClientQuestionForm';
import TechnicalChatCard from '@/components/proposal/TechnicalChatCard';
import ProposalLoadingState from '@/components/proposal/ProposalLoadingState';
import { useProposalInteractions } from '@/hooks/useProposalInteractions';
import { useProposalStatus } from '@/hooks/useProposalStatus';
import { useProposalData } from '@/hooks/useProposalData';
import { useProposalDetails } from '@/hooks/useProposalDetails';
import { useAuth } from '@/contexts/AuthContext';
import { useClientContext } from '@/hooks/useClientContext';

const ProposalView = () => {
  const { id, linkAccess } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isClient, isVendor } = useClientContext();
  const showAI = searchParams.get('ai') === 'true';
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [orderBumpTotal, setOrderBumpTotal] = useState(0);
  
  // Custom hooks - devem ser chamados SEMPRE, antes de qualquer return condicional
  const { interactions, addInteraction } = useProposalInteractions();
  
  // Use different hooks based on the route parameter
  const { proposal: proposalByData, proposalItems: itemsByData, dataSource, isLoading: isLoadingData, error: errorData } = useProposalData(id || '');
  const { data: proposalByDetails, isLoading: isLoadingDetails, error: errorDetails } = useProposalDetails(linkAccess || '');

  // Determine which data to use
  let proposal, proposalItems, isLoading, error;
  
  if (id) {
    proposal = proposalByData;
    proposalItems = itemsByData;
    isLoading = isLoadingData;
    error = errorData;
  } else if (linkAccess) {
    if (proposalByDetails) {
      proposal = {
        id: proposalByDetails.id,
        clientName: proposalByDetails.clients?.nome || 'Cliente',
        clientEmail: proposalByDetails.clients?.email || '',
        totalPrice: Number(proposalByDetails.valor_total),
        finalPrice: Number(proposalByDetails.valor_total) + orderBumpTotal,
        validUntil: new Date(proposalByDetails.validade).toLocaleDateString('pt-BR'),
        benefits: [
          'Garantia de 5 anos para estruturas metálicas',
          'Instalação profissional inclusa',
          'Suporte técnico especializado 24/7',
          'Materiais certificados e de alta qualidade',
          'Consultoria personalizada gratuita',
          'Manutenção preventiva no primeiro ano'
        ],
        solutions: [],
        recommendedProducts: [],
        includeVideo: false,
        includeTechnicalDetails: false,
        videoUrl: '',
        technicalImages: [],
        createdBy: 'Vendedor',
        discount: proposalByDetails.desconto_percentual || 0
      };
      proposalItems = proposalByDetails.proposal_items?.map(item => ({
        id: item.id,
        description: item.produto_nome,
        quantity: Number(item.quantidade),
        unit: 'un',
        unitPrice: Number(item.preco_unit),
        totalPrice: Number(item.preco_total)
      })) || [];
    } else {
      proposal = null;
      proposalItems = [];
    }
    isLoading = isLoadingDetails;
    error = errorDetails;
  } else {
    proposal = null;
    proposalItems = [];
    isLoading = false;
    error = new Error('ID ou link de acesso obrigatório');
  }

  // Custom hooks que dependem de proposal - também devem ser chamados sempre
  const { status, handleAccept, handleReject, handleQuestion } = useProposalStatus(
    proposal?.clientName || 'Cliente', 
    addInteraction
  );

  const handleOrderBumpChange = (selectedItems: any[], totalValue: number) => {
    setOrderBumpTotal(totalValue);
    if (proposal) {
      proposal.finalPrice = proposal.totalPrice + totalValue;
    }
  };

  const handleSolutionSelect = (solution: any) => {
    console.log('Solução selecionada:', solution);
  };

  // Loading state
  if (isLoading) {
    return <ProposalLoadingState />;
  }

  // Error state
  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposta não encontrada</h1>
          <p className="text-gray-600">A proposta solicitada não foi encontrada ou não está disponível.</p>
        </div>
      </div>
    );
  }

  // Check if current user is a vendor (not client)
  const isVendorUser = isVendor || (user && !isClient);
  const proposalNumber = `PROP-${proposal.id.slice(0, 8).toUpperCase()}`;
  const isExpired = new Date(proposal.validUntil) < new Date();

  const scrollToInvestment = () => {
    const element = document.getElementById('investment-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <ModernProposalHeader
        clientName={proposal.clientName}
        proposalNumber={proposalNumber}
        validUntil={proposal.validUntil}
        isExpired={isExpired}
      />

      {/* Hero Section */}
      <ModernHeroSection
        clientName={proposal.clientName}
        onGetStarted={scrollToInvestment}
      />

      {/* Dream Home Section */}
      <DreamHomeSection benefits={proposal.benefits} />

      {/* Why Choose Section */}
      <WhyChooseSection />

      {/* Detailed Proposal Items */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Detalhamento da Proposta
          </h2>
          <p className="text-lg text-gray-600">
            Confira todos os itens inclusos na sua solução personalizada
          </p>
        </div>
        
        <ProposalItemsTable items={proposalItems} totalPrice={proposal.totalPrice} />

        {/* Recommended Products */}
        {proposal.recommendedProducts && proposal.recommendedProducts.length > 0 && (
          <div className="mt-12">
            <RecommendedProducts products={proposal.recommendedProducts} />
          </div>
        )}

        {/* Technical Details */}
        {proposal.includeTechnicalDetails && proposal.solutions?.length > 0 && (
          <div className="mt-12">
            <TechnicalDetails 
              technicalDetails={proposal.solutions.map(s => s.description).filter(Boolean)}
              technicalImages={proposal.technicalImages}
              solutions={proposal.solutions}
            />
          </div>
        )}
      </div>

      {/* Order Bump Section */}
      <OrderBumpSection onItemsChange={handleOrderBumpChange} />

      {/* Recommended Solutions */}
      <RecommendedSolutionsSection onSolutionSelect={handleSolutionSelect} />

      {/* Investment Section */}
      <div id="investment-section" className="bg-gray-50">
        <ModernInvestmentSection
          totalPrice={proposal.finalPrice}
          discount={proposal.discount}
          validUntil={proposal.validUntil}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </div>

      {/* Technical Chat */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <TechnicalChatCard />
      </div>

      {/* Internal Tools - Only for vendors */}
      {isVendorUser && (
        <div className="bg-gray-50 border-t">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Ferramentas Internas</h3>
            <div className="grid lg:grid-cols-2 gap-8">
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
            </div>
          </div>
        </div>
      )}

      {/* Client Question Form */}
      {!isVendorUser && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ClientQuestionForm onQuestionSubmit={handleQuestion} />
        </div>
      )}
    </div>
  );
};

export default ProposalView;
