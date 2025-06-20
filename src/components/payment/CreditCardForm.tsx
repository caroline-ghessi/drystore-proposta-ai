
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2 } from 'lucide-react';
import { CreditCardData } from '@/types/payment';

interface CreditCardFormProps {
  onSubmit: (cardData: CreditCardData) => void;
  isProcessing: boolean;
  onBack: () => void;
}

const CreditCardForm = ({ onSubmit, isProcessing, onBack }: CreditCardFormProps) => {
  const [cardData, setCardData] = useState<CreditCardData>({
    number: '',
    expiryDate: '',
    cvv: '',
    holderName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Número do cartão inválido';
    }

    if (!cardData.expiryDate || !cardData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Data de validade inválida (MM/AA)';
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }

    if (!cardData.holderName.trim()) {
      newErrors.holderName = 'Nome do portador é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(cardData);
    }
  };

  const handleInputChange = (field: keyof CreditCardData, value: string) => {
    let formattedValue = value;

    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Dados do Cartão de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              maxLength={19}
              className={errors.number ? 'border-red-500' : ''}
            />
            {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Validade</Label>
              <Input
                id="expiryDate"
                placeholder="MM/AA"
                value={cardData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                maxLength={5}
                className={errors.expiryDate ? 'border-red-500' : ''}
              />
              {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                maxLength={4}
                className={errors.cvv ? 'border-red-500' : ''}
              />
              {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderName">Nome do Portador</Label>
            <Input
              id="holderName"
              placeholder="Como está no cartão"
              value={cardData.holderName}
              onChange={(e) => handleInputChange('holderName', e.target.value.toUpperCase())}
              className={errors.holderName ? 'border-red-500' : ''}
            />
            {errors.holderName && <p className="text-sm text-red-500">{errors.holderName}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Voltar
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Pagar Agora'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreditCardForm;
