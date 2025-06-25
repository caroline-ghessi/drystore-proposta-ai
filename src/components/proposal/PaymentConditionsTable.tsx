
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, FileCheck } from 'lucide-react';
import { usePaymentConditions } from '@/hooks/usePaymentConditions';

interface PaymentConditionsTableProps {
  totalPrice: number;
  selectedCondition: string;
  onConditionChange: (conditionId: string) => void;
}

export const PaymentConditionsTable = ({ 
  totalPrice, 
  selectedCondition, 
  onConditionChange 
}: PaymentConditionsTableProps) => {
  const { data: paymentConditions = [], isLoading } = usePaymentConditions();

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

  const getIcon = (name: string) => {
    if (name.includes('Vista')) return DollarSign;
    if (name.includes('Faturado')) return FileCheck;
    return CreditCard;
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Condições de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-blue-100">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">
          💳 Escolha sua Forma de Pagamento
        </CardTitle>
        <p className="text-gray-600">Selecione a condição que melhor se adequa ao seu orçamento</p>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedCondition} onValueChange={onConditionChange}>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold">Condição</TableHead>
                <TableHead className="font-semibold text-center">Parcelas</TableHead>
                <TableHead className="font-semibold text-center">Valor da Parcela</TableHead>
                <TableHead className="font-semibold text-center">Total</TableHead>
                <TableHead className="font-semibold text-center">Economia/Juros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentConditions.map((condition) => {
                const finalValue = calculateFinalValue(condition);
                const installmentValue = finalValue / condition.installments;
                const Icon = getIcon(condition.name);
                const isSelected = selectedCondition === condition.id;

                return (
                  <TableRow 
                    key={condition.id} 
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => onConditionChange(condition.id)}
                  >
                    <TableCell>
                      <RadioGroupItem value={condition.id} id={condition.id} />
                    </TableCell>
                    
                    <TableCell>
                      <Label 
                        htmlFor={condition.id} 
                        className="flex items-center space-x-2 cursor-pointer font-medium"
                      >
                        <Icon className="w-4 h-4 text-blue-600" />
                        <span>{condition.name}</span>
                      </Label>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <span className="font-medium">
                        {condition.installments === 1 ? 'À vista' : `${condition.installments}x`}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">
                        {condition.installments === 1 ? '-' : formatCurrency(installmentValue)}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <span className="font-bold text-lg text-green-700">
                        {formatCurrency(finalValue)}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {condition.discount_percentage > 0 && (
                        <Badge className="bg-green-500 text-white">
                          -{condition.discount_percentage}%
                        </Badge>
                      )}
                      {condition.interest_percentage > 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          +{condition.interest_percentage}%
                        </Badge>
                      )}
                      {condition.discount_percentage === 0 && condition.interest_percentage === 0 && (
                        <span className="text-gray-500 text-sm">Sem juros</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </RadioGroup>
        
        {!selectedCondition && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 text-sm">
              ⚠️ Selecione uma condição de pagamento para prosseguir
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
