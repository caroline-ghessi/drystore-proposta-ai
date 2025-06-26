
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ProductGroupSelector } from './ProductGroupSelector';
import { useProposalBuilder } from './ProposalBuilderProvider';
import { useToast } from '@/hooks/use-toast';

export const ProductGroupStep: React.FC = () => {
  const {
    selectedProductGroup,
    setSelectedProductGroup,
    setCurrentStep
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
