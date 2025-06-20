
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ProductHeatmap = () => {
  const products = [
    { name: 'Placas Drywall 12,5mm', sales: 450, percentage: 85 },
    { name: 'Perfis de Aço', sales: 380, percentage: 72 },
    { name: 'Massa para Junta', sales: 320, percentage: 61 },
    { name: 'Parafusos', sales: 280, percentage: 53 },
    { name: 'Fita para Junta', sales: 220, percentage: 42 },
    { name: 'Tinta Primer', sales: 180, percentage: 34 },
  ];

  const getIntensityColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-orange-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

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
              <p className="text-xs text-gray-500">vendas este mês</p>
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
