
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
    const solutionName = item.solution || 'Sua solução contempla';
    if (!acc[solutionName]) {
      acc[solutionName] = [];
    }
    acc[solutionName].push(item);
    return acc;
  }, {} as Record<string, ProposalItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([solutionName, solutionItems]) => (
        <Card key={solutionName} className="shadow-lg border-gray-200">
          <CardHeader className="bg-gradient-to-r from-drystore-orange to-drystore-orange-light border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <span className="text-2xl mr-3">🏗️</span>
              {solutionName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="grid gap-3">
              {solutionItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border-l-4 border-drystore-orange"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-drystore-orange rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-drystore-gray-dark font-medium leading-relaxed">
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
