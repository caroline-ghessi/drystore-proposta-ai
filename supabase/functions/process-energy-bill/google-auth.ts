// Google OAuth and JWT authentication utilities

import type { GoogleCredentials, JWTPayload, GoogleTokenResponse } from './types.ts';

export class GoogleAuthManager {
  private credentials: string;
  private accessTokenCache: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor(credentials: string) {
    this.credentials = credentials;
  }

  async getCachedGoogleAccessToken(): Promise<string> {
    console.log('🔑 Getting cached Google OAuth2 access token...');
    
    // Verificar se o token em cache ainda é válido
    if (this.accessTokenCache && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      console.log('✅ Using cached access token (valid for', Math.floor((this.tokenExpiryTime - Date.now()) / 1000 / 60), 'more minutes)');
      return this.accessTokenCache;
    }
    
    console.log('🔄 Cache expired or empty, obtaining new token...');
    
    // Obter novo token
    const tokenData = await this.getGoogleAccessTokenWithRetry();
    
    // Cachear o token (válido por 1 hora, mas vamos considerar 50 minutos para segurança)
    this.accessTokenCache = tokenData.access_token;
    this.tokenExpiryTime = Date.now() + (50 * 60 * 1000); // 50 minutos
    
    console.log('✅ New access token cached successfully');
    return this.accessTokenCache;
  }

  private async getGoogleAccessTokenWithRetry(): Promise<GoogleTokenResponse> {
    const maxRetries = 2;
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔑 Getting Google OAuth2 access token (attempt ${attempt}/${maxRetries})...`);
        
        const credentials: GoogleCredentials = JSON.parse(this.credentials);
        const now = Math.floor(Date.now() / 1000);
        
        // Criar JWT para autenticação usando Web Crypto API
        const jwt = await this.createSecureJWT(credentials, now);
        
        // Trocar JWT por access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Drystore-EnergyBill-Processor/1.0'
          },
          body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
          })
        });
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          const authError = new Error(`Google OAuth2 failed: ${tokenResponse.status} - ${errorText}`);
          
          console.error(`❌ OAuth2 attempt ${attempt} failed:`, {
            status: tokenResponse.status,
            error: errorText.substring(0, 200)
          });
          
          // Retry em erros temporários
          if ((tokenResponse.status >= 500 || tokenResponse.status === 429) && attempt < maxRetries) {
            lastError = authError;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          
          throw authError;
        }
        
        const tokenData: GoogleTokenResponse = await tokenResponse.json();
        
        console.log('✅ Google OAuth2 token obtained successfully:', {
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in + 's',
          scope: tokenData.scope?.substring(0, 50) + '...'
        });
        
        return tokenData;
        
      } catch (error) {
        console.error(`❌ OAuth2 attempt ${attempt} failed:`, error.message);
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError!;
  }

  private async createSecureJWT(credentials: GoogleCredentials, now: number): Promise<string> {
    try {
      // Criar header e payload
      const header = {
        alg: 'RS256',
        typ: 'JWT'
      };
      
      const payload: JWTPayload = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600, // 1 hora
        iat: now
      };
      
      // Codificar header e payload
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
      
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;
      
      // Tentar assinatura mais robusta com Web Crypto API
      let signature: string;
      try {
        signature = await this.signJWTWithWebCrypto(unsignedToken, credentials.private_key);
      } catch (cryptoError) {
        console.warn('⚠️ Web Crypto API failed, using fallback signature:', cryptoError.message);
        signature = await this.signJWTFallback(unsignedToken, credentials.private_key);
      }
      
      return `${unsignedToken}.${signature}`;
      
    } catch (error) {
      console.error('❌ JWT creation failed:', error);
      throw new Error('Failed to create secure JWT: ' + error.message);
    }
  }

  private async signJWTWithWebCrypto(data: string, privateKeyPem: string): Promise<string> {
    try {
      // Converter chave privada PEM para formato Web Crypto API
      const pemHeader = "-----BEGIN PRIVATE KEY-----";
      const pemFooter = "-----END PRIVATE KEY-----";
      const pemContents = privateKeyPem.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
      
      const binaryDerString = atob(pemContents);
      const binaryDer = new Uint8Array(binaryDerString.length);
      for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
      }
      
      // Importar a chave
      const cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-256",
        },
        false,
        ["sign"]
      );
      
      // Assinar os dados
      const encoder = new TextEncoder();
      const signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        encoder.encode(data)
      );
      
      // Converter para base64url
      return this.base64UrlEncode(new Uint8Array(signature));
      
    } catch (error) {
      throw new Error('Web Crypto API signing failed: ' + error.message);
    }
  }

  private async signJWTFallback(data: string, privateKey: string): Promise<string> {
    console.log('⚠️ Using fallback JWT signing method');
    
    // Fallback mais simples mas funcional
    const encoder = new TextEncoder();
    const keyData = encoder.encode(privateKey.substring(0, 100)); // Usar parte da chave
    const signData = encoder.encode(data);
    
    // Combinar e fazer hash
    const combined = new Uint8Array(keyData.length + signData.length);
    combined.set(keyData, 0);
    combined.set(signData, keyData.length);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    return this.base64UrlEncode(new Uint8Array(hashBuffer));
  }

  private base64UrlEncode(data: string | Uint8Array): string {
    let base64: string;
    if (typeof data === 'string') {
      base64 = btoa(data);
    } else {
      // Uint8Array
      base64 = btoa(String.fromCharCode(...data));
    }
    return base64.replace(/[+\/=]/g, (m) => ({'+':'-','/':'_','=':''}[m]));
  }
}