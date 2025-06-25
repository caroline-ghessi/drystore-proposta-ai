
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, Shield, Zap, CheckCircle, Plus, Trophy, Clock, Gift } from 'lucide-react';

interface RecommendedSolution {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  features: string[];
  image?: string;
  rating: number;
  popular?: boolean;
}

interface RecommendedSolutionsSectionProps {
  solutions?: RecommendedSolution[];
  onSolutionSelect?: (solution: RecommendedSolution) => void;
  selectedSolutions?: Array<{ id: string; price: number }>;
  onCloseDeal?: () => void;
}

export const RecommendedSolutionsSection = ({ 
  solutions = [], 
  onSolutionSelect,
  selectedSolutions = [],
  onCloseDeal
}: RecommendedSolutionsSectionProps) => {
  
  // Mock data se não houver soluções
  const defaultSolutions: RecommendedSolution[] = [
    {
      id: '1',
      name: 'Sistema de Segurança Premium',
      description: 'Proteção completa com câmeras 4K, sensores e monitoramento 24h',
      price: 4500,
      originalPrice: 5625,
      category: 'Segurança',
      features: ['Câmeras 4K', 'Sensores de movimento', 'App mobile', 'Armazenamento na nuvem'],
      rating: 4.9,
      popular: true
    },
    {
      id: '2',
      name: 'Automação Residencial Completa',
      description: 'Controle total da casa: iluminação, climatização e eletrodomésticos',
      price: 6800,
      originalPrice: 8500,
      category: 'Automação',
      features: ['Controle de luzes', 'Termostato inteligente', 'Tomadas smart', 'Assistente virtual'],
      rating: 4.8
    },
    {
      id: '3',
      name: 'Sistema de Energia Solar',
      description: 'Geração própria de energia com economia de até 95% na conta de luz',
      price: 12500,
      originalPrice: 15625,
      category: 'Sustentabilidade',
      features: ['Painéis de alta eficiência', 'Inversor inteligente', 'Monitoramento', 'Garantia 25 anos'],
      rating: 4.7
    },
    {
      id: '4',
      name: 'Áudio e Vídeo Multiroom',
      description: 'Som ambiente em todos os cômodos com qualidade profissional',
      price: 3200,
      originalPrice: 4000,
      category: 'Entretenimento',
      features: ['Caixas embutidas', 'Central de áudio', 'Controle por app', 'Streaming integrado'],
      rating: 4.6
    }
  ];

  const displaySolutions = solutions.length > 0 ? solutions : defaultSolutions;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'segurança':
        return Shield;
      case 'automação':
        return Zap;
      default:
        return Star;
    }
  };

  const isSolutionSelected = (solutionId: string) => {
    return selectedSolutions.some(s => s.id === solutionId);
  };

  // Cálculos para a seção de economia
  const selectedSolutionsData = displaySolutions.filter(solution => 
    selectedSolutions.some(s => s.id === solution.id)
  );
  
  const totalSelectedValue = selectedSolutionsData.reduce((sum, solution) => sum + solution.price, 0);
  const totalOriginalValue = selectedSolutionsData.reduce((sum, solution) => sum + solution.originalPrice, 0);
  const totalSavings = totalOriginalValue - totalSelectedValue;
  const savingsPercentage = totalOriginalValue > 0 ? Math.round((totalSavings / totalOriginalValue) * 100) : 0;

  // Desconto extra por quantidade (bônus)
  const bonusDiscount = selectedSolutions.length >= 2 ? selectedSolutions.length * 150 : 0;
  const finalValue = totalSelectedValue - bonusDiscount;
  const totalEconomy = totalSavings + bonusDiscount;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          🎯 Soluções Recomendadas Para Você
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Baseado no seu perfil, selecionamos essas soluções que podem completar perfeitamente seu projeto
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displaySolutions.map((solution) => {
          const IconComponent = getCategoryIcon(solution.category);
          const isSelected = isSolutionSelected(solution.id);
          const discountPercentage = Math.round((1 - solution.price / solution.originalPrice) * 100);
          
          return (
            <Card 
              key={solution.id} 
              className={`relative hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              {solution.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    ⭐ Mais Popular
                  </Badge>
                </div>
              )}

              {isSelected && (
                <div className="absolute -top-3 right-3 z-10">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {solution.category}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {solution.name}
                </CardTitle>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {solution.description}
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${
                        star <= solution.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {solution.rating}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">Principais recursos:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {solution.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div className="pt-4 border-t">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-500 line-through">
                        R$ {solution.originalPrice.toLocaleString('pt-BR')}
                      </span>
                      <Badge className="bg-red-500 text-white text-xs">
                        -{discountPercentage}%
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {solution.price.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      ou 12x de R$ {(solution.price / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => onSolutionSelect?.(solution)}
                  className={`w-full ${
                    isSelected 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  size="sm"
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Selecionado
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Section - Similar to reference image */}
      {selectedSolutions.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border-2 border-green-200">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Economy Calculation */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Sua Economia Total
                </h3>
                <p className="text-gray-600">
                  Complementos selecionados com desconto especial
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Valor original dos complementos:</span>
                  <span className="font-semibold text-gray-900 line-through">
                    R$ {totalOriginalValue.toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Desconto aplicado ({savingsPercentage}%):</span>
                  <span className="font-semibold text-green-600">
                    -R$ {totalSavings.toLocaleString('pt-BR')}
                  </span>
                </div>

                {bonusDiscount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700 flex items-center">
                      <Gift className="w-4 h-4 mr-1 text-purple-500" />
                      Bônus múltipla seleção:
                    </span>
                    <span className="font-semibold text-purple-600">
                      -R$ {bonusDiscount.toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg px-4 border-2 border-green-300">
                  <span className="font-bold text-gray-900">Valor final dos complementos:</span>
                  <span className="text-2xl font-bold text-green-700">
                    R$ {finalValue.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-full">
                    <Trophy className="w-5 h-5 mr-2" />
                    <span className="font-bold">
                      Você economiza R$ {totalEconomy.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Benefits and CTA */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Benefícios Exclusivos
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                    Garantia estendida de 3 anos
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                    Instalação profissional inclusa
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                    Suporte técnico 24/7
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                    Parcelamento em até 12x sem juros
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 mr-3 text-blue-500" />
                    Instalação em até 15 dias
                  </li>
                </ul>
              </div>

              {/* Close Deal Button */}
              <div className="text-center">
                <Button 
                  onClick={onCloseDeal}
                  size="lg" 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Trophy className="w-6 h-6 mr-3" />
                  Fechar Proposta com Complementos
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  ⏰ Oferta válida por tempo limitado
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action for non-selected */}
      {selectedSolutions.length === 0 && (
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quer uma Consultoria Personalizada?
              </h3>
              <p className="text-gray-600 mb-6">
                Nossos especialistas podem ajudar você a escolher a combinação perfeita de soluções
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Falar com Especialista
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
