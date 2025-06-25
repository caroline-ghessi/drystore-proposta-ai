
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, Gift, CreditCard } from 'lucide-react';
import { PaymentOptionsGrid } from './PaymentOptionsGrid';

interface ModernInvestmentSectionProps {
  totalPrice: number;
  discount?: number;
  validUntil: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export const ModernInvestmentSection = ({ 
  totalPrice, 
  discount = 0, 
  validUntil,
  onAccept,
  onReject 
}: ModernInvestmentSectionProps) => {
  const finalPrice = totalPrice - (totalPrice * discount / 100);
  const savings = totalPrice - finalPrice;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="investment-section">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          💰 Investimento & Condições Exclusivas
        </h2>
        <p className="text-lg text-gray-600">
          Ofertas especiais válidas apenas para esta proposta
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Investment Card */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Valor do Investimento</h3>
                  <p className="text-blue-100">Sua solução completa</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-200" />
              </div>

              <div className="space-y-4">
                {discount > 0 && (
                  <div className="flex items-center justify-between text-blue-200">
                    <span>Valor original:</span>
                    <span className="line-through text-lg">
                      R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-300">
                    <span>Desconto aplicado ({discount}%):</span>
                    <span className="text-lg font-semibold">
                      -R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="border-t border-blue-500 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">Valor base:</span>
                    <div className="text-right">
                      <div className="text-4xl font-bold">
                        R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-blue-200 text-sm">
                        *Condições de pagamento aplicadas abaixo
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-300" />
                  <span className="font-semibold">Oferta Limitada</span>
                </div>
                <p className="text-blue-100 text-sm">
                  Esta proposta é válida até {validUntil}. Não perca esta oportunidade!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-3" />
              Condições de Pagamento
            </h3>
            <PaymentOptionsGrid totalPrice={finalPrice} />
          </div>
        </div>

        {/* Actions and Benefits */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h4 className="font-bold text-gray-900 mb-4 text-center">
                Aceitar Proposta
              </h4>
              
              <div className="space-y-3">
                <Button 
                  onClick={onAccept}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aceitar e Continuar
                </Button>
                
                <Button 
                  onClick={onReject}
                  variant="outline"
                  className="w-full"
                >
                  Preciso Pensar
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Sem compromisso • Suporte completo
              </p>
            </CardContent>
          </Card>

          {/* Additional Benefits */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h4 className="font-bold text-gray-900 mb-4">
                Benefícios Inclusos
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Garantia de 5 anos</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Instalação profissional</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Suporte técnico 24/7</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Materiais certificados</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bonus */}
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Gift className="w-6 h-6 text-orange-600 mr-2" />
                <h4 className="font-bold text-orange-800">Bônus Exclusivo</h4>
              </div>
              <p className="text-orange-700 text-sm">
                Consultoria gratuita de design de interiores para clientes que fecharem esta semana!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
