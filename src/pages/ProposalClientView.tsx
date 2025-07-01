
import { useParams } from 'react-router-dom';
import { useClientProposal } from '@/hooks/useClientProposals';
import { ProposalClientHeader } from '@/components/proposal/ProposalClientHeader';
import { DynamicProposalContent } from '@/components/proposal/DynamicProposalContent';
import { ProposalExpiredMessage } from '@/components/proposal/ProposalExpiredMessage';
import { ProposalObservations } from '@/components/proposal/ProposalObservations';
import ProposalLoadingState from '@/components/proposal/ProposalLoadingState';
import { isProposalExpired } from '@/utils/clientUtils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ProductGroup } from '@/types/productGroups';
import { useNavigate } from 'react-router-dom';

const ProposalClientView = () => {
  const { linkAccess } = useParams<{ linkAccess: string }>();
  const { data: proposalData, isLoading, error } = useClientProposal(linkAccess || '');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSolutions, setSelectedSolutions] = useState<Array<{ id: string; price: number }>>([]);

  const handleAcceptProposal = () => {
    // Redirecionar para a nova página de agradecimento e ofertas
    navigate(`/proposal-accepted/${proposalData?.id}`);
  };

  const handleRejectProposal = () => {
    toast({
      title: "Proposta rejeitada",
      description: "Agradecemos sua consideração.",
      variant: "destructive"
    });
  };

  const handleSolutionSelect = (solution: any) => {
    const isAlreadySelected = selectedSolutions.find(s => s.id === solution.id);
    
    if (isAlreadySelected) {
      setSelectedSolutions(prev => prev.filter(s => s.id !== solution.id));
      toast({
        title: "Solução removida",
        description: `${solution.name} foi removida da proposta`,
      });
    } else {
      setSelectedSolutions(prev => [...prev, { id: solution.id, price: solution.price }]);
      toast({
        title: "Solução adicionada!",
        description: `${solution.name} foi adicionada à sua proposta`,
      });
    }
  };

  const handleCloseDeal = () => {
    const investmentSection = document.getElementById('investment-section');
    if (investmentSection) {
      investmentSection.scrollIntoView({ behavior: 'smooth' });
    }
    handleAcceptProposal();
  };

  if (isLoading) {
    return <ProposalLoadingState />;
  }

  if (error || !proposalData) {
    return (
      <ProposalClientHeader
        clientName=""
        proposalNumber=""
        validUntil=""
        isExpired={false}
        isLoading={false}
        error={error}
      />
    );
  }

  const isExpired = isProposalExpired(proposalData.validade);
  const canInteract = proposalData.status === 'sent' || proposalData.status === 'viewed';
  const proposalNumber = `PROP-${proposalData.id.slice(0, 8).toUpperCase()}`;

  // Calculate additional value from selected solutions
  const additionalValue = selectedSolutions.reduce((sum, solution) => sum + solution.price, 0);

  // Get product group from proposal data
  const productGroup = (proposalData.product_group as ProductGroup) || null;

  // Map proposal data
  const proposal = {
    id: proposalData.id,
    clientName: proposalData.clients.nome,
    totalPrice: Number(proposalData.valor_total),
    finalPrice: Number(proposalData.valor_total) + additionalValue,
    validUntil: new Date(proposalData.validade).toLocaleDateString('pt-BR'),
    discount: proposalData.desconto_percentual || 0,
    benefits: [
      'Garantia de 5 anos para estruturas metálicas',
      'Instalação profissional inclusa',
      'Suporte técnico especializado 24/7',
      'Materiais certificados e de alta qualidade',
      'Consultoria personalizada gratuita',
      'Manutenção preventiva no primeiro ano'
    ]
  };

  // Map proposal items to new structure
  const proposalItems = proposalData.proposal_items.map(item => ({
    description: item.produto_nome,
    solution: 'Sistema de Armazenamento Inteligente'
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <ProposalClientHeader
        clientName={proposal.clientName}
        proposalNumber={proposalNumber}
        validUntil={proposal.validUntil}
        isExpired={isExpired}
      />

      {/* Main Content */}
      <DynamicProposalContent
        productGroup={productGroup}
        proposal={proposal}
        proposalItems={proposalItems}
        selectedSolutions={selectedSolutions}
        canInteract={canInteract}
        isExpired={isExpired}
        onAcceptProposal={handleAcceptProposal}
        onRejectProposal={handleRejectProposal}
        onSolutionSelect={handleSolutionSelect}
        onCloseDeal={handleCloseDeal}
      />

      {/* Expired Message */}
      {isExpired && (
        <ProposalExpiredMessage validUntil={proposal.validUntil} />
      )}

      {/* Observations */}
      <ProposalObservations observacoes={proposalData.observacoes} />
    </div>
  );
};

export default ProposalClientView;
