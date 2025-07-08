import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Check, X, AlertCircle, FileText, User } from 'lucide-react';

interface ExtractedData {
  client_name: string;
  client_email: string;
  proposal_number: string;
  vendor_name: string;
  items: Array<{
    produto_nome: string;
    descricao_item: string;
    quantidade: number;
    preco_unit: number;
    preco_total: number;
    unidade: string;
  }>;
  subtotal: number;
  valor_total: number;
  observacoes: string;
  extraction_date: string;
  source: string;
}

interface PDFDataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ExtractedData) => void;
  extractedData: ExtractedData;
  confidenceScore: number;
}

export const PDFDataPreviewModal: React.FC<PDFDataPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  extractedData,
  confidenceScore
}) => {
  const [editedData, setEditedData] = useState<ExtractedData>(extractedData);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleFieldEdit = (field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemEdit = (index: number, field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getConfidenceColor = () => {
    if (confidenceScore >= 80) return 'text-green-600';
    if (confidenceScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = () => {
    if (confidenceScore >= 80) return <Badge className="bg-green-100 text-green-800">Alta Confiança</Badge>;
    if (confidenceScore >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Média Confiança</Badge>;
    return <Badge variant="destructive">Baixa Confiança - Revisar</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Dados Extraídos do PDF</span>
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Revise e confirme os dados antes de criar a proposta</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getConfidenceColor()}`}>
                Confiança: {confidenceScore}%
              </span>
              {getConfidenceBadge()}
            </div>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="client">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="items">Itens da Proposta</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Informações do Cliente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_name">Nome do Cliente</Label>
                    <Input
                      id="client_name"
                      value={editedData.client_name}
                      onChange={(e) => handleFieldEdit('client_name', e.target.value)}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_email">Email do Cliente</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={editedData.client_email}
                      onChange={(e) => handleFieldEdit('client_email', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proposal_number">Número da Proposta</Label>
                    <Input
                      id="proposal_number"
                      value={editedData.proposal_number}
                      onChange={(e) => handleFieldEdit('proposal_number', e.target.value)}
                      placeholder="Número/código da proposta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor_name">Vendedor</Label>
                    <Input
                      id="vendor_name"
                      value={editedData.vendor_name}
                      onChange={(e) => handleFieldEdit('vendor_name', e.target.value)}
                      placeholder="Nome do vendedor"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={editedData.observacoes}
                    onChange={(e) => handleFieldEdit('observacoes', e.target.value)}
                    placeholder="Observações da proposta"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Itens da Proposta ({editedData.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {editedData.items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Badge variant="outline">{item.unidade}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Label>Produto</Label>
                          <Input
                            value={item.produto_nome}
                            onChange={(e) => handleItemEdit(index, 'produto_nome', e.target.value)}
                            placeholder="Nome do produto"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={item.descricao_item}
                            onChange={(e) => handleItemEdit(index, 'descricao_item', e.target.value)}
                            placeholder="Descrição detalhada"
                            rows={2}
                          />
                        </div>
                        
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => handleItemEdit(index, 'quantidade', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <Label>Preço Unitário</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.preco_unit}
                            onChange={(e) => handleItemEdit(index, 'preco_unit', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium">Total do Item:</span>
                        <span className="text-lg font-bold">
                          R$ {(item.quantidade * item.preco_unit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {editedData.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>R$ {editedData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Extração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fonte:</span>
                    <span>{editedData.source}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Data:</span>
                    <span>{new Date(editedData.extraction_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Confiança:</span>
                    <span className={getConfidenceColor()}>{confidenceScore}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {confidenceScore < 70 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Atenção</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      A confiança dos dados extraídos está baixa. Recomendamos revisar cuidadosamente 
                      todos os campos antes de confirmar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(editedData)}>
            <Check className="w-4 h-4 mr-2" />
            Confirmar e Criar Proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};