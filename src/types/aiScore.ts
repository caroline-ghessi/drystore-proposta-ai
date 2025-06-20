
export interface AIScore {
  proposalId: string;
  score: number; // 0-100
  factors: {
    clientProfile: number;
    responseTime: number;
    ticketSize: number;
    textSentiment: number;
    pastInteractions: number;
  };
  recommendations: string[];
  confidence: 'low' | 'medium' | 'high';
  lastCalculated: string;
}

export interface NextStepSuggestion {
  id: string;
  proposalId: string;
  rejectionReason: string;
  suggestedActions: {
    action: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedSuccess: number;
  }[];
  createdAt: string;
}
