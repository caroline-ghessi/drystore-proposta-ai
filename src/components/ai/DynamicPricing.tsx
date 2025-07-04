
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TrendingUp, AlertTriangle, DollarSign, Brain } from 'lucide-react';

export const DynamicPricing = () => {
  const recommendations = [
    {
      product: 'Placas Drywall 12,5mm',
      currentPrice: 25.00,
      suggestedPrice: 27.50,
      reason: 'Alta demanda + baixo estoque',
      impact: '+10% margem',
      confidence: 92
    },
    {
      product: 'Perfis de Aço',
      currentPrice: 8.50,
      suggestedPrice: 8.20,
      reason: 'Concorrência agressiva',
      impact: '+15% vendas',
      confidence: 87
    },
    {
      product: 'Massa para Junta',
      currentPrice: 45.00,
      suggestedPrice: 46.80,
      reason: 'Sazonalidade favorável',
      impact: '+8% margem',
      confidence: 78
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Precificação Dinâmica com IA
        </CardTitle>
        <p className="text-sm text-gray-600">
          Recomendações automáticas de preços baseadas em demanda, estoque e concorrência
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Sistema de Precificação Automática</span>
            </div>
            <Switch />
          </div>

          {recommendations.map((rec, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{rec.product}</h4>
                <Badge variant="outline" className="text-green-600">
                  Confiança: {rec.confidence}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Preço Atual</p>
                  <p className="font-bold">R$ {rec.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preço Sugerido</p>
                  <p className="font-bold text-green-600">R$ {rec.suggestedPrice.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Motivo:</strong> {rec.reason}</p>
                <p><strong>Impacto previsto:</strong> {rec.impact}</p>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">
                  Aplicar Sugestão
                </Button>
                <Button size="sm" variant="ghost">
                  Ignorar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
