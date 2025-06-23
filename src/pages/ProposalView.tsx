
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
import { useProposalDetails } from '@/hooks/useProposalDetails';
import { useAuth } from '@/contexts/AuthContext';
import { useClientContext } from '@/hooks/useClientContext';
import { getMockRecommendedProducts, 
  getMockClientQuestions 
} from '@/data/mockProposalData';
import { getMockAIScore, getMockNextSteps } from '@/data/mockAIData';

const ProposalView = () => {
  const { id, linkAccess } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isClient, isVendor } = useClientContext();
  const showAI = searchParams.get('ai') === 'true';
  const [internalNotes, setInternalNotes] = useState<string>('');
  
  // Custom hooks - devem ser chamados SEMPRE, antes de qualquer return condicional
  const { interactions, addInteraction } = useProposalInteractions();
  const { features, toggleContractGeneration, toggleDeliveryControl } = useProposalFeatures(id || linkAccess || '1');
  
  // Use different hooks based on the route parameter
  const { proposal: proposalByData, proposalItems: itemsByData, dataSource, isLoading: isLoadingData, error: errorData } = useProposalData(id || '');
  const { data: proposalByDetails, isLoading: isLoadingDetails, error: errorDetails } = useProposalDetails(linkAccess || '');

  // Determine which data to use
  let proposal, proposalItems, isLoading, error;
  
  if (id) {
    // Using ID route - for client portal
    proposal = proposalByData;
    proposalItems = itemsByData;
    isLoading = isLoadingData;
    error = errorData;
  } else if (linkAccess) {
    // Using linkAccess route - for direct proposal access
    if (proposalByDetails) {
      proposal = {
        id: proposalByDetails.id,
        clientName: proposalByDetails.clients?.nome || 'Cliente',
        clientEmail: proposalByDetails.clients?.email || '',
        totalPrice: Number(proposalByDetails.valor_total),
        finalPrice: Number(proposalByDetails.valor_total),
        validUntil: proposalByDetails.validade,
        benefits: [],
        solutions: [],
        recommendedProducts: [],
        includeVideo: false,
        includeTechnicalDetails: false,
        videoUrl: '',
        technicalImages: [],
        createdBy: 'Vendedor'
      };
      proposalItems = proposalByDetails.proposal_items?.map(item => ({
        id: item.id,
        name: item.produto_nome,
        description: item.descricao_item || '',
        quantity: Number(item.quantidade),
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

  // Loading state - agora depois de todos os hooks
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

  // Dados adicionais (usar mock para compatibilidade)
  const recommendedProducts = getMockRecommendedProducts();
  const clientQuestions = getMockClientQuestions();
  const mockAIScore = getMockAIScore(proposal.id);
  const mockNextSteps = getMockNextSteps(proposal.id);

  // Check if current user is a vendor (not client) - using the new context
  const isVendorUser = isVendor || (user && !isClient);

  // Map proposal data to ProposalHeader format
  const headerData = {
    id: proposal.id,
    title: 'PROPOSTA COMERCIAL',
    subtitle: 'Solução personalizada para seu projeto',
    clientName: proposal.clientName,
    date: new Date().toLocaleDateString('pt-BR'),
    validUntil: proposal.validUntil,
    isExpired: new Date(proposal.validUntil) < new Date(),
    expirationDate: proposal.validUntil
  };

  // Fix dataSource type mapping
  const mappedDataSource: 'mock' | 'supabase' | 'pdf' = dataSource === 'database' ? 'supabase' : (dataSource || 'supabase');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProposalHeader proposal={headerData} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicador de fonte dos dados - apenas para usuários internos */}
        {isVendorUser && (
          <ProposalDataIndicator 
            dataSource={mappedDataSource}
            proposal={proposal}
            itemsCount={proposalItems.length}
          />
        )}

        {/* Urgency Card moved to top for better conversion */}
        <div className="mb-6">
          <UrgencyCard validUntil={proposal.validUntil} />
        </div>

        {/* Video Proposal - apenas se estiver habilitado na proposta */}
        {proposal.includeVideo && proposal.videoUrl && (
          <div className="mb-6">
            <VideoProposal
              videoUrl={proposal.videoUrl}
              vendorName="Carlos Vendedor"
              vendorTitle="Especialista em Soluções Residenciais"
              duration="2:35"
            />
          </div>
        )}

        {/* Feature Toggles - Only visible for vendors, representatives and admins */}
        {isVendorUser && ['admin', 'vendedor_interno', 'representante'].includes(user?.role || '') && (
          <div className="mb-6">
            <ProposalFeatureToggles
              proposalId={id || linkAccess || '1'}
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
