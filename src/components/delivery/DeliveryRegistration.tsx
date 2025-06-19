
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Package, Upload, FileText } from 'lucide-react';

interface DeliveryRegistrationProps {
  proposalId: string;
  onDeliveryAdded: () => void;
}

const DeliveryRegistration = ({ proposalId, onDeliveryAdded }: DeliveryRegistrationProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    quantity: '',
    unit: 'placas',
    invoiceNumber: '',
    receiverName: '',
    notes: ''
  });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular cadastro da entrega
    const newDelivery = {
      id: Date.now().toString(),
      proposalId,
      date: new Date().toISOString().split('T')[0],
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      invoiceNumber: formData.invoiceNumber,
      receiverName: formData.receiverName,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      createdBy: 'Vendedor Atual'
    };

    // Salvar no localStorage (simulação)
    const existingDeliveries = JSON.parse(localStorage.getItem('proposal_deliveries') || '[]');
    existingDeliveries.push(newDelivery);
    localStorage.setItem('proposal_deliveries', JSON.stringify(existingDeliveries));

    toast({
      title: "Entrega Registrada!",
      description: `${formData.quantity} ${formData.unit} registradas com sucesso.`,
    });

    // Reset form
    setFormData({
      quantity: '',
      unit: 'placas',
      invoiceNumber: '',
      receiverName: '',
      notes: ''
    });
    setInvoiceFile(null);
    setSignatureFile(null);

    onDeliveryAdded();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Registrar Nova Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantidade Entregue</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="ex: placas, m², kg"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="invoiceNumber">Número da NF</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              placeholder="ex: NF00123"
              required
            />
          </div>

          <div>
            <Label htmlFor="invoiceFile">Upload da NF (PDF)</Label>
            <Input
              id="invoiceFile"
              type="file"
              accept=".pdf"
              onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>

          <div>
            <Label htmlFor="receiverName">Nome de Quem Recebeu</Label>
            <Input
              id="receiverName"
              value={formData.receiverName}
              onChange={(e) => setFormData(prev => ({ ...prev, receiverName: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="signatureFile">Comprovante/Assinatura</Label>
            <Input
              id="signatureFile"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre a entrega..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            <FileText className="w-4 h-4 mr-2" />
            Registrar Entrega
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryRegistration;
