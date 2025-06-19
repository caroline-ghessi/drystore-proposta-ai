
export interface DeliveryItem {
  id: string;
  proposalId: string;
  date: string;
  quantity: number;
  unit: string;
  invoiceNumber: string;
  invoiceFile?: File | string;
  receiverName: string;
  receiverSignature?: File | string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface DeliveryProgress {
  proposalId: string;
  totalContracted: number;
  totalDelivered: number;
  percentageDelivered: number;
  percentageRemaining: number;
  unit: string;
  lastDeliveryDate?: string;
  deliveries: DeliveryItem[];
}
