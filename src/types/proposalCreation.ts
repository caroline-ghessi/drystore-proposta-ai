
import type { ProductGroup } from './productGroups';

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

export interface ProposalItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface CreateProposalRequest {
  clientData: ClientData;
  items: ProposalItem[];
  observations: string;
  validityDays: number;
  subtotal: number;
  discount: number;
  selectedPaymentConditions: string[];
  includeVideo: boolean;
  videoUrl: string;
  includeTechnicalDetails: boolean;
  selectedSolutions: Array<{ solutionId: string; value: number }>;
  selectedRecommendedProducts: string[];
  productGroup: ProductGroup;
  showDetailedValues?: boolean;
}

export interface ProposalCreationResult {
  proposal: any;
  client: any;
  items: any[];
  paymentConditions: any[];
  solutions: any[];
  recommendedProducts: any[];
}
