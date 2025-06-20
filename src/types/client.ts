
export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  cashbackBalance: number;
  pointsBalance: number;
  pointsExpirationDate?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
  lastPurchase?: string;
}

export interface CashbackTransaction {
  id: string;
  clientId: string;
  proposalId: string;
  type: 'earned' | 'redeemed' | 'expired';
  amount: number;
  description: string;
  date: string;
  expirationDate?: string;
}

export interface ContractDocument {
  id: string;
  proposalId: string;
  clientId: string;
  documentUrl: string;
  signatureUrl?: string;
  status: 'pending' | 'signed' | 'expired';
  signedAt?: string;
  expiresAt: string;
  createdAt: string;
}
