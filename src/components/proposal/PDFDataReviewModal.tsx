
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClientDataSection from './ClientDataSection';
import AdditionalInfoSection from './AdditionalInfoSection';
import ItemsTable from './ItemsTable';
import TotalsSection from './TotalsSection';

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

interface ClientData {
  name: string;
  email: string;
  company?: string;
}

interface PDFDataReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extractedData: ExtractedData;
  onConfirm: (finalData: ExtractedData & { clientData: ClientData }) => void;
}

const PDFDataReviewModal = ({ 
  open, 
  onOpenChange, 
  extractedData, 
  onConfirm 
}: PDFDataReviewModalProps) => {
  const [editableData, setEditableData] = useState<ExtractedData>(extractedData);
  const [clientData, setClientData] = useState<ClientData>({
    name: extractedData.client || '',
    email: '',
    company: extractedData.vendor || ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    setEditableData(extractedData);
    setClientData({
      name: extractedData.client || '',
      email: '',
      company: extractedData.vendor || ''
    });
  }, [extractedData]);

  const updateClientData = (field: keyof ClientData, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

    // Validar dados do cliente
    if (!clientData.name.trim()) {
      newErrors.name = 'Nome do cliente é obrigatório';
    }

    if (!clientData.email.trim()) {
      newErrors.email = 'Email do cliente é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

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
      onConfirm({
        ...editableData,
        clientData
      });
      toast({
        title: "Dados confirmados!",
        description: "Redirecionando para finalizar a proposta...",
      });
    } else {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive"
      });
    }
  };

  const updateAdditionalInfo = (field: keyof ExtractedData, value: string) => {
    setEditableData({
      ...editableData,
      [field]: value
    });
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
          {/* Dados do Cliente - Seção destacada */}
          <ClientDataSection
            clientData={clientData}
            errors={errors}
            onUpdateClientData={updateClientData}
          />

          {/* Informações Adicionais */}
          <AdditionalInfoSection
            extractedData={editableData}
            onUpdateData={updateAdditionalInfo}
          />

          {/* Tabela de Itens */}
          <ItemsTable
            items={editableData.items}
            errors={errors}
            onUpdateItem={updateItem}
            onAddItem={addNewItem}
            onRemoveItem={removeItem}
          />

          {/* Totais */}
          <TotalsSection
            subtotal={editableData.subtotal}
            total={editableData.total}
          />

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="gradient-bg">
              <Save className="w-4 h-4 mr-2" />
              Confirmar e Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFDataReviewModal;
