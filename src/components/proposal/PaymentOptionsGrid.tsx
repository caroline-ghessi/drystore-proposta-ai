
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Receipt, Calendar } from 'lucide-react';
import { usePaymentConditions } from '@/hooks/usePaymentConditions';

interface PaymentOptionsGridProps {
  totalPrice: number;
}

export const PaymentOptionsGrid = ({ totalPrice }: PaymentOptionsGridProps) => {
  const { data: paymentConditions = [], isLoading } = usePaymentConditions();

  const getIcon = (name: string) => {
    if (name.includes('Vista')) return DollarSign;
    if (name.includes('Faturado')) return Receipt;
    return CreditCard;
  };

  const getGradientClass = (name: string) => {
    if (name.includes('Vista')) return 'from-green-500 to-green-600';
    if (name.includes('Faturado')) return 'from-blue-500 to-blue-600';
    if (name.includes('4x')) return 'from-purple-500 to-purple-600';
    if (name.includes('5x a 10x')) return 'from-orange-500 to-orange-600';
    if (name.includes('11x a 14x')) return 'from-red-500 to-red-600';
    return 'from-gray-500 to-gray-600';
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
        const gradientClass = getGradientClass(condition.name);
        const savings = totalPrice - finalValue;
        const isHighlighted = condition.name.includes('Vista');

        return (
          <Card 
            key={condition.id} 
            className={`relative overflow-hidden transition-all hover:shadow-lg hover:scale-105 ${
              isHighlighted ? 'ring-2 ring-green-400 ring-opacity-50' : ''
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10`} />
            
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${gradientClass}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{condition.name}</h4>
                </div>
                
                {condition.discount_percentage > 0 && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    -{condition.discount_percentage}%
                  </Badge>
                )}
                
                {condition.interest_percentage > 0 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    +{condition.interest_percentage}%
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(finalValue)}
                  </span>
                </div>

                {condition.installments > 1 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {condition.installments}x de:
                    </span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(installmentValue)}
                    </span>
                  </div>
                )}

                {savings > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Economia:</span>
                    <span className="font-semibold">
                      {formatCurrency(savings)}
                    </span>
                  </div>
                )}
              </div>

              {isHighlighted && (
                <div className="mt-3 p-2 bg-green-50 rounded-md">
                  <div className="flex items-center text-green-700">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">Melhor opção!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
