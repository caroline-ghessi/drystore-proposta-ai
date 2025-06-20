
import { AIScore, NextStepSuggestion } from '@/types/aiScore';

export const getMockAIScore = (proposalId: string): AIScore => ({
  proposalId: proposalId,
  score: 78,
  factors: {
    clientProfile: 85,
    responseTime: 92,
    ticketSize: 65,
    textSentiment: 75,
    pastInteractions: 70
  },
  recommendations: [
    'Cliente responde rapidamente - aproveite o momento',
    'Destaque a garantia estendida no próximo contato',
    'Considere oferecer parcelamento em 12x'
  ],
  confidence: 'high',
  lastCalculated: new Date().toISOString()
});

export const getMockNextSteps = (proposalId: string): NextStepSuggestion => ({
  id: '1',
  proposalId: proposalId,
  rejectionReason: 'Preço muito alto',
  suggestedActions: [
    {
      action: 'Oferecer desconto de 10%',
      description: 'Propor desconto progressivo baseado no volume de compra',
      priority: 'high',
      estimatedSuccess: 75
    },
    {
      action: 'Parcelamento em 18x',
      description: 'Estender o parcelamento para reduzir valor das parcelas',
      priority: 'medium',
      estimatedSuccess: 60
    },
    {
      action: 'Agendar reunião técnica',
      description: 'Demonstrar valor agregado com apresentação técnica',
      priority: 'medium',
      estimatedSuccess: 55
    }
  ],
  createdAt: new Date().toISOString()
});
