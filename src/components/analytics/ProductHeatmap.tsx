
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useProductAnalytics } from '@/hooks/useCompanyAnalytics';

export const ProductHeatmap = () => {
  const { data: products, isLoading, error } = useProductAnalytics();

  const getIntensityColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-orange-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heatmap de Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heatmap de Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 p-8">
            {error ? 'Erro ao carregar produtos' : 'Nenhum produto encontrado'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap de Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <div 
              key={index}
              className="relative p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
            >
              <div 
                className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getIntensityColor(product.percentage)}`}
                title={`${product.percentage}% de intensidade`}
              />
              <h4 className="font-medium text-sm mb-2">{product.name}</h4>
              <p className="text-lg font-bold text-gray-900">{product.sales}</p>
              <p className="text-xs text-gray-500">vendas últimos 30 dias</p>
              <Badge variant="secondary" className="mt-2">
                {product.percentage}% intensidade
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
