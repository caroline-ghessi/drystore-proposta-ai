
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Interaction {
  id: string;
  type: 'edit' | 'send' | 'view' | 'accept' | 'reject' | 'question' | 'note';
  description: string;
  user: string;
  timestamp: string;
  details?: string;
}

export const useProposalInteractions = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const { toast } = useToast();

  const addInteraction = (interaction: Omit<Interaction, 'id' | 'timestamp'>) => {
    const newInteraction: Interaction = {
      ...interaction,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('pt-BR')
    };
    setInteractions(prev => [...prev, newInteraction]);
  };

  return {
    interactions,
    addInteraction,
    toast
  };
};
