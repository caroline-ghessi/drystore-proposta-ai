import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react';
import { useProposalDetails } from '@/hooks/useProposalDetails';
import { PaymentConditionsTable } from '@/components/proposal/PaymentConditionsTable';
import { useState } from 'react';

const ProposalWithExtrasConfirmation = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: proposal } = useProposalDetails(proposalId || '');
  const [selectedPaymentCondition, setSelectedPaymentCondition] = useState<string>('');

  const extrasIds = searchParams.get('extras')?.split(',') || [];
  
  const recommendedExtras = [
    {
      id: 'manutencao',
      title: '🔧 Plano de Manutenção Premium',
      specialPrice: 8500
    },
    {
      id: 'monitoramento',
      title: '📱 Sistema de Monitoramento Remoto',
      specialPrice: 15000
    },
    {
      id: 'treinamento',
      title: '👨‍🏫 Treinamento Avançado da Equipe',
      specialPrice: 4500
    }
  ];

  const selectedExtras = recommendedExtras.filter(extra => extrasIds.includes(extra.id));
  const extrasTotal = selectedExtras.reduce((total, extra) => total + extra.specialPrice, 0);
  const originalProposalValue = Number(proposal?.valor_total || 0);
  const newTotalValue = originalProposalValue + extrasTotal;

  const handleConfirmOrder = () => {
    if (!selectedPaymentCondition) {
      return;
    }
    navigate(`/proposal-final-thanks/${proposalId}?confirmed=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💰 Confirmação da Proposta Completa
          </h1>
          
          <p className="text-xl text-gray-600">
            Revise sua proposta final e escolha a forma de pagamento
          </p>
        </div>

        {/* Proposal Summary */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Original + Extras */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Proposal */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ⚡ Proposta Original - Sistema Solar
                </h3>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">Sistema Fotovoltaico Completo</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {originalProposalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Extras */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  ⭐ Produtos Extras Selecionados
                </h3>
                
                <div className="space-y-3">
                  {selectedExtras.map((extra) => (
                    <div key={extra.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-gray-700">{extra.title}</span>
                      </div>
                      <span className="font-semibold text-green-700">
                        R$ {extra.specialPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-green-300 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-800">Subtotal Extras:</span>
                    <span className="text-xl font-bold text-green-700">
                      R$ {extrasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Conditions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  💳 Escolha a Forma de Pagamento
                </h3>
                
                <PaymentConditionsTable 
                  totalPrice={newTotalValue}
                  selectedCondition={selectedPaymentCondition}
                  onConditionChange={setSelectedPaymentCondition}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Total Summary */}
          <div className="space-y-6">
            {/* Final Total */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2 text-blue-100">
                  Valor Total da Proposta
                </h3>
                
                <div className="text-5xl font-bold mb-6">
                  R$ {newTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                
                <div className="space-y-2 text-blue-100">
                  <div className="flex justify-between">
                    <span>Sistema Solar:</span>
                    <span>R$ {originalProposalValue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extras:</span>
                    <span>R$ {extrasTotal.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="border-t border-blue-400 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Total:</span>
                      <span>R$ {newTotalValue.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-gray-900 mb-4">
                  ✅ Benefícios Inclusos
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>25 anos de garantia solar</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Instalação profissional</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Monitoramento remoto</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Suporte técnico especializado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Todos os documentos inclusos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="text-center">
          <Button
            onClick={handleConfirmOrder}
            disabled={!selectedPaymentCondition}
            className={`px-12 py-4 text-xl font-bold shadow-xl transform hover:scale-105 transition-all ${
              selectedPaymentCondition 
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
            }`}
            size="lg"
          >
            <CheckCircle className="w-6 h-6 mr-3" />
            Confirmar Pedido Completo
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
          
          {!selectedPaymentCondition && (
            <p className="text-orange-600 text-sm mt-3">
              ⚠️ Selecione uma condição de pagamento para confirmar
            </p>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            🔒 Transação 100% segura • 📋 Contrato será gerado automaticamente • 📞 Suporte disponível 24/7
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProposalWithExtrasConfirmation;