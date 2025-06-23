
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { usePaymentConditions } from '@/hooks/usePaymentConditions';

interface PaymentCondition {
  id: string;
  name: string;
  installments: number;
  discount_percentage: number;
  interest_percentage: number;
}

interface PaymentConditionsSelectorProps {
  selectedConditions: string[];
  onConditionsChange: (conditions: string[]) => void;
  subtotal: number;
}

const PaymentConditionsSelector = ({ 
  selectedConditions, 
  onConditionsChange, 
  subtotal 
}: PaymentConditionsSelectorProps) => {
  const { data: paymentConditions = [], isLoading } = usePaymentConditions();

  const handleConditionToggle = (conditionId: string, checked: boolean) => {
    if (checked) {
      onConditionsChange([...selectedConditions, conditionId]);
    } else {
      onConditionsChange(selectedConditions.filter(id => id !== conditionId));
    }
  };

  const calculateValue = (condition: PaymentCondition) => {
    let finalValue = subtotal;
    
    if (condition.discount_percentage > 0) {
      finalValue = subtotal * (1 - condition.discount_percentage / 100);
    } else if (condition.interest_percentage > 0) {
      finalValue = subtotal * (1 + condition.interest_percentage / 100);
    }
    
    return finalValue;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Condições de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Condições de Pagamento
        </CardTitle>
        <p className="text-sm text-gray-600">
          Selecione as condições que serão apresentadas ao cliente
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paymentConditions.map((condition) => {
            const finalValue = calculateValue(condition);
            const installmentValue = finalValue / condition.installments;
            const isSelected = selectedConditions.includes(condition.id);
            
            return (
              <div key={condition.id} className="flex items-center space-x-3">
                <Checkbox
                  id={condition.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    handleConditionToggle(condition.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={condition.id}
                  className="flex-1 cursor-pointer"
                >
                  <div className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{condition.name}</span>
                      <div className="flex space-x-2">
                        {condition.discount_percentage > 0 && (
                          <Badge variant="secondary" className="text-green-600 bg-green-100">
                            -{condition.discount_percentage}%
                          </Badge>
                        )}
                        {condition.interest_percentage > 0 && (
                          <Badge variant="secondary" className="text-orange-600 bg-orange-100">
                            +{condition.interest_percentage}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">
                          R$ {finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      {condition.installments > 1 && (
                        <div className="flex justify-between">
                          <span>{condition.installments}x de:</span>
                          <span className="font-medium">
                            R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentConditionsSelector;
