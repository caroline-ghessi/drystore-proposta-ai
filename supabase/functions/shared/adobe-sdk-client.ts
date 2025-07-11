// ============================================================================
// FASE 01: Adobe SDK Centralizado - Versão Definitiva
// Implementa autenticação, OCR e PDF extraction unificados
// ============================================================================

export interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
  orgId: string;
}

export interface AdobeConfig {
  timeouts: {
    auth: number;
    upload: number;
    extraction: number;
    polling: number;
    download: number;
  };
  retries: {
    auth: number;
    upload: number;
    polling: number;
  };
  extraction: {
    getCharBounds: boolean;
    includeStyling: boolean;
    includeTableBounds: boolean;
    elementsToExtract: string[];
  };
}

export interface ExtractionResult {
  success: boolean;
  data?: any;
  method: 'adobe_sdk' | 'adobe_ocr' | 'fallback';
  processingTime: number;
  extractionQuality: 'high' | 'medium' | 'low';
  error?: string;
}

export class AdobeSDKClient {
  private credentials: AdobeCredentials;
  private config: AdobeConfig;
  private correlationId?: string;

  constructor(credentials: AdobeCredentials, correlationId?: string) {
    this.credentials = credentials;
    this.correlationId = correlationId;
    this.config = this.getOptimizedConfig();
  }

  private getOptimizedConfig(): AdobeConfig {
    return {
      timeouts: {
        auth: 30000,      // 30s para autenticação
        upload: 120000,   // 2m para upload
        extraction: 60000, // 1m para iniciar extração
        polling: 300000,  // 5m total para polling
        download: 60000   // 1m para download
      },
      retries: {
        auth: 3,
        upload: 2,
        polling: 1
      },
      extraction: {
        getCharBounds: true,
        includeStyling: true,
        includeTableBounds: true,
        elementsToExtract: ['text', 'tables', 'figures']
      }
    };
  }

  private log(message: string, data?: any): void {
    const prefix = this.correlationId ? `[${this.correlationId}]` : '[Adobe-SDK]';
    console.log(`${prefix} ${message}`, data || '');
  }

  private logError(message: string, error: any): void {
    const prefix = this.correlationId ? `[${this.correlationId}]` : '[Adobe-SDK]';
    console.error(`${prefix} ❌ ${message}`, {
      error: error.message,
      stack: error.stack
    });
  }

  // ========================================
  // AUTENTICAÇÃO COM RETRY INTELIGENTE
  // ========================================
  async authenticate(): Promise<string> {
    this.log('🔐 Iniciando autenticação Adobe...');
    
    for (let attempt = 1; attempt <= this.config.retries.auth; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeouts.auth);

        const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: this.credentials.clientId,
            client_secret: this.credentials.clientSecret,
            grant_type: 'client_credentials',
            scope: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          this.log(`✅ Autenticação bem-sucedida (tentativa ${attempt})`);
          return data.access_token;
        }

        const errorText = await response.text();
        this.log(`⚠️ Tentativa ${attempt} falhou: ${response.status} - ${errorText}`);
        
        if (attempt === this.config.retries.auth) {
          throw new Error(`Authentication failed after ${attempt} attempts: ${response.status}`);
        }

        // Backoff exponencial
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));

      } catch (error) {
        this.logError(`Erro na autenticação (tentativa ${attempt})`, error);
        if (attempt === this.config.retries.auth) {
          throw new Error(`Authentication error after ${attempt} attempts: ${error.message}`);
        }
      }
    }
    
    throw new Error('Authentication failed');
  }

  // ========================================
  // UPLOAD COM ESTRATÉGIA DINÂMICA
  // ========================================
  async uploadFile(file: File, accessToken: string): Promise<string> {
    this.log('📤 Iniciando upload do arquivo...', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);

    for (let attempt = 1; attempt <= this.config.retries.upload; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeouts.upload);

        const response = await fetch('https://pdf-services.adobe.io/assets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-API-Key': this.credentials.clientId,
            'X-Adobe-Organization-Id': this.credentials.orgId,
          },
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          this.log(`✅ Upload bem-sucedido: ${data.assetID}`);
          return data.assetID;
        }

        const errorText = await response.text();
        this.log(`⚠️ Upload tentativa ${attempt} falhou: ${response.status}`);
        
        if (attempt === this.config.retries.upload) {
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));

      } catch (error) {
        this.logError(`Erro no upload (tentativa ${attempt})`, error);
        if (attempt === this.config.retries.upload) {
          throw new Error(`Upload error: ${error.message}`);
        }
      }
    }

    throw new Error('Upload failed');
  }

  // ========================================
  // EXTRAÇÃO DE DADOS COM CONFIGURAÇÃO OTIMIZADA
  // ========================================
  async startExtraction(assetID: string, accessToken: string): Promise<string> {
    this.log('🔄 Iniciando extração de dados...');

    const extractionPayload = {
      assetID: assetID,
      ...this.config.extraction
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeouts.extraction);

    try {
      const response = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': this.credentials.clientId,
          'X-Adobe-Organization-Id': this.credentials.orgId,
        },
        body: JSON.stringify(extractionPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Extraction failed: ${response.status} - ${errorText}`);
      }

      const location = response.headers.get('location');
      if (!location) {
        throw new Error('Location header not found');
      }

      this.log(`✅ Extração iniciada: ${location}`);
      return location;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // ========================================
  // POLLING INTELIGENTE COM BACKOFF
  // ========================================
  async pollExtractionResult(location: string, accessToken: string): Promise<any> {
    this.log('⏳ Aguardando resultado da extração...');
    
    const startTime = Date.now();
    const maxAttempts = 100;
    let attempt = 1;

    while (attempt <= maxAttempts && (Date.now() - startTime) < this.config.timeouts.polling) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(location, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-API-Key': this.credentials.clientId,
            'X-Adobe-Organization-Id': this.credentials.orgId,
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 200) {
          const result = await response.json();
          this.log(`✅ Extração concluída (${Date.now() - startTime}ms)`);
          return result;
        } else if (response.status === 202) {
          this.log(`⏳ Em processamento... (tentativa ${attempt})`);
          
          // Backoff inteligente: começa rápido, depois fica mais lento
          const delay = attempt < 10 ? 2000 : attempt < 30 ? 5000 : 10000;
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        } else {
          const errorText = await response.text();
          throw new Error(`Polling failed: ${response.status} - ${errorText}`);
        }

      } catch (error) {
        this.logError(`Erro no polling (tentativa ${attempt})`, error);
        if (error.name === 'AbortError') {
          this.log('⚠️ Timeout no polling, tentando novamente...');
          attempt++;
          continue;
        }
        throw error;
      }
    }

    throw new Error('Extraction polling timeout');
  }

  // ========================================
  // DOWNLOAD DE RESULTADOS
  // ========================================
  async downloadResult(resultUrl: string): Promise<any> {
    this.log('📥 Fazendo download do resultado...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeouts.download);

    try {
      const response = await fetch(resultUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const result = await response.json();
      this.log(`✅ Download concluído (${JSON.stringify(result).length} chars)`);
      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // ========================================
  // OCR INTELIGENTE (FASE 03)
  // ========================================
  async performOCR(file: File, accessToken: string): Promise<ExtractionResult> {
    this.log('🔍 Iniciando OCR inteligente...');
    const startTime = Date.now();

    try {
      // 1. Upload do arquivo
      const assetID = await this.uploadFile(file, accessToken);

      // 2. OCR com configuração específica
      const ocrPayload = {
        assetID: assetID,
        ocrLang: 'pt-BR',
        imageCompression: 'medium',
        returnText: true,
        returnTables: true
      };

      const response = await fetch('https://pdf-services.adobe.io/operation/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-API-Key': this.credentials.clientId,
          'X-Adobe-Organization-Id': this.credentials.orgId,
        },
        body: JSON.stringify(ocrPayload)
      });

      if (!response.ok) {
        throw new Error(`OCR failed: ${response.status}`);
      }

      const location = response.headers.get('location');
      if (!location) {
        throw new Error('OCR location not found');
      }

      // 3. Polling do resultado do OCR
      const ocrResult = await this.pollExtractionResult(location, accessToken);
      const finalResult = await this.downloadResult(ocrResult.asset.downloadUri);

      this.log('✅ OCR concluído com sucesso');

      return {
        success: true,
        data: finalResult,
        method: 'adobe_ocr',
        processingTime: Date.now() - startTime,
        extractionQuality: 'high'
      };

    } catch (error) {
      this.logError('OCR falhou', error);
      return {
        success: false,
        method: 'adobe_ocr',
        processingTime: Date.now() - startTime,
        extractionQuality: 'low',
        error: error.message
      };
    }
  }

  // ========================================
  // EXTRAÇÃO COMPLETA (PIPELINE PRINCIPAL)
  // ========================================
  async extractPDFData(file: File): Promise<ExtractionResult> {
    this.log('🚀 Iniciando extração completa de PDF...');
    const startTime = Date.now();

    try {
      // 1. Autenticação
      const accessToken = await this.authenticate();

      // 2. Upload
      const assetID = await this.uploadFile(file, accessToken);

      // 3. Tentar extração avançada primeiro
      try {
        const location = await this.startExtraction(assetID, accessToken);
        const extractResult = await this.pollExtractionResult(location, accessToken);
        const finalData = await this.downloadResult(extractResult.asset.downloadUri);

        this.log('✅ Extração avançada bem-sucedida');
        return {
          success: true,
          data: finalData,
          method: 'adobe_sdk',
          processingTime: Date.now() - startTime,
          extractionQuality: 'high'
        };

      } catch (extractError) {
        this.log('⚠️ Extração avançada falhou, tentando OCR...');
        
        // 4. Fallback para OCR se extração avançada falhar
        return await this.performOCR(file, accessToken);
      }

    } catch (error) {
      this.logError('Extração completa falhou', error);
      return {
        success: false,
        method: 'adobe_sdk',
        processingTime: Date.now() - startTime,
        extractionQuality: 'low',
        error: error.message
      };
    }
  }
}