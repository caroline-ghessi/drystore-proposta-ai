
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface CreditCardData {
  number: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
}

export interface PIXData {
  qrCode: string;
  copyPasteCode: string;
  amount: number;
  expiresAt: string;
}

export interface BoletoData {
  barcodeNumber: string;
  pdfUrl: string;
  amount: number;
  dueDate: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  data?: PIXData | BoletoData;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PaymentTransaction {
  id: string;
  proposalId: string;
  method: 'credit_card' | 'pix' | 'boleto';
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  completedAt?: string;
  data?: CreditCardData | PIXData | BoletoData;
}
