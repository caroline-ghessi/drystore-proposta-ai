
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FollowUpMessage, SuggestedProduct } from '@/types/followup';

export const useFollowUpAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const { toast } = useToast();

  const generateFollowUpMessage = async (
    clientName: string,
    vendorName: string,
    lastPurchase?: any,
    triggerType?: string
  ): Promise<{ message: string; suggestedProducts: SuggestedProduct[] }> => {
    setIsGenerating(true);
    
    try {
      // Simular chamada para IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestedProducts: SuggestedProduct[] = [
        {
          id: '1',
          name: 'Kit de Reforço para Placas 12,5mm',
          description: 'Kit completo com parafusos e fita para reforço',
          price: 89.90,
          reason: 'Ideal para complementar sua instalação de drywall',
          urgencyMessage: 'Últimas 5 unidades em estoque'
        },
        {
          id: '2',
          name: 'Massa para Junta Premium',
          description: 'Massa de alta qualidade para acabamento perfeito',
          price: 45.50,
          reason: 'Necessária para o acabamento das placas instaladas'
        }
      ];

      const templates = [
        `Olá ${clientName}, tudo certo? Aqui é o ${vendorName} da Drystore.

Vi que sua obra já está avançando! Já pensou em complementar com o nosso ${suggestedProducts[0].name}? Ele pode evitar retrabalho e trazer mais desempenho para sua instalação.

Posso te enviar uma condição especial agora. 😊`,

        `Oi ${clientName}! Como está o andamento da obra?

Lembrei que você comprou ${lastPurchase?.productName || 'nossos produtos'} e pensei que talvez precise de ${suggestedProducts[0].name}.

Temos uma promoção especial hoje - que tal conversarmos? 📱`,

        `${clientName}, espero que esteja tudo bem!

Notei que faz um tempo que não conversamos. Temos algumas novidades que podem interessar para seus próximos projetos.

${suggestedProducts[0].urgencyMessage || 'Posso te apresentar nossas soluções?'} 💪`
      ];

      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

      return {
        message: randomTemplate,
        suggestedProducts
      };
    } catch (error) {
      console.error('Erro ao gerar mensagem:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const improveMessage = async (
    originalMessage: string,
    instruction: string
  ): Promise<string> => {
    setIsImproving(true);
    
    try {
      // Simular melhoria da IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let improvedMessage = originalMessage;
      
      if (instruction.toLowerCase().includes('direta')) {
        improvedMessage = originalMessage
          .replace(/😊|📱|💪/g, '')
          .split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 2)
          .join('\n') + '\n\nPosso enviar mais detalhes?';
      } else if (instruction.toLowerCase().includes('técnica')) {
        improvedMessage = originalMessage
          .replace('já pensou em', 'recomendo tecnicamente')
          .replace('pode evitar retrabalho', 'otimiza a performance estrutural')
          .replace('condição especial', 'especificação técnica detalhada');
      } else if (instruction.toLowerCase().includes('urgente')) {
        improvedMessage = originalMessage + '\n\n⚠️ ATENÇÃO: Oferta válida apenas hoje!';
      }
      
      return improvedMessage;
    } catch (error) {
      console.error('Erro ao melhorar mensagem:', error);
      throw error;
    } finally {
      setIsImproving(false);
    }
  };

  return {
    generateFollowUpMessage,
    improveMessage,
    isGenerating,
    isImproving
  };
};
