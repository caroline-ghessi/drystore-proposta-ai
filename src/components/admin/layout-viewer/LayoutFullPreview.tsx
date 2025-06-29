
import React, { Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { DynamicProposalContent } from '@/components/proposal/DynamicProposalContent';
import { ProductGroup, PRODUCT_GROUPS } from '@/types/productGroups';
import { generateMockData } from '@/services/mockProposalData';

interface LayoutFullPreviewProps {
  productGroupId: ProductGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

const LayoutFullPreview: React.FC<LayoutFullPreviewProps> = ({
  productGroupId,
  isOpen,
  onClose
}) => {
  if (!productGroupId) return null;

  const productGroup = PRODUCT_GROUPS.find(group => group.id === productGroupId);
  const mockData = generateMockData(productGroupId);

  const proposalData = {
    clientName: mockData.clientName,
    benefits: mockData.benefits,
    finalPrice: mockData.finalPrice,
    totalPrice: mockData.originalPrice,
    discount: mockData.discount,
    validUntil: mockData.validUntil
  };

  const proposalLayoutProps = {
    proposal: proposalData,
    proposalItems: mockData.proposalItems,
    selectedSolutions: mockData.solutions.map((solution, index) => ({
      id: `solution-${index}`,
      price: solution.products.reduce((sum, product) => sum + product.totalPrice, 0)
    })),
    canInteract: false, // Desabilitado no preview
    isExpired: false,
    onAcceptProposal: () => {},
    onRejectProposal: () => {},
    onSolutionSelect: () => {},
    onCloseDeal: () => {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{productGroup?.icon}</span>
              <div>
                <DialogTitle className="text-xl">
                  Preview: {productGroup?.name}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Visualização do layout com dados mockados
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>🎭 Modo Preview</span>
                <span>Dados: Mockados | Interações: Desabilitadas</span>
              </div>
            </div>

            <Suspense 
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Carregando layout...</span>
                </div>
              }
            >
              <DynamicProposalContent
                productGroup={productGroupId}
                {...proposalLayoutProps}
              />
            </Suspense>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LayoutFullPreview;
