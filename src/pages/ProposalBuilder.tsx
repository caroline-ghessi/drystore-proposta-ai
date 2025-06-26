
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCreateProposal } from '@/hooks/useCreateProposal';
import { ProposalStepIndicator } from '@/components/proposal/ProposalStepIndicator';
import { ProposalBuilderProvider, useProposalBuilder } from '@/components/proposal/ProposalBuilderProvider';
import { ProposalBuilderHeader } from '@/components/proposal/ProposalBuilderHeader';
import { ProductGroupStep } from '@/components/proposal/ProductGroupStep';
import { ProposalDetailsStep } from '@/components/proposal/ProposalDetailsStep';
import { PRODUCT_GROUPS } from '@/types/productGroups';

const ProposalBuilderContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createProposal = useCreateProposal();
  
  const {
    currentStep,
    selectedProductGroup,
    clientData,
    items,
    observations,
    validityDays,
    finalTotal,
    discount,
    selectedPaymentConditions,
    includeVideo,
    videoUrl,
    includeTechnicalDetails,
    selectedSolutions,
    selectedRecommendedProducts,
    showDetailedValues,
    setErrors,
    errors
  } = useProposalBuilder();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedProductGroup) {
      newErrors.productGroup = 'Grupo de produtos é obrigatório';
    }

    if (!clientData.name.trim()) {
      newErrors.name = 'Nome do cliente é obrigatório';
    }

    if (!clientData.email.trim()) {
      newErrors.email = 'Email do cliente é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (items.length === 0) {
      newErrors.items = 'Pelo menos um item é obrigatório';
    }

    if (selectedPaymentConditions.length === 0) {
      newErrors.paymentConditions = 'Selecione ao menos uma condição de pagamento';
    }

    if (includeVideo && !videoUrl.trim()) {
      newErrors.videoUrl = 'URL do vídeo é obrigatória quando vídeo está habilitado';
    }

    if (includeTechnicalDetails && selectedSolutions.length === 0) {
      newErrors.solutions = 'Selecione ao menos uma solução quando detalhes técnicos estiver habilitado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await createProposal.mutateAsync({
        clientData,
        items,
        observations,
        validityDays,
        subtotal: finalTotal,
        discount,
        selectedPaymentConditions,
        includeVideo,
        videoUrl,
        includeTechnicalDetails,
        selectedSolutions,
        selectedRecommendedProducts,
        productGroup: selectedProductGroup!,
        showDetailedValues
      });

      toast({
        title: "Proposta criada!",
        description: "A proposta foi salva com sucesso.",
      });

      navigate(`/proposal-view/${result.proposal.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  };

  const getSelectedGroupInfo = () => {
    return PRODUCT_GROUPS.find(group => group.id === selectedProductGroup);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <ProposalBuilderHeader
          onSave={handleSave}
          isSaving={createProposal.isPending}
        />

        {/* Progress Indicator */}
        <ProposalStepIndicator currentStep={currentStep} />

        {/* Selected Product Group Badge */}
        {selectedProductGroup && (
          <div className="mb-6">
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-2xl">{getSelectedGroupInfo()?.icon}</span>
              <div>
                <span className="font-medium text-blue-900">
                  Grupo selecionado: {getSelectedGroupInfo()?.name}
                </span>
                <p className="text-sm text-blue-700">
                  {getSelectedGroupInfo()?.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'product-group' && <ProductGroupStep />}
        {currentStep === 'proposal-details' && <ProposalDetailsStep />}
      </div>
    </Layout>
  );
};

const ProposalBuilder = () => {
  return (
    <ProposalBuilderProvider>
      <ProposalBuilderContent />
    </ProposalBuilderProvider>
  );
};

export default ProposalBuilder;
