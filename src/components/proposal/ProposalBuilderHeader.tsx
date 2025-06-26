
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProposalBuilder } from './ProposalBuilderProvider';

interface ProposalBuilderHeaderProps {
  onSave: () => void;
  isSaving: boolean;
}

export const ProposalBuilderHeader: React.FC<ProposalBuilderHeaderProps> = ({
  onSave,
  isSaving
}) => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep } = useProposalBuilder();

  const handleBack = () => {
    if (currentStep === 'product-group') {
      navigate('/proposal-upload-choice');
    } else {
      setCurrentStep('product-group');
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Construir Proposta</h1>
          <p className="text-gray-600 mt-1">
            Configure dados do cliente e condições comerciais
          </p>
        </div>
      </div>
      
      {currentStep === 'proposal-details' && (
        <div className="flex space-x-3">
          <Button 
            onClick={onSave}
            disabled={isSaving}
            className="gradient-bg hover:opacity-90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando Proposta...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Finalizar Proposta
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
