
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import { useRecommendedProducts, type RecommendedProduct } from '@/hooks/useRecommendedProducts';

interface RecommendedProductSelectorProps {
  selectedProducts: string[];
  onSelectedProductsChange: (productIds: string[]) => void;
}

const RecommendedProductSelector = ({
  selectedProducts,
  onSelectedProductsChange
}: RecommendedProductSelectorProps) => {
  const { data: products = [], isLoading } = useRecommendedProducts();

  const handleProductToggle = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectedProductsChange([...selectedProducts, productId]);
    } else {
      onSelectedProductsChange(selectedProducts.filter(id => id !== productId));
    }
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      'ferramentas': 'bg-orange-100 text-orange-800',
      'servicos': 'bg-blue-100 text-blue-800',
      'materiais': 'bg-green-100 text-green-800',
      'acessorios': 'bg-purple-100 text-purple-800'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalSelectedValue = products
    .filter(p => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + p.preco, 0);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2 text-drystore-blue" />
          Produtos Recomendados (Order Bump)
        </CardTitle>
        <p className="text-sm text-gray-600">
          Selecione produtos que serão oferecidos como complemento à proposta principal
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-drystore-blue mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum produto recomendado disponível</p>
            <p className="text-xs">Entre em contato com o administrador</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              
              return (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => 
                        handleProductToggle(product.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Label 
                          htmlFor={`product-${product.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {product.nome}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={getCategoryColor(product.categoria)}
                          >
                            {product.categoria}
                          </Badge>
                          <span className="text-sm font-bold text-drystore-blue">
                            R$ {product.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      {product.descricao && (
                        <p className="text-xs text-gray-600">{product.descricao}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {selectedProducts.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-green-900">
                  <TrendingUp className="w-4 h-4" />
                  Produtos Selecionados para Order Bump:
                </div>
                <div className="text-xs text-green-700 mt-1">
                  {selectedProducts.length} produto(s) • Valor total: R$ {
                    totalSelectedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedProductSelector;
