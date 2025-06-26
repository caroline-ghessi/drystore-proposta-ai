
interface ProposalStepIndicatorProps {
  currentStep: 'product-group' | 'proposal-details';
}

export const ProposalStepIndicator = ({ currentStep }: ProposalStepIndicatorProps) => {
  const getProgressPercentage = () => {
    if (currentStep === 'product-group') return 33;
    if (currentStep === 'proposal-details') return 100;
    return 0;
  };

  const getStepTitle = () => {
    if (currentStep === 'product-group') return 'Grupo de Produtos';
    if (currentStep === 'proposal-details') return 'Detalhes da Proposta';
    return '';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>Passo {currentStep === 'product-group' ? '1' : '2'} de 2</span>
        <span>{getProgressPercentage()}% concluído</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-drystore-blue h-2 rounded-full transition-all duration-300" 
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
    </div>
  );
};
