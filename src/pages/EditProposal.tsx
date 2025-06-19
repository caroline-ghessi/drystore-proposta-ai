
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Edit3, Calculator, Eye, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditProposal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [proposal, setProposal] = useState({
    clientName: 'João Silva',
    projectName: 'Residência Moderna',
    items: [
      {
        id: '1',
        category: 'Sistema de Cobertura',
        description: 'Telhas termoacústicas galvanizadas',
        quantity: 180,
        unit: 'm²',
        unitPrice: 85.00,
        total: 15300.00
      },
      {
        id: '2',
        category: 'Sistema de Cobertura',
        description: 'Estrutura metálica para cobertura',
        quantity: 1,
        unit: 'vb',
        unitPrice: 18500.00,
        total: 18500.00
      },
      {
        id: '3',
        category: 'Sistema de Revestimento',
        description: 'Painéis de fachada metálica',
        quantity: 120,
        unit: 'm²',
        unitPrice: 95.00,
        total: 11400.00
      },
      {
        id: '4',
        category: 'Sistema de Drenagem',
        description: 'Calhas e condutores pluviais',
        quantity: 45,
        unit: 'm',
        unitPrice: 125.00,
        total: 5625.00
      }
    ],
    observations: 'Prazo de entrega: 30 dias após confirmação do pedido.\nGarantia: 5 anos para estrutura, 2 anos para telhas.\nValores válidos por 15 dias.',
    discount: 0,
    validityDays: 15
  });

  const updateItem = (itemId: string, field: string, value: number | string) => {
    setProposal(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalcular total se quantidade ou preço unitário mudaram
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (itemId: string) => {
    setProposal(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const addItem = () => {
    const newItem = {
      id: String(Date.now()),
      category: 'Novo Item',
      description: 'Descrição do novo item',
      quantity: 1,
      unit: 'un',
      unitPrice: 0,
      total: 0
    };
    
    setProposal(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const subtotal = proposal.items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * proposal.discount) / 100;
  const total = subtotal - discountAmount;

  const handleSave = () => {
    toast({
      title: "Proposta salva!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handlePreview = () => {
    navigate(`/proposal/${id}`);
  };

  const groupedItems = proposal.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof proposal.items>);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/select-systems')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Proposta</h1>
              <p className="text-gray-600 mt-1">
                {proposal.clientName} - {proposal.projectName}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={handlePreview} className="gradient-bg hover:opacity-90">
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 4 de 4</span>
            <span>100% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Edit3 className="w-5 h-5 mr-2 text-drystore-blue" />
                      {category}
                    </CardTitle>
                    <Badge variant="secondary">
                      {items.length} item(s)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg">
                        <div className="col-span-4">
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
                        
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            ×
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
                  value={proposal.observations}
                  onChange={(e) => setProposal(prev => ({ ...prev, observations: e.target.value }))}
                  rows={4}
                  placeholder="Condições comerciais, prazos, garantias..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discount" className="text-sm text-gray-600">Desconto (%):</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={proposal.discount}
                      onChange={(e) => setProposal(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="w-20 text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  {proposal.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Desconto:</span>
                      <span>- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-drystore-blue">
                      R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="validity" className="text-sm">Validade (dias):</Label>
                    <Input
                      id="validity"
                      type="number"
                      value={proposal.validityDays}
                      onChange={(e) => setProposal(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 15 }))}
                      className="w-20 text-sm"
                      min="1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handlePreview}
                    className="w-full gradient-bg hover:opacity-90"
                    size="lg"
                  >
                    Visualizar Proposta
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

export default EditProposal;
