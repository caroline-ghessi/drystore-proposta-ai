
export interface ExtractedData {
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
}

export interface ColumnMapping {
  description: number;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: number;
}

export interface TableRow {
  cells: Array<{ content: string }>;
}

export interface ParsedItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}
