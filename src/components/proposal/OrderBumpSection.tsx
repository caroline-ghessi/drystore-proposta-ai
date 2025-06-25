
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Clock, Star } from 'lucide-react';

interface OrderBumpItem {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  urgencyMessage: string;
  category: string;
}

interface OrderBumpSectionProps {
  items?: OrderBumpItem[];
  onItemsChange?: (selectedItems: OrderBumpItem[], totalValue: number) => void;
}

export const OrderBumpSection = ({ items = [], onItemsChange }: OrderBumpSectionProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Mock data se não houver itens
  const defaultItems: OrderBumpItem[] = [
    {
      id: '1',
      name: 'Sistema de Iluminação LED Inteligente',
      description: 'Controle total da iluminação via app com 16 milhões de cores',
      originalPrice: 2500,
      discountedPrice: 1999,
      discount: 20,
      urgencyMessage: 'Apenas hoje!',
      category: 'Automação'
    },
    {
      id: '2',
      name: 'Câmeras de Segurança 4K',
      description: 'Sistema completo com 4 câmeras e monitoramento 24h',
      originalPrice: 1800,
      discountedPrice: 1440,
      discount: 20,
      urgencyMessage: 'Oferta limitada',
      category: 'Segurança'
    },
    {
      id: '3',
      name: 'Central de Ar Condicionado Smart',
      description: 'Climatização inteligente com economia de energia',
      originalPrice: 3200,
      discountedPrice: 2720,
      discount: 15,
      urgencyMessage: 'Últimas unidades',
      category: 'Climatização'
    }
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  const handleItemToggle = (item: OrderBumpItem, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    
    if (checked) {
      newSelectedItems.add(item.id);
    } else {
      newSelectedItems.delete(item.id);
    }
    
    setSelectedItems(newSelectedItems);
    
    // Calcular valor total dos itens selecionados
    const selectedItemsList = displayItems.filter(item => newSelectedItems.has(item.id));
    const totalValue = selectedItemsList.reduce((sum, item) => sum + item.discountedPrice, 0);
    
    onItemsChange?.(selectedItemsList, totalValue);
  };

  const totalSelectedValue = displayItems
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.discountedPrice, 0);

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-6">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🎯 Complemente Sua Solução
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Aproveite ofertas exclusivas para tornar sua casa ainda mais inteligente e segura
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {displayItems.map((item) => (
            <Card key={item.id} className="relative hover:shadow-lg transition-shadow">
              {/* Badge de urgência */}
              <div className="absolute -top-2 -right-2 z-10">
                <Badge className="bg-red-500 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.urgencyMessage}
                </Badge>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{item.name}</CardTitle>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Preços */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 line-through">
                        R$ {item.originalPrice.toLocaleString('pt-BR')}
                      </span>
                      <Badge className="bg-green-600 text-white text-xs">
                        -{item.discount}%
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      R$ {item.discountedPrice.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-600">
                      ou 12x de R$ {(item.discountedPrice / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Checkbox para adicionar */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={(checked) => handleItemToggle(item, checked as boolean)}
                    />
                    <label 
                      htmlFor={`item-${item.id}`} 
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      Adicionar à minha proposta
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo dos itens selecionados */}
        {selectedItems.size > 0 && (
          <Card className="bg-white border-2 border-orange-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Itens Adicionados ({selectedItems.size})
                  </h3>
                  <p className="text-gray-600">
                    Complementos selecionados para sua proposta
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    +R$ {totalSelectedValue.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Valor adicional
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
