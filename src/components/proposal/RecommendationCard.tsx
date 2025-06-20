
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { RecommendedProduct } from '@/types/recommendations';

interface RecommendationCardProps {
  product: RecommendedProduct;
  onValidate: (productId: string, approved: boolean) => void;
  onRemove: (productId: string) => void;
}

const RecommendationCard = ({ product, onValidate, onRemove }: RecommendationCardProps) => {
  return (
    <div 
      className={`border rounded-lg p-4 ${
        product.validated === true 
          ? 'border-green-200 bg-green-50' 
          : product.validated === false 
          ? 'border-red-200 bg-red-50'
          : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-600">{product.description}</p>
          <p className="text-xs text-blue-600 mt-1">{product.reason}</p>
        </div>
        <div className="text-right ml-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 line-through">
              R$ {product.originalPrice.toFixed(2)}
            </span>
            <span className="font-bold text-green-600">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs mt-1">
            -{product.discount}%
          </Badge>
        </div>
      </div>

      {product.urgencyMessage && (
        <div className="bg-orange-100 text-orange-800 text-xs p-2 rounded mb-2">
          ⚠️ {product.urgencyMessage}
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          size="sm"
          variant={product.validated === true ? "default" : "outline"}
          onClick={() => onValidate(product.productId, true)}
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-1" />
          Aprovar
        </Button>
        <Button
          size="sm"
          variant={product.validated === false ? "destructive" : "outline"}
          onClick={() => onValidate(product.productId, false)}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-1" />
          Rejeitar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(product.productId)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RecommendationCard;
