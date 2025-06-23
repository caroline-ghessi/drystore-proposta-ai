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

interface PaymentCondition {
  label: string;
  installments: number;
  discount: number;
  interest: number;
}

const ProposalBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createProposal = useCreateProposal();
  
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Condições de pagamento padrão
  const paymentConditions: PaymentCondition[] = [
    { label: 'À Vista', installments: 1, discount: 5, interest: 0 },
    { label: 'Até 6x', installments: 6, discount: 0, interest: 0 },
    { label: 'Até 12x', installments: 12, discount: 0, interest: 2.5 },
    { label: 'Até 18x', installments: 18, discount: 0, interest: 4.0 }
  ];

  // Carregar dados extraídos ao montar o componente
  useEffect(() => {
    const extractedDataStr = sessionStorage.getItem('proposalExtractedData');
    if (extractedDataStr) {
      const extractedData = JSON.parse(extractedDataStr);
      
      // Mapear dados do cliente
      setClientData({
        name: extractedData.client || '',
        email: '',
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
    }
  }, []);

  const updateClientData = (field: keyof ClientData, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

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

  const calculatePaymentValue = (condition: PaymentCondition) => {
    let finalValue = subtotal;
    
    if (condition.discount > 0) {
      finalValue = subtotal * (1 - condition.discount / 100);
    } else if (condition.interest > 0) {
      finalValue = subtotal * (1 + condition.interest / 100);
    }
    
    return finalValue;
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
        subtotal
      });

      toast({
        title: "Proposta criada!",
        description: "A proposta foi salva com sucesso.",
      });

      // Redirecionar para visualização da proposta
      navigate(`/proposal/${result.proposal.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  };

  const handlePreview = () => {
    if (!validateForm()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios antes de visualizar.",
        variant: "destructive"
      });
      return;
    }

    // Preparar dados para preview
    const proposalData = {
      clientData,
      items,
      observations,
      validityDays,
      subtotal,
      paymentConditions: paymentConditions.map(condition => ({
        ...condition,
        totalValue: calculatePaymentValue(condition),
        installmentValue: calculatePaymentValue(condition) / condition.installments
      }))
    };

    sessionStorage.setItem('proposalData', JSON.stringify(proposalData));
    navigate('/proposal-preview');
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProposalItem[]>);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/proposal-upload-choice')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Construir Proposta</h1>
              <p className="text-gray-600 mt-1">
                Ajuste os dados e configure as condições comerciais
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={createProposal.isPending}
            >
              {createProposal.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Proposta
                </>
              )}
            </Button>
            <Button onClick={handlePreview} className="gradient-bg hover:opacity-90">
              <Eye className="w-4 h-4 mr-2" />
              Visualizar Proposta
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 3 de 4</span>
            <span>75% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
          </div>
        </div>

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

          {/* Sidebar - Resumo e Condições de Pagamento */}
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
                  <div className="flex justify-between text-lg font-bold border-t pt-4">
                    <span>Subtotal:</span>
                    <span className="text-drystore-blue">
                      R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
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

              {/* Condições de Pagamento */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Condições de Pagamento</CardTitle>
                  <CardDescription>
                    Calculadora automática de parcelas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentConditions.map((condition, index) => {
                      const totalValue = calculatePaymentValue(condition);
                      const installmentValue = totalValue / condition.installments;
                      
                      return (
                        <div key={index} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{condition.label}</span>
                            {condition.discount > 0 && (
                              <Badge variant="secondary" className="text-green-600 bg-green-100">
                                -{condition.discount}%
                              </Badge>
                            )}
                            {condition.interest > 0 && (
                              <Badge variant="secondary" className="text-orange-600 bg-orange-100">
                                +{condition.interest}%
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span className="font-medium">
                                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            
                            {condition.installments > 1 && (
                              <div className="flex justify-between">
                                <span>{condition.installments}x de:</span>
                                <span className="font-medium">
                                  R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handlePreview}
                className="w-full gradient-bg hover:opacity-90"
                size="lg"
              >
                Finalizar Proposta
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProposalBuilder;
