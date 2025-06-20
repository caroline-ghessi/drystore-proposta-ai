
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Bot, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { RecommendedProduct } from '@/types/recommendations';
import RecommendationsList from './RecommendationsList';

interface AIRecommendationManagerProps {
  proposalItems: any[];
  clientProfile?: any;
  totalValue: number;
  onRecommendationsUpdate: (recommendations: RecommendedProduct[]) => void;
}

const AIRecommendationManager = ({
  proposalItems,
  clientProfile,
  totalValue,
  onRecommendationsUpdate
}: AIRecommendationManagerProps) => {
  const {
    generateRecommendations,
    validateRecommendation,
    addCustomRecommendation,
    removeRecommendation,
    recommendations,
    isGenerating
  } = useAIRecommendations();

  useEffect(() => {
    // Gerar recomendações automaticamente quando os itens da proposta mudarem
    if (proposalItems.length > 0) {
      generateRecommendations({
        proposalItems,
        clientProfile,
        totalValue
      });
    }
  }, [proposalItems, totalValue]);

  useEffect(() => {
    // Notificar componente pai sobre mudanças nas recomendações
    onRecommendationsUpdate(recommendations);
  }, [recommendations, onRecommendationsUpdate]);

  const handleValidateRecommendation = (productId: string, approved: boolean) => {
    validateRecommendation(productId, approved);
  };

  const handleGenerateRecommendations = () => {
    generateRecommendations({ proposalItems, clientProfile, totalValue });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-600" />
          Recomendações Inteligentes
          <Badge className="ml-2 bg-blue-100 text-blue-800">
            <Sparkles className="w-3 h-3 mr-1" />
            IA
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Analisando proposta e gerando recomendações...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Nenhuma recomendação gerada ainda</p>
            <Button 
              variant="outline" 
              onClick={handleGenerateRecommendations}
              className="mt-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Recomendações
            </Button>
          </div>
        ) : (
          <RecommendationsList
            recommendations={recommendations}
            onValidateRecommendation={handleValidateRecommendation}
            onRemoveRecommendation={removeRecommendation}
            onAddCustomRecommendation={addCustomRecommendation}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationManager;
