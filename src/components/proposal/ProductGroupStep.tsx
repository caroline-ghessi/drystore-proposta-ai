
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Info } from 'lucide-react';
import { ProductGroupSelector } from './ProductGroupSelector';
import { useProposalBuilder } from './ProposalBuilderProvider';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ProductGroupStep: React.FC = () => {
  const {
    selectedProductGroup,
    setSelectedProductGroup,
    setCurrentStep,
    hasExtractedData,
    items,
    clientData
  } = useProposalBuilder();
  const { toast } = useToast();

  const handleNext = () => {
    if (!selectedProductGroup) {
      toast({
        title: "Seleção obrigatória",
        description: "Por favor, selecione um grupo de produtos para continuar.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('proposal-details');
  };

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-8">
        {/* Indicator for extracted data */}
        {hasExtractedData && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-start justify-between">
                <div>
                  <strong>Dados de PDF detectados!</strong>
                  <p className="mt-1 text-sm">
                    Encontramos {items.length} itens e dados do cliente "{clientData.name || 'não informado'}" 
                    carregados automaticamente. Selecione o grupo de produtos apropriado para continuar.
                  </p>
                </div>
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0 ml-3" />
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <ProductGroupSelector
          selectedGroup={selectedProductGroup}
          onGroupSelect={setSelectedProductGroup}
        />
        
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleNext}
            disabled={!selectedProductGroup}
            className="gradient-bg hover:opacity-90"
            size="lg"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
