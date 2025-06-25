
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Plus, Shield, Zap } from 'lucide-react';

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

interface RecommendedSolutionCardProps {
  solution: RecommendedSolution;
  isSelected: boolean;
  onSelect: (solution: RecommendedSolution) => void;
}

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

export const RecommendedSolutionCard = ({
  solution,
  isSelected,
  onSelect
}: RecommendedSolutionCardProps) => {
  const IconComponent = getCategoryIcon(solution.category);
  const discountPercentage = Math.round((1 - solution.price / solution.originalPrice) * 100);

  return (
    <Card 
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
          onClick={() => onSelect(solution)}
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
};
