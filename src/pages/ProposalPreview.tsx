import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Edit3, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FullscreenPreview from '@/components/proposal/FullscreenPreview';

interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ExtractedData {
  id?: string;
  client?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  vendor?: string;
  timestamp?: number;
  source?: string;
}

const ProposalPreview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [clientInfo, setClientInfo] = useState<{
    name: string;
    project: string;
    paymentTerms?: string;
    delivery?: string;
  }>({
    name: 'Cliente',
    project: 'Projeto',
  });
  const [proposalId, setProposalId] = useState<string>('1');

  // Carregar dados extraídos do PDF na inicialização
  useEffect(() => {
    console.log('🔍 ProposalPreview: Carregando dados...');
    
    const savedData = sessionStorage.getItem('proposalExtractedData');
    
    if (savedData) {
      try {
        const extractedData: ExtractedData = JSON.parse(savedData);
        console.log('📋 ProposalPreview: Dados encontrados:', extractedData);
        
        if (extractedData.items && extractedData.items.length > 0) {
          // Gerar um ID único para esta proposta se não existir
          const currentProposalId = extractedData.id || `pdf-${Date.now()}`;
          setProposalId(currentProposalId);
          
          // Atualizar dados extraídos com o ID
          const updatedData = { ...extractedData, id: currentProposalId };
          sessionStorage.setItem('proposalExtractedData', JSON.stringify(updatedData));
          
          // Converter os dados extraídos para o formato da interface
          const convertedItems: ProposalItem[] = extractedData.items.map((item, index) => ({
            id: String(index + 1),
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total
          }));
          
          console.log('✅ ProposalPreview: Itens convertidos:', convertedItems);
          setItems(convertedItems);
          
          // Atualizar informações do cliente
          setClientInfo({
            name: extractedData.client || 'Cliente Identificado',
            project: 'Proposta Extraída do PDF',
            paymentTerms: extractedData.paymentTerms,
            delivery: extractedData.delivery
          });
          
          console.log('👤 ProposalPreview: Cliente e dados atualizados');
          
        } else {
          console.log('⚠️ ProposalPreview: Dados inválidos, usando fallback');
          loadFallbackData();
        }
      } catch (error) {
        console.error('❌ ProposalPreview: Erro ao carregar dados:', error);
        loadFallbackData();
      }
    } else {
      console.log('📝 ProposalPreview: Usando dados padrão');
      loadFallbackData();
    }
  }, []);

  const loadFallbackData = () => {
    console.log('🔄 ProposalPreview: Carregando dados de fallback...');
    setItems([
      {
        id: '1',
        description: 'Telhas Shingle Premium - Cor Cinza Escuro',
        quantity: 180,
        unit: 'm²',
        unitPrice: 45.00,
        total: 8100.00
      },
      {
        id: '2',
        description: 'Estrutura de Madeira Tratada',
        quantity: 180,
        unit: 'm²',
        unitPrice: 25.00,
        total: 4500.00
      },
      {
        id: '3',
        description: 'Drywall 12,5mm - Placas Standard',
        quantity: 120,
        unit: 'placas',
        unitPrice: 62.50,
        total: 7500.00
      },
      {
        id: '4',
        description: 'Perfis Metálicos para Drywall',
        quantity: 1,
        unit: 'vb',
        unitPrice: 2800.00,
        total: 2800.00
      },
      {
        id: '5',
        description: 'Painéis Metálicos para Fachada',
        quantity: 95,
        unit: 'm²',
        unitPrice: 85.00,
        total: 8075.00
      }
    ]);
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

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSave = () => {
    // Atualizar os dados salvos com as modificações
    const updatedData = {
      id: proposalId,
      client: clientInfo.name,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      subtotal,
      total: subtotal,
      paymentTerms: clientInfo.paymentTerms,
      delivery: clientInfo.delivery,
      timestamp: Date.now(),
      source: 'proposal_preview_edited'
    };
    
    sessionStorage.setItem('proposalExtractedData', JSON.stringify(updatedData));
    
    console.log('💾 ProposalPreview: Dados salvos com ID:', proposalId);
    
    toast({
      title: "Dados salvos!",
      description: "As alterações foram aplicadas à proposta.",
    });
  };

  const handleNext = () => {
    // Salvar antes de navegar
    handleSave();
    
    console.log('🎯 ProposalPreview: Navegando para proposta final com ID:', proposalId);
    
    // Navegar para a proposta final usando o ID correto
    navigate(`/proposal/${proposalId}`);
  };

  const proposalContent = (
    <div className="space-y-6">
      <div className="text-center border-b pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Proposta Comercial</h1>
        <p className="text-xl text-gray-600">PROP-2024-001 - {clientInfo.name}</p>
        <p className="text-gray-500">{clientInfo.project}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.description}</h3>
              <p className="text-sm text-gray-500">{item.quantity} {item.unit} × R$ {item.unitPrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold text-gray-900">
                R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between text-2xl font-bold text-blue-600">
          <span>Total da Proposta:</span>
          <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-in">
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
              <h1 className="text-3xl font-bold text-gray-900">Prévia da Proposta</h1>
              <p className="text-gray-600 mt-1">Revise e ajuste os dados antes de finalizar</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <FullscreenPreview>
              {proposalContent}
            </FullscreenPreview>
            
            <Button variant="outline" onClick={handleSave}>
              <Edit3 className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Eye className="w-4 h-4 mr-2" />
              Ver Proposta Final
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-blue-600" />
                  Itens da Proposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg">
                      <div className="col-span-5">
                        <Label className="text-xs text-gray-500">Descrição</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-500">Qtd</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs text-gray-500">Un</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-500">Preço Un.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label className="text-xs text-gray-500">Total</Label>
                        <div className="text-sm font-medium p-2 bg-white rounded border">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleNext}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    Avançar para Proposta Final
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProposalPreview;
