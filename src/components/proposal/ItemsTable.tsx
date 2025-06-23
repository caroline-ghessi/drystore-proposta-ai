
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';

interface ExtractedItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ItemsTableProps {
  items: ExtractedItem[];
  errors: {[key: string]: string};
  onUpdateItem: (index: number, field: keyof ExtractedItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

const ItemsTable = ({ items, errors, onUpdateItem, onAddItem, onRemoveItem }: ItemsTableProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Itens da Proposta</h3>
        <Button onClick={onAddItem} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {errors.items && (
        <div className="text-red-600 text-sm">{errors.items}</div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Descrição</TableHead>
              <TableHead className="w-[15%]">Quantidade</TableHead>
              <TableHead className="w-[10%]">Unidade</TableHead>
              <TableHead className="w-[15%]">Valor Unit. (R$)</TableHead>
              <TableHead className="w-[15%]">Total (R$)</TableHead>
              <TableHead className="w-[5%]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                    className={errors[`item-${index}-description`] ? 'border-red-500' : ''}
                    placeholder="Descrição do item"
                  />
                  {errors[`item-${index}-description`] && (
                    <div className="text-red-600 text-xs mt-1">
                      {errors[`item-${index}-description`]}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className={errors[`item-${index}-quantity`] ? 'border-red-500' : ''}
                    min="0"
                    step="0.01"
                  />
                  {errors[`item-${index}-quantity`] && (
                    <div className="text-red-600 text-xs mt-1">
                      {errors[`item-${index}-quantity`]}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    value={item.unit}
                    onChange={(e) => onUpdateItem(index, 'unit', e.target.value)}
                    placeholder="UN"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className={errors[`item-${index}-unitPrice`] ? 'border-red-500' : ''}
                    min="0"
                    step="0.01"
                  />
                  {errors[`item-${index}-unitPrice`] && (
                    <div className="text-red-600 text-xs mt-1">
                      {errors[`item-${index}-unitPrice`]}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => onRemoveItem(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ItemsTable;
