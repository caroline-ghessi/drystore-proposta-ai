
export interface ProductGroup {
  id: string;
  name: string;
  keywords: string[];
  category: string;
}

export interface RecommendationRule {
  id: string;
  name: string;
  description: string;
  triggerGroups: string[]; // IDs dos grupos de produtos que ativam esta regra
  recommendedProducts: RecommendedProduct[];
  priority: number;
  isActive: boolean;
  conditions: {
    minValue?: number;
    maxValue?: number;
    clientSegment?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedProduct {
  productId: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  reason: string;
  urgencyMessage?: string;
  discount: number;
  category: string;
  validated?: boolean; // Added this property to track validation status
}

export interface AIRecommendationRequest {
  proposalItems: any[];
  clientProfile?: any;
  totalValue: number;
  projectType?: string;
}

export interface AIRecommendationResponse {
  recommendations: RecommendedProduct[];
  reasoning: string;
  confidence: number;
}
