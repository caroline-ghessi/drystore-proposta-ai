
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

interface ProposalFinancialSummaryProps {
  subtotal: number;
  discount: number;
  validityDays: number;
  onValidityDaysChange: (days: number) => void;
}

export const ProposalFinancialSummary = ({ 
  subtotal, 
  discount, 
  validityDays, 
  onValidityDaysChange 
}: ProposalFinancialSummaryProps) => {
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Desconto ({discount}%):</span>
              <span>- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-drystore-blue">
              R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="validity" className="text-sm">Validade (dias):</Label>
          <Input
            id="validity"
            type="number"
            value={validityDays}
            onChange={(e) => onValidityDaysChange(parseInt(e.target.value) || 15)}
            className="w-20 text-sm"
            min="1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
