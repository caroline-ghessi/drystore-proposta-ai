
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Edit3, Calculator, Eye, Save, Trash2, User, Mail, Phone, Building, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateProposal } from '@/hooks/useProposals';
import PaymentConditionsSelector from '@/components/proposal/PaymentConditionsSelector';
import DiscountSection from '@/components/proposal/DiscountSection';
import VideoConfigSection from '@/components/proposal/VideoConfigSection';
import SolutionSelector from '@/components/proposal/SolutionSelector';
import RecommendedProductSelector from '@/components/proposal/RecommendedProductSelector';
import { ProductGroupSelector } from '@/components/proposal/ProductGroupSelector';
import { ProductGroup, PRODUCT_GROUPS } from '@/types/productGroups';

interface ProposalItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ClientData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

type ProposalStep = 'product-group' | 'proposal-details';

const ProposalBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createProposal = useCreateProposal();
  
  // Controle de etapas
  const [currentStep, setCurrentStep] = useState<ProposalStep>('product-group');
  const [selectedProductGroup, setSelectedProductGroup] = useState<ProductGroup | null>(null);
  
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  const [items, setItems] = useState<ProposalItem[]>([]);
  const [observations, setObservations] = useState('');
  const [validityDays, setValidityDays] = useState(15);
  const [discount, setDiscount] = useState(0);
  const [selectedPaymentConditions, setSelectedPaymentConditions] = useState<string[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Novas funcionalidades
  const [includeVideo, setIncludeVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [includeTechnicalDetails, setIncludeTechnicalDetails] = useState(false);
  const [selectedSolutions, setSelectedSolutions] = useState<Array<{ solutionId: string; value: number }>>([]);
  const [selectedRecommendedProducts, setSelectedRecommendedProducts] = useState<string[]>([]);

  // Carregar dados extraídos ao montar o componente
  useEffect(() => {
    const extractedDataStr = sessionStorage.getItem('proposalExtractedData');
    if (extractedDataStr) {
      const extractedData = JSON.parse(extractedDataStr);
      
      console.log('📋 Dados carregados no ProposalBuilder:', extractedData);
      
      // Mapear dados do cliente - agora com email
      setClientData({
        name: extractedData.client || '',
        email: extractedData.clientEmail || '',
        phone: '',
        company: extractedData.vendor || '',
        address: ''
      });

      // Mapear itens
      const mappedItems = extractedData.items.map((item: any, index: number) => ({
        id: String(index + 1),
        category: 'Material',
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total
      }));
      setItems(mappedItems);

      // Mapear observações
      if (extractedData.paymentTerms || extractedData.delivery) {
        const obs = [];
        if (extractedData.paymentTerms) obs.push(`Condições: ${extractedData.paymentTerms}`);
        if (extractedData.delivery) obs.push(`Entrega: ${extractedData.delivery}`);
        setObservations(obs.join('\n'));
      }

      // Se há dados carregados, pular para a segunda etapa
      if (extractedData.items && extractedData.items.length > 0) {
        setCurrentStep('proposal-details');
      }
    }
  }, []);

  const updateClientData = (field: keyof ClientData, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'product-group') {
      if (!selectedProductGroup) {
        toast({
          title: "Seleção obrigatória",
          description: "Por favor, selecione um grupo de produtos para continuar.",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep('proposal-details');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'proposal-details') {
      setCurrentStep('product-group');
    }
  };

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

    // Validações para novas funcionalidades
    if (includeVideo && !videoUrl.trim()) {
      newErrors.videoUrl = 'URL do vídeo é obrigatória quando vídeo está habilitado';
    }

    if (includeTechnicalDetails && selectedSolutions.length === 0) {
      newErrors.solutions = 'Selecione ao menos uma solução quando detalhes técnicos estiver habilitado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateItem = (itemId: string, field: string, value: number | string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addItem = () => {
    const newItem: ProposalItem = {
      id: String(Date.now()),
      category: 'Material',
      description: 'Novo item',
      quantity: 1,
      unit: 'un',
      unitPrice: 0,
      total: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount;

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
        productGroup: selectedProductGroup!
      });

      toast({
        title: "Proposta criada!",
        description: "A proposta foi salva com sucesso.",
      });

      // Navegar para a visualização completa da proposta usando proposal-view
      navigate(`/proposal-view/${result.proposal.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProposalItem[]>);

  const getSelectedGroupInfo = () => {
    return PRODUCT_GROUPS.find(group => group.id === selectedProductGroup);
  };

  const getProgressPercentage = () => {
    if (currentStep === 'product-group') return 33;
    if (currentStep === 'proposal-details') return 100;
    return 0;
  };

  const getStepTitle = () => {
    if (currentStep === 'product-group') return 'Grupo de Produtos';
    if (currentStep === 'proposal-details') return 'Detalhes da Proposta';
    return '';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => {
                if (currentStep === 'product-group') {
                  navigate('/proposal-upload-choice');
                } else {
                  handlePreviousStep();
                }
              }}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Construir Proposta</h1>
              <p className="text-gray-600 mt-1">
                {getStepTitle()} - Configure dados do cliente e condições comerciais
              </p>
            </div>
          </div>
          
          {currentStep === 'proposal-details' && (
            <div className="flex space-x-3">
              <Button 
                onClick={handleSave}
                disabled={createProposal.isPending}
                className="gradient-bg hover:opacity-90"
              >
                {createProposal.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando Proposta...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Finalizar Proposta
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo {currentStep === 'product-group' ? '1' : '2'} de 2</span>
            <span>{getProgressPercentage()}% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-drystore-blue h-2 rounded-full transition-all duration-300" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

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
        {currentStep === 'product-group' && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8">
              <ProductGroupSelector
                selectedGroup={selectedProductGroup}
                onGroupSelect={setSelectedProductGroup}
              />
              
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={handleNextStep}
                  disabled={!selectedProductGroup}
                  className="gradient-bg hover:opacity-90"
                  size="lg"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'proposal-details' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados do Cliente */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-drystore-blue" />
                    Dados do Cliente
                  </CardTitle>
                  <CardDescription>
                    Confirme e complete as informações do cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">
                        Nome *
                        {errors.name && (
                          <span className="text-red-500 text-sm ml-1">({errors.name})</span>
                        )}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="clientName"
                          value={clientData.name}
                          onChange={(e) => updateClientData('name', e.target.value)}
                          className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="Nome do cliente"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">
                        Email *
                        {errors.email && (
                          <span className="text-red-500 text-sm ml-1">({errors.email})</span>
                        )}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="clientEmail"
                          type="email"
                          value={clientData.email}
                          onChange={(e) => updateClientData('email', e.target.value)}
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="clientPhone"
                          value={clientData.phone}
                          onChange={(e) => updateClientData('phone', e.target.value)}
                          className="pl-10"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientCompany">Empresa</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="clientCompany"
                          value={clientData.company}
                          onChange={(e) => updateClientData('company', e.target.value)}
                          className="pl-10"
                          placeholder="Nome da empresa"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="clientAddress">Endereço</Label>
                    <Input
                      id="clientAddress"
                      value={clientData.address}
                      onChange={(e) => updateClientData('address', e.target.value)}
                      placeholder="Endereço completo"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* NOVA SEÇÃO: Vídeo Personalizado */}
              <VideoConfigSection
                includeVideo={includeVideo}
                onIncludeVideoChange={setIncludeVideo}
                videoUrl={videoUrl}
                onVideoUrlChange={setVideoUrl}
              />

              {errors.videoUrl && (
                <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{errors.videoUrl}</span>
                </div>
              )}

              {/* NOVA SEÇÃO: Produtos Recomendados */}
              <RecommendedProductSelector
                selectedProducts={selectedRecommendedProducts}
                onSelectedProductsChange={setSelectedRecommendedProducts}
              />

              {/* NOVA SEÇÃO: Soluções Técnicas */}
              <SolutionSelector
                includeTechnicalDetails={includeTechnicalDetails}
                onIncludeTechnicalDetailsChange={setIncludeTechnicalDetails}
                selectedSolutions={selectedSolutions}
                onSelectedSolutionsChange={setSelectedSolutions}
              />

              {errors.solutions && (
                <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{errors.solutions}</span>
                </div>
              )}

              {/* Mensagem de erro para itens */}
              {errors.items && (
                <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm">{errors.items}</span>
                </div>
              )}

              {/* Items List */}
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <Card key={category} className="border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Edit3 className="w-5 h-5 mr-2 text-drystore-blue" />
                        {category}
                      </CardTitle>
                      <Badge variant="secondary">
                        {categoryItems.length} item(s)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="grid md:grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg">
                          <div className="md:col-span-4">
                            <Label className="text-xs text-gray-500">Descrição</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label className="text-xs text-gray-500">Qtd</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="md:col-span-1">
                            <Label className="text-xs text-gray-500">Un</Label>
                            <Input
                              value={item.unit}
                              onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label className="text-xs text-gray-500">Preço Un.</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label className="text-xs text-gray-500">Total</Label>
                            <div className="text-sm font-medium p-2 bg-white rounded border">
                              R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          
                          <div className="md:col-span-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                variant="outline" 
                onClick={addItem}
                className="w-full border-dashed border-2 h-12"
              >
                + Adicionar Novo Item
              </Button>

              {/* Seção de Desconto */}
              <DiscountSection
                discount={discount}
                onDiscountChange={setDiscount}
                subtotal={subtotal}
              />

              {/* Observações */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Observações e Condições</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={4}
                    placeholder="Condições comerciais, prazos, garantias..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Resumo Financeiro */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Resumo Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Desconto ({discount}%):</span>
                          <span>- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-drystore-blue">
                          R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="validity" className="text-sm">Validade (dias):</Label>
                      <Input
                        id="validity"
                        type="number"
                        value={validityDays}
                        onChange={(e) => setValidityDays(parseInt(e.target.value) || 15)}
                        className="w-20 text-sm"
                        min="1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Seletor de Condições de Pagamento */}
                <PaymentConditionsSelector
                  selectedConditions={selectedPaymentConditions}
                  onConditionsChange={setSelectedPaymentConditions}
                  subtotal={finalTotal}
                />

                {errors.paymentConditions && (
                  <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 text-sm">{errors.paymentConditions}</span>
                  </div>
                )}

                <Button 
                  onClick={handleSave}
                  className="w-full gradient-bg hover:opacity-90"
                  size="lg"
                  disabled={createProposal.isPending}
                >
                  {createProposal.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      Finalizar Proposta
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProposalBuilder;
