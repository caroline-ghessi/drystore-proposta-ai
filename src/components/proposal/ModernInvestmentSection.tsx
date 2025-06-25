
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, CheckCircle, Star } from 'lucide-react';
import { PaymentConditionsTable } from './PaymentConditionsTable';

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
  const [selectedPaymentCondition, setSelectedPaymentCondition] = useState<string>('');
  
  const finalPrice = totalPrice - (totalPrice * discount / 100);
  const savings = totalPrice - finalPrice;

  const handleAcceptProposal = () => {
    if (!selectedPaymentCondition) {
      return; // Não permite aceitar sem selecionar forma de pagamento
    }
    onAccept?.();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="investment-section">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          💰 Investimento & Condições Exclusivas
        </h2>
        <p className="text-lg text-gray-600">
          Ofertas especiais válidas apenas para esta proposta
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content - Valor Total + Tabela de Condições */}
        <div className="lg:col-span-3 space-y-8">
          {/* Valor Total em Destaque Máximo */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-xl">
              <div className="flex justify-center items-center mb-4">
                <Star className="w-8 h-8 text-yellow-300 mr-3" />
                <h3 className="text-2xl font-bold">Valor Total do Projeto</h3>
                <Star className="w-8 h-8 text-yellow-300 ml-3" />
              </div>
              
              {discount > 0 && (
                <div className="mb-4">
                  <div className="text-blue-200 text-lg mb-2">
                    <span className="line-through">
                      R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full inline-block text-sm font-semibold">
                    ECONOMIA DE {discount}% = R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
              
              <div className="text-5xl sm:text-6xl font-bold mb-4">
                R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-blue-200">
                <Clock className="w-5 h-5" />
                <span className="text-lg">Válido até {validUntil}</span>
              </div>
            </div>
          </div>

          {/* Tabela de Condições de Pagamento */}
          <PaymentConditionsTable 
            totalPrice={finalPrice}
            selectedCondition={selectedPaymentCondition}
            onConditionChange={setSelectedPaymentCondition}
          />

          {/* Call to Action Principal */}
          <div className="text-center">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-green-800 mb-3">
                🎯 Pronto para Começar seu Projeto?
              </h4>
              <p className="text-green-700 mb-4">
                {selectedPaymentCondition 
                  ? "Clique em 'Aceitar Proposta' e garanta sua solução de armazenamento inteligente!"
                  : "Selecione uma forma de pagamento acima para continuar"
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleAcceptProposal}
                  disabled={!selectedPaymentCondition}
                  className={`px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all ${
                    selectedPaymentCondition 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
                  }`}
                  size="lg"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Aceitar Proposta
                </Button>
                
                <Button 
                  onClick={onReject}
                  variant="outline"
                  className="border-gray-300 text-gray-700 px-8 py-4 text-lg"
                  size="lg"
                >
                  Preciso Pensar
                </Button>
              </div>
              
              {!selectedPaymentCondition && (
                <p className="text-orange-600 text-sm mt-3">
                  ⚠️ Selecione uma condição de pagamento para habilitar a aceitação
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Benefícios e Urgência */}
        <div className="space-y-6">
          {/* Benefícios Inclusos */}
          <Card className="shadow-lg border-2 border-blue-100">
            <CardContent className="p-6">
              <h4 className="font-bold text-gray-900 mb-4 text-center">
                ✅ Benefícios Inclusos
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
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Consultoria gratuita</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Manutenção 1º ano</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Urgência */}
          <Card className="shadow-lg bg-orange-50 border-2 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="text-orange-600 mb-3">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-bold text-lg">⏰ Oferta Limitada</h4>
              </div>
              
              <p className="text-orange-700 text-sm mb-4">
                Esta proposta expira em breve. Não perca esta oportunidade exclusiva!
              </p>
              
              <div className="bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                Válido até {validUntil}
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="shadow-lg bg-gray-50 border-2 border-gray-200">
            <CardContent className="p-6 text-center">
              <h4 className="font-bold text-gray-900 mb-3">
                🔒 100% Seguro
              </h4>
              
              <div className="space-y-2 text-xs text-gray-600">
                <p>✓ Sem compromisso inicial</p>
                <p>✓ Suporte completo incluso</p>
                <p>✓ Satisfação garantida</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
