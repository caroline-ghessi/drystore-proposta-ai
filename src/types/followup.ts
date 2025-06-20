
export interface FollowUpTrigger {
  id: string;
  type: 'delivery_completed' | 'product_purchase' | 'no_activity';
  name: string;
  description: string;
  daysAfter: number;
  productCategories?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface FollowUpMessage {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  triggerId: string;
  triggerType: string;
  originalMessage: string;
  editedMessage?: string;
  finalMessage: string;
  suggestedProducts: SuggestedProduct[];
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
  createdAt: string;
  lastPurchase?: {
    proposalId: string;
    productName: string;
    date: string;
  };
}

export interface SuggestedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  reason: string;
  urgencyMessage?: string;
}

export interface WhatsAppMessageHistory {
  id: string;
  messageId: string;
  clientPhone: string;
  vendorPhone: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
}
