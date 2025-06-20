
export interface ClientAuth {
  email: string;
  token: string;
  expiresAt: string;
  isValid: boolean;
}

export interface MagicLinkRequest {
  email: string;
  timestamp: string;
}

export interface SalesRepresentative {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  photo: string;
  territory: string;
}
