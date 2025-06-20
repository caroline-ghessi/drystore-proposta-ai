
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Eye, Edit3, Check, X } from 'lucide-react';
import { RecommendedProduct } from '@/types/recommendations';
import AIRecommendationManager from './AIRecommendationManager';
import RecommendedProducts from './RecommendedProducts';

interface ProposalRecommendationSectionProps {
  proposalItems: any[];
  clientProfile?: any;
  totalValue: number;
  isEditMode?: boolean;
}

const ProposalRecommendationSection = ({
  proposalItems,
  clientProfile,
  totalValue,
  isEditMode = true
}: ProposalRecommendationSectionProps) => {
  const [approvedRecommendations, setApprovedRecommendations] = useState<RecommendedProduct[]>([]);
  const [currentView, setCurrentView] = useState<'manage' | 'preview'>('manage');

  const handleRecommendationsUpdate = (recommendations: RecommendedProduct[]) => {
    // Filtrar apenas recomendações aprovadas
    const approved = recommendations.filter(rec => rec.validated === true);
    setApprovedRecommendations(approved);
  };

  const convertToRecommendedProducts = (products: RecommendedProduct[]) => {
    return products.map(product => ({
      id: parseInt(product.productId) || Math.floor(Math.random() * 10000),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image || '/placeholder.svg'
    }));
  };

  if (!isEditMode) {
    // Modo apenas visualização
    return approvedRecommendations.length > 0 ? (
      <RecommendedProducts products={convertToRecommendedProducts(approvedRecommendations)} />
    ) : null;
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              Recomendações para Proposta
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={currentView === 'manage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('manage')}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Gerenciar
              </Button>
              <Button
                variant={currentView === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('preview')}
                disabled={approvedRecommendations.length === 0}
              >
                <Eye className="w-4 h-4 mr-1" />
                Visualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {currentView === 'manage' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Como funciona?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• A IA analisa os produtos da proposta automaticamente</li>
                  <li>• Gera recomendações baseadas nas regras configuradas</li>
                  <li>• Você pode aprovar, rejeitar ou adicionar produtos personalizados</li>
                  <li>• Apenas produtos aprovados aparecerão na proposta final</li>
                </ul>
              </div>

              <AIRecommendationManager
                proposalItems={proposalItems}
                clientProfile={clientProfile}
                totalValue={totalValue}
                onRecommendationsUpdate={handleRecommendationsUpdate}
              />

              {approvedRecommendations.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">
                      {approvedRecommendations.length} recomendações aprovadas
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Estas recomendações aparecerão na seção "Maximize Seu Investimento" da proposta.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Prévia da Seção de Recomendações</h3>
                <p className="text-sm text-gray-600">
                  Assim será exibido na proposta final para o cliente:
                </p>
              </div>
              
              {approvedRecommendations.length > 0 ? (
                <RecommendedProducts products={convertToRecommendedProducts(approvedRecommendations)} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <X className="w-8 h-8 mx-auto mb-2" />
                  <p>Nenhuma recomendação aprovada ainda</p>
                  <p className="text-sm">Volte para "Gerenciar" para aprovar recomendações</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalRecommendationSection;
