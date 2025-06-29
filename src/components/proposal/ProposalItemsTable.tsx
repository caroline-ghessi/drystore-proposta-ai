
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProposalItem {
  description: string;
  solution?: string;
}

interface ProposalItemsTableProps {
  items: ProposalItem[];
}

const ProposalItemRow: React.FC<{ item: ProposalItem; index: number }> = React.memo(({ item, index }) => (
  <div 
    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border-l-4 border-drystore-orange"
  >
    <div className="flex-shrink-0 w-6 h-6 bg-drystore-orange rounded-full flex items-center justify-center mt-0.5">
      <span className="text-white text-xs">✓</span>
    </div>
    <p className="text-drystore-gray-dark font-medium leading-relaxed">
      {item.description}
    </p>
  </div>
));

ProposalItemRow.displayName = 'ProposalItemRow';

const SolutionSection: React.FC<{ 
  solutionName: string; 
  solutionItems: ProposalItem[] 
}> = React.memo(({ solutionName, solutionItems }) => (
  <Card className="shadow-lg border-gray-200">
    <CardHeader className="bg-gradient-to-r from-drystore-orange to-drystore-orange-light border-b border-gray-200">
      <CardTitle className="text-xl font-bold text-white flex items-center">
        <span className="text-2xl mr-3">🏗️</span>
        {solutionName}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 bg-white">
      <div className="grid gap-3">
        {solutionItems.map((item, index) => (
          <ProposalItemRow key={`${solutionName}-${index}`} item={item} index={index} />
        ))}
      </div>
    </CardContent>
  </Card>
));

SolutionSection.displayName = 'SolutionSection';

const ProposalItemsTable: React.FC<ProposalItemsTableProps> = React.memo(({ items }) => {
  // Memoize the grouped items to avoid recalculation on every render
  const groupedItems = React.useMemo(() => {
    return items.reduce((acc, item) => {
      const solutionName = item.solution || 'Sua solução contempla';
      if (!acc[solutionName]) {
        acc[solutionName] = [];
      }
      acc[solutionName].push(item);
      return acc;
    }, {} as Record<string, ProposalItem[]>);
  }, [items]);

  // Memoize the entries to avoid recreation
  const groupedEntries = React.useMemo(() => 
    Object.entries(groupedItems), 
    [groupedItems]
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum item encontrado para esta proposta.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEntries.map(([solutionName, solutionItems]) => (
        <SolutionSection 
          key={solutionName} 
          solutionName={solutionName} 
          solutionItems={solutionItems} 
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for items array
  if (prevProps.items.length !== nextProps.items.length) {
    return false;
  }
  
  return prevProps.items.every((item, index) => 
    item.description === nextProps.items[index]?.description &&
    item.solution === nextProps.items[index]?.solution
  );
});

ProposalItemsTable.displayName = 'ProposalItemsTable';

export default ProposalItemsTable;
