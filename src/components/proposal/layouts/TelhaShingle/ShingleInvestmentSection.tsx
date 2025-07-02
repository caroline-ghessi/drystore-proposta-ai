import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Star, 
  Shield, 
  Users, 
  Calendar,
  TrendingUp,
  Phone,
  MessageCircle
} from 'lucide-react';
import { PaymentConditionsTable } from '@/components/proposal/PaymentConditionsTable';

interface ShingleInvestmentSectionProps {
  totalPrice: number;
  discount?: number;
  validUntil: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export const ShingleInvestmentSection = ({ 
  totalPrice, 
  discount = 0, 
  validUntil,
  onAccept,
  onReject 
}: ShingleInvestmentSectionProps) => {
  const [selectedPaymentCondition, setSelectedPaymentCondition] = useState<string>('');
  
  const finalPrice = totalPrice - (totalPrice * discount / 100);
  const savings = totalPrice - finalPrice;

  const handleAcceptProposal = () => {
    if (!selectedPaymentCondition) {
      return;
    }
    onAccept?.();
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-gray-50 py-16" id="investment-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com Urgência */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full text-red-800 text-sm font-medium mb-4">
            ⚡ Oferta por Tempo Limitado - Apenas 5 vagas para instalação este mês
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🏡 Proteja Sua Casa com a Melhor Cobertura do Mercado
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Invista na durabilidade e beleza que sua casa merece. Qualidade americana com 30 anos de garantia.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content - Valor Total + Tabela */}
          <div className="lg:col-span-3 space-y-8">
            {/* Valor Total em Destaque Máximo */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                
                <div className="relative">
                  <div className="flex justify-center items-center mb-4">
                    <Star className="w-8 h-8 text-yellow-300 mr-3" />
                    <h3 className="text-2xl font-bold">Investimento Total do Projeto</h3>
                    <Star className="w-8 h-8 text-yellow-300 ml-3" />
                  </div>
                  
                  {discount > 0 && (
                    <div className="mb-4">
                      <div className="text-orange-200 text-lg mb-2">
                        <span className="line-through">
                          R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full inline-block text-sm font-semibold">
                        🎯 ECONOMIA DE {discount}% = R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-5xl sm:text-6xl font-bold mb-4">
                    R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  
                  <div className="text-lg text-orange-200 mb-4">
                    💳 Parcelamos em até 12x sem juros
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-orange-200">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-semibold">Válido até {validUntil}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparativo de Economia */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
                💰 Compare: Sua Economia em 25 Anos
              </h4>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600 mb-2">R$ 89.000</div>
                  <div className="font-medium text-red-900 mb-1">Telha Cerâmica</div>
                  <div className="text-sm text-red-700">+ Manutenções frequentes</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">R$ 75.000</div>
                  <div className="font-medium text-yellow-900 mb-1">Telha Metálica</div>
                  <div className="text-sm text-yellow-700">+ Substituições por oxidação</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 ring-2 ring-orange-300">
                  <div className="text-2xl font-bold text-green-600 mb-2">R$ {finalPrice.toLocaleString('pt-BR')}</div>
                  <div className="font-medium text-green-900 mb-1">Telha Shingle</div>
                  <div className="text-sm text-green-700">✅ Sua escolha inteligente</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold text-orange-600">
                  🎯 Você economiza mais de R$ 15.000 escolhendo Telha Shingle!
                </div>
              </div>
            </div>

            {/* Tabela de Condições de Pagamento */}
            <PaymentConditionsTable 
              totalPrice={finalPrice}
              selectedCondition={selectedPaymentCondition}
              onConditionChange={setSelectedPaymentCondition}
            />

            {/* CTAs Principais */}
            <div className="text-center">
              <div className="bg-white border-2 border-orange-200 rounded-xl p-8 shadow-lg">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  🚀 Pronto para Transformar Sua Casa?
                </h4>
                <p className="text-gray-600 mb-6">
                  {selectedPaymentCondition 
                    ? "Clique em 'ACEITAR PROPOSTA' e garante sua cobertura premium com qualidade americana!"
                    : "Selecione uma forma de pagamento acima para continuar"
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button 
                    onClick={handleAcceptProposal}
                    disabled={!selectedPaymentCondition}
                    className={`px-8 py-4 text-lg font-bold shadow-lg transform hover:scale-105 transition-all ${
                      selectedPaymentCondition 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
                    }`}
                    size="lg"
                  >
                    <CheckCircle className="w-6 h-6 mr-2" />
                    ✅ ACEITAR PROPOSTA
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-orange-300 text-orange-700 px-8 py-4 text-lg hover:bg-orange-50"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Quero Mais Informações
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-blue-300 text-blue-700 px-8 py-4 text-lg hover:bg-blue-50"
                    size="lg"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar Visita Técnica
                  </Button>
                </div>
                
                {!selectedPaymentCondition && (
                  <p className="text-orange-600 text-sm">
                    ⚠️ Selecione uma condição de pagamento para habilitar a aceitação
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Gatilhos e Urgência */}
          <div className="space-y-6">
            {/* Contador de Urgência */}
            <Card className="shadow-lg bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
              <CardContent className="p-6 text-center">
                <div className="text-red-600 mb-3">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <h4 className="font-bold text-lg">⏰ Oferta Expira em Breve!</h4>
                </div>
                
                <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold mb-3">
                  Válido até {validUntil}
                </div>
                
                <p className="text-red-700 text-sm mb-3">
                  Apenas <span className="font-bold">5 vagas</span> restantes para instalação este mês!
                </p>
                
                <div className="text-xs text-red-600">
                  🔥 Não perca esta oportunidade única
                </div>
              </CardContent>
            </Card>

            {/* Benefícios Inclusos */}
            <Card className="shadow-lg border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <h4 className="font-bold text-gray-900 mb-4 text-center">
                  ✅ Tudo Incluso na Proposta
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Garantia de 30 anos</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Instalação profissional completa</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Material de primeira linha</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Suporte técnico especializado</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Certificação americana Owens Corning</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Instalação em apenas 3 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prova Social */}
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-blue-600 mb-3">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <h4 className="font-bold text-lg">👥 Milhares Confiam em Nós</h4>
                </div>
                
                <div className="space-y-2 text-xs text-blue-700">
                  <p>✅ <span className="font-semibold">500+ casas</span> protegidas</p>
                  <p>⭐ <span className="font-semibold">98% satisfação</span> dos clientes</p>
                  <p>🏆 <span className="font-semibold">#2 no ranking</span> Forbes Home</p>
                  <p>🔒 <span className="font-semibold">Empresa certificada</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Contato Direto */}
            <Card className="shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
              <CardContent className="p-6 text-center">
                <h4 className="font-bold text-gray-900 mb-3">
                  💬 Dúvidas? Fale Conosco!
                </h4>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-center">
                    <Phone className="w-4 h-4 text-orange-600 mr-2" />
                    <span>(11) 99999-9999</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>WhatsApp disponível</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Conversar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};