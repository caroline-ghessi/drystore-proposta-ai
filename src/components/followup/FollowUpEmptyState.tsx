
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';

interface FollowUpEmptyStateProps {
  onGenerateFollowUp: () => void;
  isGenerating: boolean;
}

const FollowUpEmptyState = ({ onGenerateFollowUp, isGenerating }: FollowUpEmptyStateProps) => {
  return (
    <Card>
      <CardContent className="p-8 sm:p-12 text-center">
        <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          Nenhum follow-up pendente
        </h3>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          Clique em "Gerar Follow-up" para criar uma nova mensagem personalizada
        </p>
        <Button 
          onClick={onGenerateFollowUp} 
          disabled={isGenerating}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isGenerating ? 'Gerando...' : 'Gerar Primeiro Follow-up'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FollowUpEmptyState;
