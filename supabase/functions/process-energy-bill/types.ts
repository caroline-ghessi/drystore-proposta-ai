// Types and interfaces for energy bill processing

export interface ExtractedEnergyBillData {
  concessionaria: string;
  nome_cliente: string;
  endereco: string;
  cidade: string;
  estado: string;
  uc: string;
  tarifa_kwh: number;
  consumo_atual_kwh: number;
  periodo: string;
  data_vencimento: string;
  consumo_historico: ConsumptionHistoryItem[];
}

export interface ConsumptionHistoryItem {
  mes: string;
  consumo: number;
  ano?: string;
}

export interface GoogleCredentials {
  client_email: string;
  private_key: string;
}

export interface JWTPayload {
  iss: string;
  scope: string;
  aud: string;
  exp: number;
  iat: number;
}

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
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

export interface ImageProcessingResult {
  base64Data: string;
  originalSize: number;
  finalSize: number;
  reduction: string;
}

export interface ExtractionQualityWeights {
  concessionaria: number;
  nome_cliente: number;
  endereco: number;
  cidade: number;
  estado: number;
  uc: number;
  tarifa_kwh: number;
  consumo_atual_kwh: number;
  consumo_historico: number;
}