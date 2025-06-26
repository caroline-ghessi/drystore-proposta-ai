
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRODUCT_GROUPS, ProductGroup } from '@/types/productGroups';

interface ProductGroupSelectorProps {
  selectedGroup: ProductGroup | null;
  onGroupSelect: (group: ProductGroup) => void;
}

export const ProductGroupSelector = ({ selectedGroup, onGroupSelect }: ProductGroupSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selecione o Grupo de Produtos
        </h2>
        <p className="text-gray-600">
          Escolha a categoria principal desta proposta para personalizar a apresentação
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCT_GROUPS.map((group) => (
          <Card
            key={group.id}
            className={`cursor-pointer transition-all border-2 ${
              selectedGroup === group.id 
                ? 'border-drystore-blue bg-blue-50 shadow-lg' 
                : group.color
            }`}
            onClick={() => onGroupSelect(group.id)}
          >
            <CardHeader className="text-center pb-3">
              <div className="text-3xl mb-2">{group.icon}</div>
              <CardTitle className="text-lg font-semibold">
                {group.name}
              </CardTitle>
              {selectedGroup === group.id && (
                <Badge className="bg-drystore-blue text-white">
                  Selecionado
                </Badge>
              )}
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">
                {group.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!selectedGroup && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ Selecione um grupo de produtos para continuar
          </p>
        </div>
      )}
    </div>
  );
};
