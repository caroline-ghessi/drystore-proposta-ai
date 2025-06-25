
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProposalItem {
  description: string;
  solution?: string;
}

interface ProposalItemsTableProps {
  items: ProposalItem[];
}

const ProposalItemsTable = ({ items }: ProposalItemsTableProps) => {
  // Agrupar itens por solução
  const groupedItems = items.reduce((acc, item) => {
    const solutionName = item.solution || 'Materiais Diversos';
    if (!acc[solutionName]) {
      acc[solutionName] = [];
    }
    acc[solutionName].push(item);
    return acc;
  }, {} as Record<string, ProposalItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([solutionName, solutionItems]) => (
        <Card key={solutionName} className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">🏗️</span>
              {solutionName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-3">
              {solutionItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProposalItemsTable;
