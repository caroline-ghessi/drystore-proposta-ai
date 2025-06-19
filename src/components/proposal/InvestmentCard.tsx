
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Phone, Star, TrendingUp, Shield, Clock, Award } from 'lucide-react';

interface InvestmentCardProps {
  proposal: {
    originalPrice: number;
    discount: number;
    finalPrice: number;
    installments: {
      times: number;
      value: number;
    };
    roi: string;
    economy: string;
    validUntil: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  onAccept: () => void;
  onQuestion: () => void;
}

export const InvestmentCard = ({ proposal, status, onAccept, onQuestion }: InvestmentCardProps) => {
  return (
    <Card className="sticky top-8">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-lg">Investimento Total</CardTitle>
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
          {proposal.discount}% OFF
        </div>
      </CardHeader>
      
      <CardContent className="text-center">
        <div className="mb-4">
          <p className="text-gray-500 line-through text-lg">
            R$ {proposal.originalPrice.toLocaleString('pt-BR')}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            R$ {proposal.finalPrice.toLocaleString('pt-BR')}
          </p>
          <p className="text-orange-500 font-medium">
            ou {proposal.installments.times}x R$ {proposal.installments.value.toLocaleString('pt-BR')}
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
            <Button 
              onClick={onAccept}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Aceitar Proposta
            </Button>
            
            <Button 
              onClick={onQuestion}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Falar com Consultor
            </Button>
          </div>
        ) : status === 'accepted' ? (
          <div className="text-green-600 py-4">
            <Check className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Proposta Aceita!</p>
            <p className="text-sm text-gray-600">Aguarde o contato do vendedor</p>
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
