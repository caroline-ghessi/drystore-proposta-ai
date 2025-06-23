
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProposalItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number; // Mudado de 'total' para 'totalPrice'
}

interface ProposalItemsTableProps {
  items: ProposalItem[];
  totalPrice: number;
}

const ProposalItemsTable = ({ items, totalPrice }: ProposalItemsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens da Proposta</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Descrição</th>
                  <th className="text-center py-3">Qtd</th>
                  <th className="text-center py-3">Un</th>
                  <th className="text-right py-3">Preço Un.</th>
                  <th className="text-right py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 font-medium">{item.description}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-center">{item.unit}</td>
                    <td className="py-3 text-right">R$ {item.unitPrice?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 text-right font-semibold">
                      R$ {item.totalPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">{item.description}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Quantidade:</span>
                  <p className="font-medium">{item.quantity} {item.unit}</p>
                </div>
                <div>
                  <span className="text-gray-600">Preço Unitário:</span>
                  <p className="font-medium">R$ {item.unitPrice?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    R$ {item.totalPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              R$ {totalPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalItemsTable;
