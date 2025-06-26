
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, AlertCircle } from 'lucide-react';

interface ProposalItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ProposalItemsManagerProps {
  items: ProposalItem[];
  onUpdateItem: (itemId: string, field: string, value: number | string) => void;
  onRemoveItem: (itemId: string) => void;
  onAddItem: () => void;
  error?: string;
  showDetailedValues?: boolean;
}

export const ProposalItemsManager = ({ 
  items, 
  onUpdateItem, 
  onRemoveItem, 
  onAddItem, 
  error,
  showDetailedValues = true
}: ProposalItemsManagerProps) => {
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProposalItem[]>);

  const renderDetailedView = (item: ProposalItem) => (
    <>
      {/* Desktop View - Detalhada */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg">
        <div className="md:col-span-4">
          <Label className="text-xs text-gray-500">Descrição</Label>
          <Input
            value={item.description}
            onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
            className="text-sm"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label className="text-xs text-gray-500">Qtd</Label>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        </div>
        
        <div className="md:col-span-1">
          <Label className="text-xs text-gray-500">Un</Label>
          <Input
            value={item.unit}
            onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
            className="text-sm"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label className="text-xs text-gray-500">Preço Un.</Label>
          <Input
            type="number"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => onUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label className="text-xs text-gray-500">Total</Label>
          <div className="text-sm font-medium p-2 bg-white rounded border">
            R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile View - Detalhada */}
      <div className="md:hidden bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm text-gray-700">Item #{item.id}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div>
          <Label className="text-xs text-gray-500">Descrição</Label>
          <Input
            value={item.description}
            onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
            className="text-sm mt-1"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500">Quantidade</Label>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
              className="text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Unidade</Label>
            <Input
              value={item.unit}
              onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
              className="text-sm mt-1"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-gray-500">Preço Unitário</Label>
          <Input
            type="number"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => onUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
            className="text-sm mt-1"
          />
        </div>
        
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total:</span>
            <span className="font-bold text-blue-600">
              R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const renderSimplifiedView = (item: ProposalItem) => (
    <>
      {/* Desktop View - Simplificada */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg">
        <div className="md:col-span-9">
          <Label className="text-xs text-gray-500">Descrição do Item</Label>
          <Input
            value={item.description}
            onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
            className="text-sm"
            placeholder="Ex: RU PLACA GESSO G,K,P 12,5 1200X1800MM para 200m² de parede"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label className="text-xs text-gray-500">Valor Total</Label>
          <div className="text-sm font-medium p-2 bg-white rounded border">
            R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile View - Simplificada */}
      <div className="md:hidden bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm text-gray-700">Item #{item.id}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div>
          <Label className="text-xs text-gray-500">Descrição do Item</Label>
          <Input
            value={item.description}
            onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
            className="text-sm mt-1"
            placeholder="Ex: RU PLACA GESSO G,K,P 12,5 1200X1800MM para 200m² de parede"
          />
        </div>
        
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Valor Total:</span>
            <span className="font-bold text-blue-600">
              R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category} className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-drystore-blue" />
                {category}
              </CardTitle>
              <Badge variant="secondary">
                {categoryItems.length} item(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryItems.map((item) => (
                <div key={item.id}>
                  {showDetailedValues ? renderDetailedView(item) : renderSimplifiedView(item)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button 
        variant="outline" 
        onClick={onAddItem}
        className="w-full border-dashed border-2 h-12"
      >
        + Adicionar Novo Item
      </Button>
    </>
  );
};
