
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, QrCode, FileText } from 'lucide-react';
import { PaymentMethod } from '@/types/payment';

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: string) => void;
  selectedMethod: string | null;
}

const PaymentMethodSelector = ({ onSelectMethod, selectedMethod }: PaymentMethodSelectorProps) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      description: 'Pagamento aprovado na hora',
      icon: 'credit-card',
      enabled: true
    },
    {
      id: 'pix',
      name: 'PIX',
      description: 'Pagamento instantâneo via QR Code',
      icon: 'qr-code',
      enabled: true
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      description: 'Confirmação em até 2 dias úteis',
      icon: 'file-text',
      enabled: true
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className="w-8 h-8" />;
      case 'qr-code':
        return <QrCode className="w-8 h-8" />;
      case 'file-text':
        return <FileText className="w-8 h-8" />;
      default:
        return <CreditCard className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Escolha a forma de pagamento</h2>
        <p className="text-gray-600">Selecione como deseja pagar sua proposta</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedMethod === method.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3 text-blue-600">
                {getIcon(method.icon)}
              </div>
              <CardTitle className="text-lg">{method.name}</CardTitle>
              <CardDescription>{method.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedMethod && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Método selecionado: <strong>
              {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
