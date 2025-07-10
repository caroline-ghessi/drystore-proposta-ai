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
import RealERPUploader from '@/components/proposal/RealERPUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle } from 'lucide-react';
import React from 'react';

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

  const [showPDFUploader, setShowPDFUploader] = React.useState(false);

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

  const handlePDFUpload = (extractedData: any) => {
    console.log('📊 Dados extraídos do PDF:', extractedData);
    
    toast({
      title: "PDF processado com sucesso!",
      description: `${extractedData.items.length} itens extraídos. Redirecionando para criação da proposta...`
    });

    // Redirecionamento para criação de proposta com dados extraídos
    setTimeout(() => {
      navigate('/create-proposal', { 
        state: { 
          extractedData,
          productGroup: selectedProductGroup 
        } 
      });
    }, 2000);
  };

  const getSelectedGroupInfo = () => {
    return PRODUCT_GROUPS.find(group => group.id === selectedProductGroup);
  };

  // Se o grupo selecionado for Divisórias, mostrar opção de upload de PDF
  const shouldShowPDFUploader = selectedProductGroup === 'divisorias' || showPDFUploader;

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

        {/* PDF Upload Option for Divisórias */}
        {shouldShowPDFUploader && (
          <div className="mb-6">
            <Card className="border-drystore-blue/20 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center text-drystore-blue">
                  <FileText className="w-5 h-5 mr-2" />
                  Processamento Inteligente de PDF
                </CardTitle>
                <CardDescription>
                  Sistema modular com Adobe PDF Services + IA para extração automatizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Arquitetura Modular Implementada:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li><strong>pdf-text-extractor:</strong> Adobe PDF Services + Google Vision (fallback)</li>
                        <li><strong>ai-data-organizer:</strong> Grok AI para estruturação de dados</li>
                        <li><strong>proposal-formatter:</strong> Formatação para padrão Drystore</li>
                        <li><strong>data-validator:</strong> Validação com score de confiança</li>
                        <li><strong>data-saver:</strong> Salvamento no banco de dados</li>
                        <li><strong>pdf-processing-orchestrator:</strong> Orquestração completa</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <RealERPUploader 
                  onUploadComplete={handlePDFUpload} 
                  productGroup={selectedProductGroup}
                />
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPDFUploader(false)}
                    size="sm"
                  >
                    Criar Proposta Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Show PDF Upload button for other groups */}
        {!shouldShowPDFUploader && selectedProductGroup && (
          <div className="mb-6">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tem um PDF do ERP?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use nossa IA para extrair dados automaticamente
                  </p>
                  <Button 
                    onClick={() => setShowPDFUploader(true)}
                    variant="outline"
                    size="lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Processar PDF com IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step Content */}
        {!shouldShowPDFUploader && (
          <>
            {currentStep === 'product-group' && <ProductGroupStep />}
            {currentStep === 'proposal-details' && <ProposalDetailsStep />}
          </>
        )}
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