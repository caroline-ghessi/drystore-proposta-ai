// Types for ERP PDF processing

export interface ExtractedERPData {
  id?: string;
  client?: string;
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
  proposalNumber?: string;
  date?: string;
}

export interface ProcessingConfig {
  timeoutConvertMs: number;
  timeoutApiMs: number;
  maxRetries: number;
  retryDelay: number;
  maxImageSizeMB: number;
  maxImageWidth: number;
  maxImageHeight: number;
}

export interface ERPExtractionQualityWeights {
  client: number;
  vendor: number;
  items: number;
  total: number;
  paymentTerms: number;
  delivery: number;
}