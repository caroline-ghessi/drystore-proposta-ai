
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Proposal = Tables<'proposals'>;
export type ProposalInsert = TablesInsert<'proposals'>;
export type ProposalUpdate = TablesUpdate<'proposals'>;

export interface CreateProposalData {
  clientData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  items: Array<{
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  observations?: string;
  validityDays: number;
  subtotal: number;
  discount?: number;
  selectedPaymentConditions?: string[];
  includeVideo?: boolean;
  videoUrl?: string;
  includeTechnicalDetails?: boolean;
  selectedSolutions?: Array<{ solutionId: string; value: number }>;
  selectedRecommendedProducts?: string[];
}
