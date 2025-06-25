
import { useParams } from 'react-router-dom';
import { useClientProposal } from '@/hooks/useClientProposals';
import { ModernProposalHeader } from '@/components/proposal/ModernProposalHeader';
import { ModernHeroSection } from '@/components/proposal/ModernHeroSection';
import { DreamHomeSection } from '@/components/proposal/DreamHomeSection';
import { WhyChooseSection } from '@/components/proposal/WhyChooseSection';
import { RecommendedSolutionsSection } from '@/components/proposal/RecommendedSolutionsSection';
import { ModernInvestmentSection } from '@/components/proposal/ModernInvestmentSection';
import ProposalItemsTable from '@/components/proposal/ProposalItemsTable';
import ProposalLoadingState from '@/components/proposal/ProposalLoadingState';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { getProposalStatusLabel, isProposalExpired } from '@/utils/clientUtils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const ProposalClientView = () => {
  const { linkAccess } = useParams<{ linkAccess: string }>();
  const { data: proposalData, isLoading, error } = useClientProposal(linkAccess || '');
  const { toast } = useToast();
  const [selectedSolutions, setSelectedSolutions] = useState<Array<{ id: string; price: number }>>([]);

  const handleAcceptProposal = () => {
    toast({
      title: "Proposta aceita!",
      description: "Nossa equipe entrará em contato para os próximos passos.",
    });
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
      // Remove solution
      setSelectedSolutions(prev => prev.filter(s => s.id !== solution.id));
      toast({
        title: "Solução removida",
        description: `${solution.name} foi removida da proposta`,
      });
    } else {
      // Add solution
      setSelectedSolutions(prev => [...prev, { id: solution.id, price: solution.price }]);
      toast({
        title: "Solução adicionada!",
        description: `${solution.name} foi adicionada à sua proposta`,
      });
    }
  };

  if (isLoading) {
    return <ProposalLoadingState />;
  }

  if (error || !proposalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposta não encontrada</h2>
            <p className="text-gray-600 text-center">
              O link de acesso é inválido ou a proposta não existe mais.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = isProposalExpired(proposalData.validade);
  const canInteract = proposalData.status === 'sent' || proposalData.status === 'viewed';
  const proposalNumber = `PROP-${proposalData.id.slice(0, 8).toUpperCase()}`;

  // Calculate additional value from selected solutions
  const additionalValue = selectedSolutions.reduce((sum, solution) => sum + solution.price, 0);

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

  const proposalItems = proposalData.proposal_items.map(item => ({
    id: item.id,
    description: item.produto_nome,
    quantity: Number(item.quantidade),
    unit: 'un',
    unitPrice: Number(item.preco_unit),
    totalPrice: Number(item.preco_total)
  }));

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
      </div>

      {/* Investment Section - Only if can interact */}
      {canInteract && !isExpired && (
        <div id="investment-section" className="bg-gray-50">
          <ModernInvestmentSection
            totalPrice={proposal.finalPrice}
            discount={proposal.discount}
            validUntil={proposal.validUntil}
            onAccept={handleAcceptProposal}
            onReject={handleRejectProposal}
          />
        </div>
      )}

      {/* Recommended Solutions - After Investment Section */}
      <RecommendedSolutionsSection 
        onSolutionSelect={handleSolutionSelect}
        selectedSolutions={selectedSolutions}
      />

      {/* Expired Message */}
      {isExpired && (
        <div className="bg-red-50 border-t border-red-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-red-800 mb-4">Proposta Expirada</h3>
                <p className="text-red-600 text-lg mb-6">
                  Esta proposta expirou em {proposal.validUntil}.
                </p>
                <p className="text-red-600">
                  Entre em contato conosco para uma nova proposta atualizada.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Observações */}
      {proposalData.observacoes && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Observações Importantes</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {proposalData.observacoes}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProposalClientView;
