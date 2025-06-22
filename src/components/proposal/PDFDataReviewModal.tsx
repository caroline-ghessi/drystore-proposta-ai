
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExtractedItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ExtractedData {
  id?: string;
  client?: string;
  items: ExtractedItem[];
  subtotal: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  vendor?: string;
}

interface PDFDataReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extractedData: ExtractedData;
  onConfirm: (finalData: ExtractedData) => void;
}

const PDFDataReviewModal = ({ 
  open, 
  onOpenChange, 
  extractedData, 
  onConfirm 
}: PDFDataReviewModalProps) => {
  const [editableData, setEditableData] = useState<ExtractedData>(extractedData);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    setEditableData(extractedData);
  }, [extractedData]);

  const updateItem = (index: number, field: keyof ExtractedItem, value: string | number) => {
    const newItems = [...editableData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Recalcular total do item se quantidade ou preço unitário mudou
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setEditableData({
      ...editableData,
      items: newItems
    });

    // Recalcular totais gerais
    recalculateTotals(newItems);
  };

  const recalculateTotals = (items: ExtractedItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    setEditableData(prev => ({
      ...prev,
      subtotal,
      total: subtotal
    }));
  };

  const addNewItem = () => {
    const newItem: ExtractedItem = {
      description: '',
      quantity: 1,
      unit: 'UN',
      unitPrice: 0,
      total: 0
    };

    setEditableData({
      ...editableData,
      items: [...editableData.items, newItem]
    });
  };

  const removeItem = (index: number) => {
    const newItems = editableData.items.filter((_, i) => i !== index);
    setEditableData({
      ...editableData,
      items: newItems
    });
    recalculateTotals(newItems);
  };

  const validateData = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validar se há pelo menos um item
    if (editableData.items.length === 0) {
      newErrors.items = 'Deve haver pelo menos um item na proposta';
    }

    // Validar cada item
    editableData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item-${index}-description`] = 'Descrição é obrigatória';
      }
      if (item.quantity <= 0) {
        newErrors[`item-${index}-quantity`] = 'Quantidade deve ser maior que zero';
      }
      if (item.unitPrice < 0) {
        newErrors[`item-${index}-unitPrice`] = 'Preço não pode ser negativo';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateData()) {
      onConfirm(editableData);
      toast({
        title: "Dados confirmados!",
        description: "Gerando proposta com os dados revisados...",
      });
    } else {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            Revisar Dados Extraídos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Gerais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Cliente Identificado</Label>
                <Input
                  id="client"
                  value={editableData.client || ''}
                  onChange={(e) => setEditableData({
                    ...editableData,
                    client: e.target.value
                  })}
                  placeholder="Nome do cliente (opcional)"
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                <Input
                  id="paymentTerms"
                  value={editableData.paymentTerms || ''}
                  onChange={(e) => setEditableData({
                    ...editableData,
                    paymentTerms: e.target.value
                  })}
                  placeholder="Ex: 30 dias"
                />
              </div>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Itens da Proposta</h3>
              <Button onClick={addNewItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {errors.items && (
              <div className="text-red-600 text-sm">{errors.items}</div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Descrição</TableHead>
                    <TableHead className="w-[15%]">Quantidade</TableHead>
                    <TableHead className="w-[10%]">Unidade</TableHead>
                    <TableHead className="w-[15%]">Valor Unit. (R$)</TableHead>
                    <TableHead className="w-[15%]">Total (R$)</TableHead>
                    <TableHead className="w-[5%]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editableData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className={errors[`item-${index}-description`] ? 'border-red-500' : ''}
                          placeholder="Descrição do item"
                        />
                        {errors[`item-${index}-description`] && (
                          <div className="text-red-600 text-xs mt-1">
                            {errors[`item-${index}-description`]}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className={errors[`item-${index}-quantity`] ? 'border-red-500' : ''}
                          min="0"
                          step="0.01"
                        />
                        {errors[`item-${index}-quantity`] && (
                          <div className="text-red-600 text-xs mt-1">
                            {errors[`item-${index}-quantity`]}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          placeholder="UN"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className={errors[`item-${index}-unitPrice`] ? 'border-red-500' : ''}
                          min="0"
                          step="0.01"
                        />
                        {errors[`item-${index}-unitPrice`] && (
                          <div className="text-red-600 text-xs mt-1">
                            {errors[`item-${index}-unitPrice`]}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => removeItem(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totais */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    R$ {editableData.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    R$ {editableData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="gradient-bg">
              <Save className="w-4 h-4 mr-2" />
              Confirmar e Gerar Proposta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFDataReviewModal;
