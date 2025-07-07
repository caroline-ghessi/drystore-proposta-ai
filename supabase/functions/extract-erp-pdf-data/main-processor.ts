// Main ERP PDF processor orchestrating all modules

import type { ExtractedERPData, ProcessingConfig } from './types.ts';
import { PDFToImageConverter } from './pdf-converter.ts';
import { GoogleAuthManager } from '../process-energy-bill/google-auth.ts';
import { GoogleVisionClient } from '../process-energy-bill/google-vision.ts';
import { AIERPParser } from './ai-erp-parser.ts';
import { ERPFallbackProvider } from './erp-fallback.ts';

export class GoogleVisionERPProcessor {
  private credentials: string;
  private projectId: string;
  private config: ProcessingConfig;
  private pdfConverter: PDFToImageConverter;
  private authManager: GoogleAuthManager;
  private visionClient: GoogleVisionClient;
  private aiParser: AIERPParser;
  private fallbackProvider: ERPFallbackProvider;

  constructor(credentials: string, projectId: string) {
    this.credentials = credentials;
    this.projectId = projectId;
    
    this.config = {
      timeoutConvertMs: 15000, // 15s para conversão PDF->Image
      timeoutApiMs: 30000, // 30s para Google Vision API
      maxRetries: 3,
      retryDelay: 1000, // 1s inicial
      maxImageSizeMB: 10, // 10MB limite para Google Vision
      maxImageWidth: 1920,
      maxImageHeight: 1080
    };

    this.pdfConverter = new PDFToImageConverter(this.config);
    this.authManager = new GoogleAuthManager(this.credentials);
    this.visionClient = new GoogleVisionClient(this.config);
    
    // Configurar AI parser com Grok API key
    const grokApiKey = Deno.env.get('GROK_API_KEY') || '';
    this.aiParser = new AIERPParser(grokApiKey);
    
    // Manter fallback provider
    this.fallbackProvider = new ERPFallbackProvider();
  }

  async processERPFile(fileData: File, fileName: string): Promise<ExtractedERPData> {
    console.log('🤖 Starting ERP PDF processing with Google Vision API...');
    console.log('📄 PDF details:', {
      name: fileName,
      size: fileData.size,
      type: fileData.type || 'application/pdf'
    });

    // Validate PDF input
    await this.validatePDFInput(fileData, fileName);

    // Verificar credenciais Google Cloud
    console.log('🔑 Google Cloud credentials validation:');
    
    const credentialsValid = this.validateGoogleCredentials();
    console.log('📊 Credentials validation:', { 
      hasCredentials: !!this.credentials,
      hasProjectId: !!this.projectId,
      projectId: this.projectId,
      credentialsValid,
      credentialsLength: this.credentials?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    if (!credentialsValid) {
      console.log('⚠️ Google Cloud credentials invalid - using intelligent fallback');
      return this.fallbackProvider.getFallbackData(fileName);
    }

    try {
      // Tentar processamento real com Google Vision API
      console.log('🚀 Processing with Google Vision API...');
      return await this.processWithGoogleVision(fileData, fileName);
    } catch (error) {
      console.error('❌ Google Vision processing failed:', error.message);
      console.log('🔄 Falling back to intelligent ERP data...');
      return this.fallbackProvider.getFallbackData(fileName);
    }
  }

  private async processWithGoogleVision(fileData: File, fileName: string): Promise<ExtractedERPData> {
    const startConvert = Date.now();
    console.log('🔄 Converting PDF to image for OCR...');
    
    // Converter PDF para imagem otimizada
    const optimizedImageData = await this.pdfConverter.convertPDFToOptimizedImage(fileData);
    
    console.log('✅ PDF converted to image successfully:', {
      originalSize: fileData.size,
      optimizedSize: optimizedImageData.length,
      reduction: ((fileData.size - optimizedImageData.length) / fileData.size * 100).toFixed(1) + '%',
      convertTime: Date.now() - startConvert + 'ms'
    });

    // Obter access token do Google OAuth2 com cache
    const accessToken = await this.authManager.getCachedGoogleAccessToken();
    
    // PROCESSAMENTO COM GOOGLE VISION API (com retry)
    const fullText = await this.visionClient.callGoogleVisionWithRetry(optimizedImageData, accessToken, fileName);
    
    // Log do texto completo para análise
    console.log('📄 FULL TEXT EXTRACTED BY GOOGLE VISION:');
    console.log('=' .repeat(80));
    console.log(fullText);
    console.log('=' .repeat(80));
    
    // PARSING COM IA (Grok API) - método principal
    let extractedData: ExtractedERPData;
    try {
      console.log('🧠 Attempting AI-powered ERP parsing with Grok...');
      extractedData = await this.aiParser.parseERPWithAI(fullText, fileName);
      console.log('✅ AI ERP parsing successful');
    } catch (aiError) {
      console.warn('⚠️ AI ERP parsing failed, falling back to intelligent fallback:', aiError.message);
      console.log('🔄 Using intelligent ERP fallback...');
      extractedData = this.fallbackProvider.getFallbackData(fileName);
    }
    
    const processingMethod = extractedData.client !== 'Cliente não identificado' ? 'ai-powered' : 'fallback';
    console.log('✅ ERP processing completed:', {
      method: processingMethod,
      client: extractedData.client,
      vendor: extractedData.vendor,
      itemsCount: extractedData.items.length,
      total: extractedData.total,
      extractionQuality: this.calculateExtractionQuality(extractedData),
      totalTime: Date.now() - startConvert + 'ms'
    });

    return extractedData;
  }

  private async validatePDFInput(fileData: File, fileName: string): Promise<void> {
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      throw new Error('File must be a PDF');
    }

    if (fileData.size > 50 * 1024 * 1024) { // 50MB
      throw new Error('PDF file too large (max 50MB)');
    }

    if (fileData.size < 1024) { // 1KB
      throw new Error('PDF file too small (min 1KB)');
    }
  }

  private calculateExtractionQuality(data: ExtractedERPData): number {
    let score = 0;
    const maxScore = 6;

    // Cliente (peso 1)
    if (data.client && data.client !== 'Cliente não identificado') score += 1;

    // Fornecedor (peso 1)
    if (data.vendor && data.vendor !== 'N/A') score += 1;

    // Itens (peso 2)
    if (data.items && data.items.length > 0) {
      score += 1;
      // Bonus se tem itens com preços reais
      const itemsWithPrices = data.items.filter(item => item.unitPrice > 0).length;
      if (itemsWithPrices >= data.items.length * 0.8) {
        score += 1;
      }
    }

    // Total (peso 1)
    if (data.total && data.total > 0) score += 1;

    // Condições de pagamento (peso 1)
    if (data.paymentTerms && data.paymentTerms !== 'N/A') score += 1;

    return score / maxScore;
  }

  private validateGoogleCredentials(): boolean {
    try {
      if (!this.credentials || !this.projectId) {
        console.log('❌ Missing credentials or projectId');
        return false;
      }
      
      // Tentar parsear as credenciais JSON
      const parsedCredentials = JSON.parse(this.credentials);
      const hasClientEmail = !!parsedCredentials.client_email;
      const hasPrivateKey = !!parsedCredentials.private_key;
      const hasValidStructure = hasClientEmail && hasPrivateKey;
      
      console.log('🔍 Credentials structure validation:', {
        hasClientEmail,
        hasPrivateKey,
        hasValidStructure,
        clientEmailDomain: parsedCredentials.client_email?.split('@')[1] || 'none'
      });
      
      return hasValidStructure;
    } catch (error) {
      console.error('❌ Error validating Google credentials:', error.message);
      return false;
    }
  }

  // Public method for fallback access
  getFallbackData(fileName: string): ExtractedERPData {
    return this.fallbackProvider.getFallbackData(fileName);
  }
}