
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { RecommendedProduct } from '@/types/recommendations';
import RecommendationCard from './RecommendationCard';
import AddCustomProductDialog from './AddCustomProductDialog';

interface RecommendationsListProps {
  recommendations: RecommendedProduct[];
  onValidateRecommendation: (productId: string, approved: boolean) => void;
  onRemoveRecommendation: (productId: string) => void;
  onAddCustomRecommendation: (product: RecommendedProduct) => void;
}

const RecommendationsList = ({
  recommendations,
  onValidateRecommendation,
  onRemoveRecommendation,
  onAddCustomRecommendation
}: RecommendationsListProps) => {
  return (
    <>
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <div className="flex items-center mb-1">
          <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">
            {recommendations.length} recomendações geradas
          </span>
        </div>
        <p className="text-xs text-blue-700">
          Valide as sugestões abaixo ou adicione produtos personalizados
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((product) => (
          <RecommendationCard
            key={product.productId}
            product={product}
            onValidate={onValidateRecommendation}
            onRemove={onRemoveRecommendation}
          />
        ))}
      </div>

      <AddCustomProductDialog onAddCustomProduct={onAddCustomRecommendation} />
    </>
  );
};

export default RecommendationsList;
