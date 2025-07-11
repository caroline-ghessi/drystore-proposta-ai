// Adobe Token Manager - Gerenciamento inteligente de tokens com cache e renovação automática
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AdobeToken {
  access_token: string;
  expires_in: number;
  created_at: number;
  expires_at: number;
}

interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
  orgId: string;
}

export class AdobeTokenManager {
  private static instance: AdobeTokenManager;
  private currentToken: AdobeToken | null = null;
  private supabase: any;
  
  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  static getInstance(): AdobeTokenManager {
    if (!AdobeTokenManager.instance) {
      AdobeTokenManager.instance = new AdobeTokenManager();
    }
    return AdobeTokenManager.instance;
  }

  private log(message: string, data?: any) {
    console.log(`🔐 [AdobeTokenManager] ${message}`, data || '');
  }

  private logError(message: string, error: any) {
    console.error(`❌ [AdobeTokenManager] ${message}`, error);
  }

  // Obter credenciais do ambiente com validação
  private getCredentials(): AdobeCredentials {
    const clientId = Deno.env.get('ADOBE_CLIENT_ID');
    const clientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const orgId = Deno.env.get('ADOBE_ORG_ID');

    if (!clientId || !clientSecret || !orgId) {
      throw new Error('Adobe credentials not configured in environment');
    }

    return { clientId, clientSecret, orgId };
  }

  // Verificar se o token atual ainda é válido (com margem de segurança)
  private isTokenValid(token: AdobeToken | null): boolean {
    if (!token) return false;
    
    const now = Date.now();
    const safetyMargin = 5 * 60 * 1000; // 5 minutos de margem
    const isValid = token.expires_at > (now + safetyMargin);
    
    this.log(`Token validity check: ${isValid}`, {
      now: new Date(now).toISOString(),
      expires_at: new Date(token.expires_at).toISOString(),
      minutes_remaining: Math.floor((token.expires_at - now) / (60 * 1000))
    });
    
    return isValid;
  }

  // Buscar token válido do cache (Supabase ou memória)
  private async getCachedToken(): Promise<AdobeToken | null> {
    // Primeiro verificar token em memória
    if (this.isTokenValid(this.currentToken)) {
      this.log('Using valid token from memory cache');
      return this.currentToken;
    }

    try {
      // Buscar do cache do Supabase (implementação futura se necessário)
      // Por ora, apenas retornar null para forçar nova autenticação
      this.log('No valid cached token found');
      return null;
    } catch (error) {
      this.logError('Error checking cached token:', error);
      return null;
    }
  }

  // Autenticar com Adobe e obter novo token
  private async authenticateWithAdobe(): Promise<AdobeToken> {
    const startTime = Date.now();
    this.log('Starting Adobe authentication...');
    
    try {
      const credentials = this.getCredentials();
      
      const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'client_id': credentials.clientId,
          'client_secret': credentials.clientSecret,
          'grant_type': 'client_credentials',
          'scope': 'openid,AdobeID,read_organizations,additional_info.projectedProductContext'
        }).toString()
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        this.logError(`Authentication failed (${response.status}):`, errorText);
        throw new Error(`Adobe authentication failed: ${response.status} ${errorText}`);
      }

      const tokenData = await response.json();
      
      if (!tokenData.access_token) {
        throw new Error('No access token received from Adobe');
      }

      const now = Date.now();
      const token: AdobeToken = {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in || 86400, // Default 24h
        created_at: now,
        expires_at: now + (tokenData.expires_in * 1000)
      };

      this.log(`✅ Authentication successful (${duration}ms)`, {
        expires_in: token.expires_in,
        expires_at: new Date(token.expires_at).toISOString()
      });

      // Armazenar em memória
      this.currentToken = token;
      
      return token;

    } catch (error) {
      this.logError('Authentication error:', error);
      throw error;
    }
  }

  // Método principal para obter token válido
  async getValidToken(): Promise<string> {
    try {
      // Tentar usar token em cache
      let token = await this.getCachedToken();
      
      // Se não há token válido, autenticar
      if (!token) {
        this.log('No valid token available, authenticating...');
        token = await this.authenticateWithAdobe();
      }
      
      return token.access_token;
      
    } catch (error) {
      this.logError('Failed to get valid token:', error);
      throw new Error(`Failed to obtain Adobe token: ${error.message}`);
    }
  }

  // Forçar renovação do token
  async refreshToken(): Promise<string> {
    this.log('Force refreshing token...');
    this.currentToken = null; // Invalidar token atual
    return await this.getValidToken();
  }

  // Obter informações do token atual
  getTokenInfo(): any {
    if (!this.currentToken) {
      return { status: 'no_token' };
    }

    const now = Date.now();
    const minutesRemaining = Math.floor((this.currentToken.expires_at - now) / (60 * 1000));

    return {
      status: this.isTokenValid(this.currentToken) ? 'valid' : 'expired',
      created_at: new Date(this.currentToken.created_at).toISOString(),
      expires_at: new Date(this.currentToken.expires_at).toISOString(),
      minutes_remaining: minutesRemaining,
      is_valid: this.isTokenValid(this.currentToken)
    };
  }

  // Validar credenciais sem obter token
  async validateCredentials(): Promise<boolean> {
    try {
      await this.getValidToken();
      return true;
    } catch (error) {
      this.logError('Credential validation failed:', error);
      return false;
    }
  }
}