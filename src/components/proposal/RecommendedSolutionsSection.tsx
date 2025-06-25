
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, Shield, Zap, CheckCircle, Plus } from 'lucide-react';

interface RecommendedSolution {
  id: string;
  name: string;
  description: string;
  price: number;
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
}

export const RecommendedSolutionsSection = ({ 
  solutions = [], 
  onSolutionSelect,
  selectedSolutions = []
}: RecommendedSolutionsSectionProps) => {
  
  // Mock data se não houver soluções
  const defaultSolutions: RecommendedSolution[] = [
    {
      id: '1',
      name: 'Sistema de Segurança Premium',
      description: 'Proteção completa com câmeras 4K, sensores e monitoramento 24h',
      price: 4500,
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
      category: 'Automação',
      features: ['Controle de luzes', 'Termostato inteligente', 'Tomadas smart', 'Assistente virtual'],
      rating: 4.8
    },
    {
      id: '3',
      name: 'Sistema de Energia Solar',
      description: 'Geração própria de energia com economia de até 95% na conta de luz',
      price: 12500,
      category: 'Sustentabilidade',
      features: ['Painéis de alta eficiência', 'Inversor inteligente', 'Monitoramento', 'Garantia 25 anos'],
      rating: 4.7
    },
    {
      id: '4',
      name: 'Áudio e Vídeo Multiroom',
      description: 'Som ambiente em todos os cômodos com qualidade profissional',
      price: 3200,
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

  const getTotalSelectedValue = () => {
    return selectedSolutions.reduce((sum, solution) => sum + solution.price, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Soluções Recomendadas Para Você
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Baseado no seu perfil, selecionamos essas soluções que podem completar perfeitamente seu projeto
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displaySolutions.map((solution) => {
          const IconComponent = getCategoryIcon(solution.category);
          const isSelected = isSolutionSelected(solution.id);
          
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

      {/* Selected Solutions Summary */}
      {selectedSolutions.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  🎉 Soluções Adicionadas ({selectedSolutions.length})
                </h3>
                <p className="text-green-700">
                  Itens extras selecionados para sua proposta
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">
                  +R$ {getTotalSelectedValue().toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-green-600">
                  Valor adicional
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
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
    </div>
  );
};
