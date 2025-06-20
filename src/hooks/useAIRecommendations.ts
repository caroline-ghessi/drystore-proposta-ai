
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIRecommendationRequest, AIRecommendationResponse, RecommendedProduct } from '@/types/recommendations';

export const useAIRecommendations = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const { toast } = useToast();

  const generateRecommendations = async (request: AIRecommendationRequest): Promise<AIRecommendationResponse> => {
    setIsGenerating(true);
    
    try {
      // Simular chamada para IA que analisa os itens da proposta
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Análise dos produtos para gerar recomendações inteligentes
      const productCategories = request.proposalItems.map(item => 
        item.description.toLowerCase()
      );
      
      let generatedRecommendations: RecommendedProduct[] = [];
      
      // Lógica de recomendação baseada nos produtos da proposta
      if (productCategories.some(cat => cat.includes('telha') || cat.includes('telhado'))) {
        generatedRecommendations.push({
          productId: '1',
          name: 'Kit de Vedação para Telhas',
          description: 'Completo com vedantes e acessórios',
          price: 189.90,
          originalPrice: 249.90,
          image: '/placeholder.svg',
          reason: 'Essencial para vedação perfeita das telhas instaladas',
          urgencyMessage: 'Últimas 3 unidades em estoque',
          discount: 24,
          category: 'vedacao'
        });
      }
      
      if (productCategories.some(cat => cat.includes('drywall') || cat.includes('placa'))) {
        generatedRecommendations.push({
          productId: '2',
          name: 'Massa para Junta Premium',
          description: 'Acabamento profissional garantido',
          price: 85.90,
          originalPrice: 119.90,
          image: '/placeholder.svg',
          reason: 'Necessária para acabamento perfeito das placas',
          discount: 28,
          category: 'acabamento'
        });
        
        generatedRecommendations.push({
          productId: '3',
          name: 'Kit de Parafusos Especiais',
          description: 'Parafusos específicos para drywall',
          price: 45.90,
          originalPrice: 65.90,
          image: '/placeholder.svg',
          reason: 'Garante fixação segura e durável',
          discount: 30,
          category: 'fixacao'
        });
      }
      
      if (productCategories.some(cat => cat.includes('estrutura') || cat.includes('madeira'))) {
        generatedRecommendations.push({
          productId: '4',
          name: 'Tratamento Anti-cupim',
          description: 'Proteção duradoura para madeira',
          price: 129.90,
          originalPrice: 179.90,
          image: '/placeholder.svg',
          reason: 'Proteção essencial para estruturas de madeira',
          urgencyMessage: 'Oferta especial por tempo limitado',
          discount: 28,
          category: 'protecao'
        });
      }
      
      // Se valor alto, recomendar produtos premium
      if (request.totalValue > 20000) {
        generatedRecommendations.push({
          productId: '5',
          name: 'Sistema de Isolamento Acústico',
          description: 'Reduz ruídos em até 80%',
          price: 299.90,
          originalPrice: 399.90,
          image: '/placeholder.svg',
          reason: 'Valoriza o imóvel e melhora o conforto',
          discount: 25,
          category: 'premium'
        });
      }
      
      setRecommendations(generatedRecommendations);
      
      return {
        recommendations: generatedRecommendations,
        reasoning: `Baseado na análise dos ${request.proposalItems.length} itens da proposta, identifiquei complementos que otimizam a instalação e garantem melhor resultado final.`,
        confidence: 85
      };
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      toast({
        title: "Erro ao gerar recomendações",
        description: "Não foi possível gerar recomendações automáticas.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const validateRecommendation = (productId: string, approved: boolean) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.productId === productId 
          ? { ...rec, validated: approved }
          : rec
      )
    );
  };

  const addCustomRecommendation = (product: RecommendedProduct) => {
    setRecommendations(prev => [...prev, { ...product, validated: true }]);
  };

  const removeRecommendation = (productId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.productId !== productId));
  };

  return {
    generateRecommendations,
    validateRecommendation,
    addCustomRecommendation,
    removeRecommendation,
    recommendations,
    isGenerating
  };
};
