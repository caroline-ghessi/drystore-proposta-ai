
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Sparkles, 
  Check, 
  X, 
  Plus, 
  Bot, 
  ShoppingCart, 
  TrendingUp,
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { RecommendedProduct } from '@/types/recommendations';

interface AIRecommendationManagerProps {
  proposalItems: any[];
  clientProfile?: any;
  totalValue: number;
  onRecommendationsUpdate: (recommendations: RecommendedProduct[]) => void;
}

const AIRecommendationManager = ({
  proposalItems,
  clientProfile,
  totalValue,
  onRecommendationsUpdate
}: AIRecommendationManagerProps) => {
  const {
    generateRecommendations,
    validateRecommendation,
    addCustomRecommendation,
    removeRecommendation,
    recommendations,
    isGenerating
  } = useAIRecommendations();

  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    reason: ''
  });

  useEffect(() => {
    // Gerar recomendações automaticamente quando os itens da proposta mudarem
    if (proposalItems.length > 0) {
      generateRecommendations({
        proposalItems,
        clientProfile,
        totalValue
      });
    }
  }, [proposalItems, totalValue]);

  useEffect(() => {
    // Notificar componente pai sobre mudanças nas recomendações
    onRecommendationsUpdate(recommendations);
  }, [recommendations, onRecommendationsUpdate]);

  const handleValidateRecommendation = (productId: string, approved: boolean) => {
    validateRecommendation(productId, approved);
  };

  const handleAddCustomProduct = () => {
    if (!customProduct.name || !customProduct.price) return;

    const newRecommendation: RecommendedProduct = {
      productId: `custom-${Date.now()}`,
      name: customProduct.name,
      description: customProduct.description,
      price: customProduct.price,
      originalPrice: customProduct.originalPrice || customProduct.price,
      image: '/placeholder.svg',
      reason: customProduct.reason,
      discount: Math.round((1 - customProduct.price / (customProduct.originalPrice || customProduct.price)) * 100),
      category: 'custom'
    };

    addCustomRecommendation(newRecommendation);
    setCustomProduct({ name: '', description: '', price: 0, originalPrice: 0, reason: '' });
    setShowAddCustom(false);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-600" />
          Recomendações Inteligentes
          <Badge className="ml-2 bg-blue-100 text-blue-800">
            <Sparkles className="w-3 h-3 mr-1" />
            IA
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Analisando proposta e gerando recomendações...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Nenhuma recomendação gerada ainda</p>
            <Button 
              variant="outline" 
              onClick={() => generateRecommendations({ proposalItems, clientProfile, totalValue })}
              className="mt-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Recomendações
            </Button>
          </div>
        ) : (
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
                <div 
                  key={product.productId}
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
                      onClick={() => handleValidateRecommendation(product.productId, true)}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant={product.validated === false ? "destructive" : "outline"}
                      onClick={() => handleValidateRecommendation(product.productId, false)}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRecommendation(product.productId)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto Personalizado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Recomendação Personalizada</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-name">Nome do Produto</Label>
                    <Input
                      id="custom-name"
                      value={customProduct.name}
                      onChange={(e) => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Kit de Isolamento Térnico"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-description">Descrição</Label>
                    <Input
                      id="custom-description"
                      value={customProduct.description}
                      onChange={(e) => setCustomProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descrição do produto"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="custom-original-price">Preço Original</Label>
                      <Input
                        id="custom-original-price"
                        type="number"
                        step="0.01"
                        value={customProduct.originalPrice || ''}
                        onChange={(e) => setCustomProduct(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-price">Preço Promocional</Label>
                      <Input
                        id="custom-price"
                        type="number"
                        step="0.01"
                        value={customProduct.price || ''}
                        onChange={(e) => setCustomProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="custom-reason">Motivo da Recomendação</Label>
                    <Textarea
                      id="custom-reason"
                      value={customProduct.reason}
                      onChange={(e) => setCustomProduct(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Por que este produto é importante para o cliente?"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowAddCustom(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCustomProduct} className="flex-1">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationManager;
