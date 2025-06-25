
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Percent, Plus } from 'lucide-react';

interface RecommendedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
}

interface RecommendedProductsProps {
  products: RecommendedProduct[];
}

const RecommendedProducts = ({
  products
}: RecommendedProductsProps) => {
  console.log('🛍️ RecommendedProducts: Renderizando com produtos:', products);

  // Verificação de segurança para produtos vazios ou inválidos
  if (!products || products.length === 0) {
    console.log('🛍️ RecommendedProducts: Nenhum produto recomendado');
    return null;
  }

  // Filtrar produtos válidos
  const validProducts = products.filter(product => {
    const isValid = product && 
      typeof product.price === 'number' && 
      typeof product.originalPrice === 'number' &&
      product.price > 0 && 
      product.originalPrice > 0;
    
    if (!isValid) {
      console.warn('🛍️ RecommendedProducts: Produto inválido:', product);
    }
    
    return isValid;
  });

  if (validProducts.length === 0) {
    console.log('🛍️ RecommendedProducts: Nenhum produto válido após filtro');
    return null;
  }

  return (
    <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-orange-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Percent className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-orange-600">
                🎯 Maximize Seu Investimento!
              </h2>
              <p className="text-gray-600 text-sm">Produtos especiais selecionados especialmente para seu projeto</p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {validProducts.map(product => {
            const discountPercentage = Math.round((1 - product.price / product.originalPrice) * 100);
            
            return (
              <div key={product.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex space-x-4">
                  <img 
                    src={product.image || '/placeholder.svg'} 
                    alt={product.name} 
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-green-600">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          -{discountPercentage}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-3 bg-drystore-orange hover:bg-drystore-orange-light text-white" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar à Proposta
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full inline-block border">
            💡 <strong>Oferta Limitada:</strong> Adicione agora e economize até R$ 1.400!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedProducts;
