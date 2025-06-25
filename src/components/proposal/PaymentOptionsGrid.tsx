
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Receipt, Calendar, FileCheck, Banknote } from 'lucide-react';
import { usePaymentConditions } from '@/hooks/usePaymentConditions';

interface PaymentOptionsGridProps {
  totalPrice: number;
}

export const PaymentOptionsGrid = ({ totalPrice }: PaymentOptionsGridProps) => {
  const { data: paymentConditions = [], isLoading } = usePaymentConditions();

  const getColorClasses = (name: string) => {
    if (name.includes('Vista')) return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      badge: 'bg-green-500 text-white'
    };
    if (name.includes('Faturado')) return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      badge: 'bg-blue-500 text-white'
    };
    if (name.includes('4x')) return {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      badge: 'bg-purple-500 text-white'
    };
    if (name.includes('5x a 10x')) return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      badge: 'bg-orange-500 text-white'
    };
    if (name.includes('11x a 14x')) return {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-800',
      badge: 'bg-indigo-500 text-white'
    };
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      badge: 'bg-gray-500 text-white'
    };
  };

  const getIcon = (name: string) => {
    if (name.includes('Vista')) return DollarSign;
    if (name.includes('Faturado')) return FileCheck;
    return CreditCard;
  };

  const calculateFinalValue = (condition: any) => {
    let finalValue = totalPrice;
    
    if (condition.discount_percentage > 0) {
      finalValue = totalPrice * (1 - condition.discount_percentage / 100);
    } else if (condition.interest_percentage > 0) {
      finalValue = totalPrice * (1 + condition.interest_percentage / 100);
    }
    
    return finalValue;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paymentConditions.map((condition) => {
        const finalValue = calculateFinalValue(condition);
        const installmentValue = finalValue / condition.installments;
        const Icon = getIcon(condition.name);
        const colors = getColorClasses(condition.name);
        const savings = totalPrice - finalValue;
        const isVista = condition.name.includes('Vista');
        const isFaturado = condition.name.includes('Faturado');
        const isParcelado = condition.installments > 1;

        return (
          <Card 
            key={condition.id} 
            className={`relative overflow-hidden ${colors.bg} ${colors.border} border-2 hover:shadow-lg transition-shadow`}
          >
            <CardContent className="p-6">
              {/* Header com ícone e título */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                  <h4 className={`font-semibold text-lg ${colors.text}`}>
                    {condition.name}
                  </h4>
                </div>
                
                {/* Badge de desconto/juros */}
                {condition.discount_percentage > 0 && (
                  <Badge className={`${colors.badge} text-xs`}>
                    -{condition.discount_percentage}%
                  </Badge>
                )}
                
                {condition.interest_percentage > 0 && (
                  <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                    +{condition.interest_percentage}%
                  </Badge>
                )}
              </div>

              {/* Conteúdo principal */}
              {isVista && (
                <div className="text-center">
                  <div className="mb-2">
                    <span className="text-sm text-green-600">Você economiza:</span>
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(savings)}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-green-800">
                    Total: {formatCurrency(finalValue)}
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ Melhor opção financeira!
                  </div>
                </div>
              )}

              {isFaturado && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800 mb-2">
                    {formatCurrency(finalValue)}
                  </div>
                  {savings > 0 && (
                    <div className="text-sm text-blue-600 mb-2">
                      Economia: {formatCurrency(savings)}
                    </div>
                  )}
                  <div className="text-xs text-blue-600">
                    * Sujeito à análise de crédito
                  </div>
                </div>
              )}

              {isParcelado && !isFaturado && (
                <div className="text-center">
                  <div className="mb-1">
                    <span className="text-sm text-gray-600">
                      {condition.installments}x de
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {formatCurrency(installmentValue)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: {formatCurrency(finalValue)}
                  </div>
                  {condition.interest_percentage > 0 && (
                    <div className="mt-2 text-xs text-orange-600">
                      Juros: {condition.interest_percentage}%
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
