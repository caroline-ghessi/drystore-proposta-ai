
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ShoppingCart } from 'lucide-react';
import { RecommendedProduct } from '@/types/recommendations';

interface AddCustomProductDialogProps {
  onAddCustomProduct: (product: RecommendedProduct) => void;
}

const AddCustomProductDialog = ({ onAddCustomProduct }: AddCustomProductDialogProps) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    reason: ''
  });

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
      category: 'custom',
      validated: true
    };

    onAddCustomProduct(newRecommendation);
    setCustomProduct({ name: '', description: '', price: 0, originalPrice: 0, reason: '' });
    setShowAddCustom(false);
  };

  return (
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
              placeholder="Ex: Kit de Isolamento Térmo"
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
  );
};

export default AddCustomProductDialog;
