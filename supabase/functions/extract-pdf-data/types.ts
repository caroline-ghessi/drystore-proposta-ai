
export interface ExtractedData {
  client?: string;
  proposalNumber?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  vendor?: string;
}

export interface ParsedItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}
