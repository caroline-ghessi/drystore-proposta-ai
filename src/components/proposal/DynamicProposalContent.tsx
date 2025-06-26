
import React, { Suspense } from 'react';
import { ProposalLayoutService, ProposalLayoutProps } from '@/services/proposalLayoutService';
import { ProductGroup } from '@/types/productGroups';
import { Loader2 } from 'lucide-react';

interface DynamicProposalContentProps extends ProposalLayoutProps {
  productGroup: ProductGroup | null;
}

export const DynamicProposalContent: React.FC<DynamicProposalContentProps> = ({
  productGroup,
  ...layoutProps
}) => {
  console.log('🎯 DynamicProposalContent renderizado');
  console.log('📦 Product Group recebido:', productGroup);
  console.log('👤 Cliente:', layoutProps.proposal?.clientName);
  
  const LayoutComponent = ProposalLayoutService.getLayoutComponent(productGroup);
  
  console.log('🔧 Layout Component selecionado:', LayoutComponent);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando layout personalizado...</span>
      </div>
    }>
      <LayoutComponent {...layoutProps} />
    </Suspense>
  );
};
