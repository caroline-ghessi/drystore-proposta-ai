import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, ArrowRight, SkipForward } from 'lucide-react';
import { useProposalDetails } from '@/hooks/useProposalDetails';
import { useState } from 'react';

const ProposalAcceptedThanks = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { data: proposal } = useProposalDetails(proposalId || '');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const recommendedExtras = [
    {
      id: 'manutencao',
      title: '🔧 Plano de Manutenção Premium',
      description: 'Manutenção preventiva e corretiva por 3 anos',
      originalPrice: 15000,
      specialPrice: 8500,
      discount: '43% OFF',
      benefits: ['Visitas trimestrais', 'Peças inclusas', 'Prioridade no atendimento']
    },
    {
      id: 'monitoramento',
      title: '📱 Sistema de Monitoramento Remoto',
      description: 'Acompanhe sua produção em tempo real via app',
      originalPrice: 25000,
      specialPrice: 15000,
      discount: '40% OFF',
      benefits: ['App mobile', 'Alertas automáticos', 'Relatórios mensais']
    },
    {
      id: 'treinamento',
      title: '👨‍🏫 Treinamento Avançado da Equipe',
      description: 'Capacitação completa para máximo aproveitamento',
      originalPrice: 8000,
      specialPrice: 4500,
      discount: '44% OFF',
      benefits: ['8 horas de treinamento', 'Material didático', 'Certificado']
    }
  ];

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleAcceptExtras = () => {
    if (selectedExtras.length > 0) {
      navigate(`/proposal-extras-confirmation/${proposalId}?extras=${selectedExtras.join(',')}`);
    }
  };

  const handleSkipExtras = () => {
    navigate(`/proposal-final-thanks/${proposalId}`);
  };

  const totalExtrasValue = selectedExtras.reduce((total, extraId) => {
    const extra = recommendedExtras.find(e => e.id === extraId);
    return total + (extra?.specialPrice || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Parabéns! Proposta Aceita!
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            Obrigado pela confiança, {proposal?.clients?.nome?.split(' ')[0]}!
          </p>
          
          <p className="text-lg text-gray-500">
            Sua solução de energia solar já está sendo preparada
          </p>
        </div>

        {/* Special Offers */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            ⚡ Ofertas Exclusivas para Você!
          </h2>
          <p className="text-lg opacity-90">
            Por ter escolhido nosso sistema solar, temos descontos especiais em produtos complementares
          </p>
        </div>

        {/* Recommended Products */}
        <div className="space-y-6 mb-8">
          {recommendedExtras.map((extra) => (
            <Card 
              key={extra.id} 
              className={`cursor-pointer transition-all duration-300 ${
                selectedExtras.includes(extra.id) 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleExtraToggle(extra.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mr-3">
                        {extra.title}
                      </h3>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {extra.discount}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {extra.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {extra.benefits.map((benefit, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          ✓ {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-gray-400 line-through text-lg">
                      R$ {extra.originalPrice.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      R$ {extra.specialPrice.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Economia: R$ {(extra.originalPrice - extra.specialPrice).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                
                {selectedExtras.includes(extra.id) && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Selecionado para adicionar à proposta</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Summary */}
        {selectedExtras.length > 0 && (
          <Card className="bg-blue-50 border-blue-200 mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                📋 Resumo dos Extras Selecionados
              </h3>
              
              <div className="space-y-2 mb-4">
                {selectedExtras.map(extraId => {
                  const extra = recommendedExtras.find(e => e.id === extraId);
                  return extra && (
                    <div key={extraId} className="flex justify-between items-center">
                      <span className="text-gray-700">{extra.title}</span>
                      <span className="font-semibold text-blue-700">
                        R$ {extra.specialPrice.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-blue-200 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-blue-900">
                  <span>Total dos Extras:</span>
                  <span>R$ {totalExtrasValue.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleAcceptExtras}
            disabled={selectedExtras.length === 0}
            className={`px-8 py-4 text-lg font-semibold ${
              selectedExtras.length > 0 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-300'
            }`}
            size="lg"
          >
            <Star className="w-5 h-5 mr-2" />
            Adicionar Extras Selecionados
            {selectedExtras.length > 0 && (
              <span className="ml-2 bg-white text-green-600 px-2 py-1 rounded-full text-sm">
                {selectedExtras.length}
              </span>
            )}
          </Button>
          
          <Button
            onClick={handleSkipExtras}
            variant="outline"
            className="px-8 py-4 text-lg font-semibold border-gray-300"
            size="lg"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Pular Ofertas e Continuar
          </Button>
        </div>

        {/* Trust Elements */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            ⚡ Ofertas válidas apenas neste momento • 🔒 Pagamento 100% seguro • 📞 Suporte dedicado
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProposalAcceptedThanks;