
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  price: number;
  supplier?: string;
  specifications?: Record<string, any>;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImport {
  id: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'uploading' | 'mapping' | 'processing' | 'completed' | 'error';
  mapping: FieldMapping;
  errors: ImportError[];
  createdAt: string;
  completedAt?: string;
}

export interface FieldMapping {
  [excelColumn: string]: {
    targetField: string;
    transformation?: 'text' | 'number' | 'currency' | 'boolean' | 'date';
    required: boolean;
    customField?: boolean;
  };
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  error: string;
}

export interface ExcelColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sampleValues: any[];
}

export interface ProductField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'boolean' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

export const PRODUCT_FIELDS: ProductField[] = [
  { key: 'code', label: 'Código', type: 'text', required: true },
  { key: 'name', label: 'Nome', type: 'text', required: true },
  { key: 'description', label: 'Descrição', type: 'text', required: false },
  { key: 'category', label: 'Categoria', type: 'text', required: true },
  { key: 'unit', label: 'Unidade', type: 'text', required: true },
  { key: 'price', label: 'Preço', type: 'currency', required: true },
  { key: 'supplier', label: 'Fornecedor', type: 'text', required: false },
];
