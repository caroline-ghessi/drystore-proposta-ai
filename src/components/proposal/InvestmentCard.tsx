
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, MessageCircle, Star, TrendingUp, Shield, Clock, Award } from 'lucide-react';

interface InvestmentCardProps {
  proposal: {
    originalPrice: number;
    discount: number;
    finalPrice: number;
    installments?: {
      times: number;
      value: number;
    };
    roi: string;
    economy: string;
    validUntil: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'aguardando_pagamento';
  onAccept: () => void;
  onQuestion: () => void;
  onReject?: () => void;
}

export const InvestmentCard = ({
  proposal,
  status,
  onAccept,
  onQuestion,
  onReject
}: InvestmentCardProps) => {
  // Garantir que temos valores válidos para os cálculos
  const discount = Number(proposal.discount) || 0;
  const finalPrice = Number(proposal.finalPrice) || 0;
  
  // Calcular preço original baseado no desconto
  const originalPrice = discount > 0 ? 
    finalPrice / (1 - discount / 100) : 
    Number(proposal.originalPrice) || finalPrice;

  // Valores padrão para installments se não estiver definido
  const installments = proposal.installments || {
    times: 1,
    value: finalPrice
  };

  return (
    <Card className="sticky top-8">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-lg">Investimento Total</CardTitle>
        {discount > 0 && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
            {discount}% OFF
          </div>
        )}
      </CardHeader>
      
      <CardContent className="text-center">
        <div className="mb-4">
          {discount > 0 && (
            <p className="text-gray-500 line-through text-lg">
              R$ {originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
          <p className="text-3xl font-bold mb-1 text-orange-500">
            R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-orange-500 font-medium">
            ou {installments.times}x R$ {installments.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Star className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">ROI</p>
            <p className="font-semibold text-gray-900">{proposal.roi}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Economia</p>
            <p className="font-semibold text-green-600">Valorização {proposal.economy}</p>
          </div>
        </div>

        {/* Ações */}
        {status === 'pending' ? (
          <div className="space-y-3">
            <Button onClick={onAccept} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
              <Check className="w-5 h-5 mr-2" />
              Aceitar Proposta
            </Button>
            
            <Button onClick={onQuestion} variant="outline" className="w-full" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com Consultor
            </Button>

            <Button onClick={onReject} variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50" size="lg">
              <X className="w-5 h-5 mr-2" />
              Recusar Proposta
            </Button>
          </div>
        ) : status === 'accepted' || status === 'aguardando_pagamento' ? (
          <div className="text-green-600 py-4">
            <Check className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">
              {status === 'accepted' ? 'Proposta Aceita!' : 'Aguardando Pagamento'}
            </p>
            <p className="text-sm text-gray-600">
              {status === 'accepted' ? 'Aguarde o contato do vendedor' : 'Finalize o pagamento para confirmar'}
            </p>
          </div>
        ) : (
          <div className="text-red-600 py-4">
            <X className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Proposta Rejeitada</p>
          </div>
        )}

        {/* Informações de Garantia */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-center text-xs text-gray-600">
            <Shield className="w-4 h-4 mr-1" />
            <span>Proposta segura e confidencial</span>
          </div>
          <div className="flex items-center justify-center text-xs text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Válida até {proposal.validUntil}</span>
          </div>
          <div className="flex items-center justify-center text-xs text-gray-600">
            <Award className="w-4 h-4 mr-1" />
            <span>Satisfação garantida</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
