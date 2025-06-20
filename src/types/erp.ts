
export interface ERPOrder {
  id: string;
  proposalId: string;
  clientId: string;
  orderNumber: string;
  items: ERPOrderItem[];
  totalValue: number;
  status: 'pending' | 'created' | 'processing' | 'completed' | 'error';
  createdAt: string;
  erpOrderId?: string;
  invoiceId?: string;
  separationOrderId?: string;
  xmlGenerated?: boolean;
  xmlPath?: string;
}

export interface ERPOrderItem {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

export interface CRMDeal {
  id: string;
  proposalId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dealValue: number;
  status: 'created' | 'in_progress' | 'won' | 'lost';
  freshsalesDealId?: string;
  stage: string;
  createdAt: string;
  expectedCloseDate?: string;
}

export interface XMLOrderData {
  order: ERPOrder;
  client: {
    name: string;
    document: string;
    email: string;
    phone: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      district: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  vendor: {
    name: string;
    document: string;
    email: string;
  };
}

export interface ERPIntegrationConfig {
  erpType: 'protheus' | 'datasul' | 'senior' | 'custom';
  apiUrl: string;
  isActive: boolean;
}

export interface CRMIntegrationConfig {
  crmType: 'freshsales' | 'pipedrive' | 'hubspot' | 'custom';
  apiUrl: string;
  isActive: boolean;
}
