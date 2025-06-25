
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Receipt, Calendar, FileCheck, Banknote } from 'lucide-react';
import { usePaymentConditions } from '@/hooks/usePaymentConditions';

interface PaymentOptionsGridProps {
  totalPrice: number;
}

export const PaymentOptionsGrid = ({ totalPrice }: PaymentOptionsGridProps) => {
  const { data: paymentConditions = [], isLoading } = usePaymentConditions();

  const getIcon = (name: string) => {
    if (name.includes('Vista')) return DollarSign;
    if (name.includes('Faturado')) return FileCheck;
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {paymentConditions.map((condition) => {
        const finalValue = calculateFinalValue(condition);
        const installmentValue = finalValue / condition.installments;
        const Icon = getIcon(condition.name);
        const gradientClass = getGradientClass(condition.name);
        const savings = totalPrice - finalValue;
        const isVista = condition.name.includes('Vista');
        const isFaturado = condition.name.includes('Faturado');
        const isParcelado = condition.installments > 1;

        return (
          <Card 
            key={condition.id} 
            className={`relative overflow-hidden transition-all hover:shadow-xl hover:scale-105 border-2 ${
              isVista ? 'ring-2 ring-green-400 ring-opacity-50 border-green-200' : 'border-gray-200'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10`} />
            
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${gradientClass}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-lg">{condition.name}</h4>
                </div>
                
                {condition.discount_percentage > 0 && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-sm px-3 py-1">
                    -{condition.discount_percentage}%
                  </Badge>
                )}
                
                {condition.interest_percentage > 0 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300 text-sm px-3 py-1">
                    +{condition.interest_percentage}%
                  </Badge>
                )}
              </div>

              {/* À Vista - Enfoque na Economia */}
              {isVista && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="w-6 h-6 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Você economiza:</span>
                      </div>
                      <span className="text-2xl font-bold text-green-700">
                        {formatCurrency(savings)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total a pagar:</span>
                    <span className="font-bold text-xl text-gray-900">
                      {formatCurrency(finalValue)}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-green-50 rounded-md">
                    <div className="flex items-center text-green-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Melhor opção financeira!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Faturado - Com observação sobre análise */}
              {isFaturado && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="font-bold text-xl text-gray-900">
                      {formatCurrency(finalValue)}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Economia:</span>
                      <span className="font-semibold text-lg">
                        {formatCurrency(savings)}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-start text-blue-700">
                      <FileCheck className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        Condição aprovada mediante análise de crédito
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Parcelado - Enfoque no valor da parcela */}
              {isParcelado && !isFaturado && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Banknote className="w-6 h-6 text-gray-600 mr-2" />
                        <span className="text-sm font-medium text-gray-800">
                          {condition.installments}x de:
                        </span>
                      </div>
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(installmentValue)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Total:</span>
                    <span className="font-medium text-sm text-gray-600">
                      {formatCurrency(finalValue)}
                    </span>
                  </div>
                  {condition.interest_percentage > 0 && (
                    <div className="mt-2 p-3 bg-orange-50 rounded-md">
                      <div className="flex items-center text-orange-700">
                        <span className="text-sm">
                          Juros de {condition.interest_percentage}% aplicados
                        </span>
                      </div>
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
