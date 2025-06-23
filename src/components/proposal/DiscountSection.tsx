
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Percent, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUserDiscountRule } from '@/hooks/useDiscountRules';
import { useCreateApprovalRequest } from '@/hooks/useApprovalRequests';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface DiscountSectionProps {
  discount: number;
  onDiscountChange: (discount: number) => void;
  subtotal: number;
  proposalId?: string;
}

const DiscountSection = ({ 
  discount, 
  onDiscountChange, 
  subtotal,
  proposalId 
}: DiscountSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: discountRule } = useUserDiscountRule();
  const createApprovalRequest = useCreateApprovalRequest();
  
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  const [pendingDiscount, setPendingDiscount] = useState(0);

  const maxAllowedDiscount = discountRule?.max_discount_percentage || 0;
  const approvalThreshold = discountRule?.requires_approval_above || 0;
  const discountAmount = (subtotal * discount) / 100;
  const finalValue = subtotal - discountAmount;

  const handleDiscountChange = (newDiscount: number) => {
    if (newDiscount <= maxAllowedDiscount) {
      onDiscountChange(newDiscount);
    } else if (newDiscount > approvalThreshold) {
      setPendingDiscount(newDiscount);
      setShowApprovalDialog(true);
    } else {
      onDiscountChange(newDiscount);
    }
  };

  const handleApprovalRequest = async () => {
    if (!proposalId || !user?.id) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a solicitação de aprovação.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createApprovalRequest.mutateAsync({
        proposal_id: proposalId,
        requested_by: user.id,
        approval_type: 'discount',
        requested_value: pendingDiscount,
        current_limit: maxAllowedDiscount,
        reason: approvalReason,
        status: 'pending'
      });

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de desconto foi enviada para aprovação.",
      });

      setShowApprovalDialog(false);
      setApprovalReason('');
      setPendingDiscount(0);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação de aprovação.",
        variant: "destructive"
      });
    }
  };

  const getDiscountStatus = () => {
    if (discount === 0) return null;
    
    if (discount <= maxAllowedDiscount) {
      return (
        <Badge className="text-green-600 bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprovado automaticamente
        </Badge>
      );
    } else {
      return (
        <Badge className="text-orange-600 bg-orange-100">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Requer aprovação
        </Badge>
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Percent className="w-5 h-5 mr-2" />
              Desconto Geral
            </div>
            {getDiscountStatus()}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Limite permitido: {maxAllowedDiscount}% | Requer aprovação acima de: {approvalThreshold}%
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className={discount > maxAllowedDiscount ? 'border-orange-500' : ''}
              />
            </div>
            <div>
              <Label>Valor do Desconto</Label>
              <div className="p-2 bg-gray-50 rounded border text-sm font-medium">
                R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm">
                R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span className="text-sm">Desconto:</span>
                <span className="text-sm">
                  - R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
              <span>Total Final:</span>
              <span className="text-drystore-blue">
                R$ {finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitação de Aprovação de Desconto</DialogTitle>
            <DialogDescription>
              O desconto de {pendingDiscount}% excede seu limite de {maxAllowedDiscount}%. 
              Para continuar, é necessária aprovação de um administrador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Justificativa para o desconto</Label>
              <Textarea
                id="reason"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder="Explique o motivo para solicitar este desconto..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleApprovalRequest}
              disabled={!approvalReason.trim() || createApprovalRequest.isPending}
            >
              {createApprovalRequest.isPending ? 'Enviando...' : 'Solicitar Aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DiscountSection;
