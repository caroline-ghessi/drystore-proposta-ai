
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProposalViewHeader } from '@/components/proposal/ProposalViewHeader';
import { DynamicProposalContent } from '@/components/proposal/DynamicProposalContent';
import { ProposalVendorTools } from '@/components/proposal/ProposalVendorTools';
import { ProposalClientForm } from '@/components/proposal/ProposalClientForm';
import { useProposalInteractions } from '@/hooks/useProposalInteractions';
import { useProposalStatus } from '@/hooks/useProposalStatus';
import { useProposalData } from '@/hooks/useProposalData';
import { useProposalDetails } from '@/hooks/useProposalDetails';
import { useAuth } from '@/contexts/AuthContext';
import { useClientContext } from '@/hooks/useClientContext';
import { ProductGroup } from '@/types/productGroups';

const ProposalView = () => {
  const { id, linkAccess } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isClient, isVendor } = useClientContext();
  const showAI = searchParams.get('ai') === 'true';
  const [selectedSolutions, setSelectedSolutions] = useState<Array<{ id: string; price: number }>>([]);
  
  // Custom hooks - devem ser chamados SEMPRE, antes de qualquer return condicional
  const { interactions, addInteraction } = useProposalInteractions();
  
  // Use different hooks based on the route parameter
  const { proposal: proposalByData, proposalItems: itemsByData, dataSource, isLoading: isLoadingData, error: errorData } = useProposalData(id || '');
  const { data: proposalByDetails, isLoading: isLoadingDetails, error: errorDetails } = useProposalDetails(linkAccess || '');

  // Calculate additional value from selected solutions
  const additionalValue = selectedSolutions.reduce((sum, solution) => sum + solution.price, 0);

  // Determine which data to use
  let proposal, proposalItems, isLoading, error, productGroup: ProductGroup | null = null;
  
  if (id) {
    proposal = proposalByData;
    proposalItems = itemsByData;
    isLoading = isLoadingData;
    error = errorData;
    // Get product group from proposal data
    productGroup = proposalByData?.productGroup || null;
    console.log('🔍 ProposalView - Modo ID');
    console.log('📦 Product Group da proposta:', productGroup);
  } else if (linkAccess) {
    if (proposalByDetails) {
      proposal = {
        id: proposalByDetails.id,
        clientName: proposalByDetails.clients?.nome || 'Cliente',
        clientEmail: proposalByDetails.clients?.email || '',
        totalPrice: Number(proposalByDetails.valor_total),
        finalPrice: Number(proposalByDetails.valor_total) + additionalValue,
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
      // Map proposal items to new structure (removing price info)
      proposalItems = proposalByDetails.proposal_items?.map(item => ({
        description: item.produto_nome,
        solution: 'Sistema de Armazenamento Inteligente' // Default solution name
      })) || [];
      // Get product group from details
      productGroup = (proposalByDetails.product_group as ProductGroup) || null;
      console.log('🔍 ProposalView - Modo Link Access');
      console.log('📦 Product Group dos detalhes:', productGroup);
      console.log('📊 Raw product_group value:', proposalByDetails.product_group);
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

  // Update proposal finalPrice if it exists
  if (proposal) {
    proposal.finalPrice = proposal.totalPrice + additionalValue;
  }

  // Custom hooks que dependem de proposal - também devem ser chamados sempre
  const { status, handleAccept, handleReject, handleQuestion } = useProposalStatus(
    proposal?.clientName || 'Cliente', 
    addInteraction
  );

  const handleSolutionSelect = (solution: any) => {
    const isAlreadySelected = selectedSolutions.find(s => s.id === solution.id);
    
    if (isAlreadySelected) {
      // Remove solution
      setSelectedSolutions(prev => prev.filter(s => s.id !== solution.id));
    } else {
      // Add solution
      setSelectedSolutions(prev => [...prev, { id: solution.id, price: solution.price }]);
    }
  };

  const handleCloseDeal = () => {
    // Navigate to investment section and trigger accept
    const investmentSection = document.getElementById('investment-section');
    if (investmentSection) {
      investmentSection.scrollIntoView({ behavior: 'smooth' });
    }
    handleAccept();
  };

  // Check if current user is a vendor (not client)
  const isVendorUser = isVendor || (user && !isClient);
  const proposalNumber = `PROP-${proposal?.id?.slice(0, 8).toUpperCase() || 'UNKNOWN'}`;
  const isExpired = proposal ? new Date(proposal.validUntil) < new Date() : false;

  return (
    <div className="min-h-screen bg-white">
      <ProposalViewHeader
        isLoading={isLoading}
        error={error}
        proposal={proposal}
        clientName={proposal?.clientName || 'Cliente'}
        proposalNumber={proposalNumber}
        validUntil={proposal?.validUntil || ''}
        isExpired={isExpired}
      />

      {proposal && (
        <DynamicProposalContent
          productGroup={productGroup}
          proposal={proposal}
          proposalItems={proposalItems}
          selectedSolutions={selectedSolutions}
          canInteract={!isExpired}
          isExpired={isExpired}
          onAcceptProposal={handleAccept}
          onRejectProposal={handleReject}
          onSolutionSelect={handleSolutionSelect}
          onCloseDeal={handleCloseDeal}
        />
      )}

      {/* Internal Tools - Only for vendors */}
      {isVendorUser && proposal && (
        <ProposalVendorTools
          proposalId={proposal.id!}
          interactions={interactions}
          onAddInteraction={addInteraction}
          proposalCreatedBy={proposal.createdBy}
        />
      )}

      {/* Client Question Form */}
      {!isVendorUser && (
        <ProposalClientForm onQuestionSubmit={handleQuestion} />
      )}
    </div>
  );
};

export default ProposalView;
