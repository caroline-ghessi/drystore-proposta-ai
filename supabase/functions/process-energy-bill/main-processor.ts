// Main energy bill processor orchestrating all modules

import type { ExtractedEnergyBillData, ProcessingConfig, ExtractionQualityWeights } from './types.ts';
import { ImageProcessor } from './image-processor.ts';
import { GoogleAuthManager } from './google-auth.ts';
import { GoogleVisionClient } from './google-vision.ts';
import { AIEnergyBillParser } from './ai-parser.ts';
import { CEEEDataParser } from './ceee-parser.ts';
import { FallbackDataProvider } from './fallback-data.ts';

export class GoogleVisionEnergyBillProcessor {
  private credentials: string;
  private projectId: string;
  private config: ProcessingConfig;
  private imageProcessor: ImageProcessor;
  private authManager: GoogleAuthManager;
  private visionClient: GoogleVisionClient;
  private aiParser: AIEnergyBillParser;
  private ceeeParser: CEEEDataParser;
  private fallbackProvider: FallbackDataProvider;

  constructor(credentials: string, projectId: string) {
    this.credentials = credentials;
    this.projectId = projectId;
    
    this.config = {
      timeoutConvertMs: 10000, // 10s para conversão
      timeoutApiMs: 30000, // 30s para Google Vision API
      maxRetries: 3,
      retryDelay: 1000, // 1s inicial
      maxImageSizeMB: 10, // 10MB limite para Google Vision
      maxImageWidth: 1920,
      maxImageHeight: 1080
    };

    this.imageProcessor = new ImageProcessor(this.config);
    this.authManager = new GoogleAuthManager(this.credentials);
    this.visionClient = new GoogleVisionClient(this.config);
    
    // Configurar AI parser com Grok API key
    const grokApiKey = Deno.env.get('GROK_API_KEY') || '';
    this.aiParser = new AIEnergyBillParser(grokApiKey);
    
    // Manter CEEE parser como fallback
    this.ceeeParser = new CEEEDataParser();
    this.fallbackProvider = new FallbackDataProvider();
  }

  async processFile(fileData: File, fileName: string): Promise<ExtractedEnergyBillData> {
    console.log('🤖 Starting energy bill processing with Google Vision API...');
    console.log('📄 Image details:', {
      name: fileName,
      size: fileData.size,
      type: fileData.type || 'detected from filename'
    });

    // Validate image input
    await this.imageProcessor.validateImage(fileData, fileName);

    // FASE 3: Robustez da API - verificar credenciais Google Cloud
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
      console.log('🔄 Falling back to intelligent CEEE data...');
      return this.fallbackProvider.getFallbackData(fileName);
    }
  }

  private async processWithGoogleVision(fileData: File, fileName: string): Promise<ExtractedEnergyBillData> {
    const startConvert = Date.now();
    console.log('🔄 Converting and optimizing image...');
    
    // Otimizar imagem antes do processamento
    const optimizedImageData = await this.imageProcessor.optimizeImage(fileData);
    
    console.log('✅ Image optimized successfully:', {
      originalSize: fileData.size,
      optimizedSize: optimizedImageData.length,
      reduction: ((fileData.size - optimizedImageData.length) / fileData.size * 100).toFixed(1) + '%',
      convertTime: Date.now() - startConvert + 'ms'
    });

    // Obter access token do Google OAuth2 com cache
    const accessToken = await this.authManager.getCachedGoogleAccessToken();
    
    // PROCESSAMENTO COM GOOGLE VISION API (com retry)
    const fullText = await this.visionClient.callGoogleVisionWithRetry(optimizedImageData, accessToken, fileName);
    
    // FASE 1: Log do texto completo para análise (temporário)
    console.log('📄 FULL TEXT EXTRACTED BY GOOGLE VISION:');
    console.log('=' .repeat(80));
    console.log(fullText);
    console.log('=' .repeat(80));
    
    // PARSING COM IA (Grok API) - método principal
    let extractedData: ExtractedEnergyBillData;
    try {
      console.log('🧠 Attempting AI-powered parsing with Grok...');
      extractedData = await this.aiParser.parseEnergyBillWithAI(fullText, fileName);
      console.log('✅ AI parsing successful');
    } catch (aiError) {
      console.warn('⚠️ AI parsing failed, falling back to regex parser:', aiError.message);
      console.log('🔄 Using CEEE regex parser as fallback...');
      extractedData = this.ceeeParser.parseCEEEDataFromText(fullText);
    }
    
    const processingMethod = extractedData.nome_cliente !== 'Cliente não identificado' ? 'ai-powered' : 'regex-fallback';
    console.log('✅ Energy bill processing completed:', {
      method: processingMethod,
      concessionaria: extractedData.concessionaria,
      nome_cliente: extractedData.nome_cliente,
      endereco: extractedData.endereco?.substring(0, 50) + '...',
      uc: extractedData.uc,
      tarifa_kwh: extractedData.tarifa_kwh,
      consumo_atual_kwh: extractedData.consumo_atual_kwh,
      extractionQuality: this.calculateExtractionQuality(extractedData),
      totalTime: Date.now() - startConvert + 'ms'
    });

    return extractedData;
  }

  private calculateExtractionQuality(data: ExtractedEnergyBillData): number {
    let score = 0;
    const weights: ExtractionQualityWeights = {
      concessionaria: 0.1,
      nome_cliente: 0.2,
      endereco: 0.2,
      cidade: 0.1,
      estado: 0.1,
      uc: 0.1,
      tarifa_kwh: 0.1,
      consumo_atual_kwh: 0.1,
      consumo_historico: 0.1
    };

    // Validar cada campo
    if (data.concessionaria && data.concessionaria !== 'N/A') score += weights.concessionaria;
    if (data.nome_cliente && data.nome_cliente !== 'Cliente não identificado') score += weights.nome_cliente;
    if (data.endereco && data.endereco !== 'Endereço não identificado') score += weights.endereco;
    if (data.cidade && data.cidade !== 'N/A') score += weights.cidade;
    if (data.estado && data.estado !== 'N/A') score += weights.estado;
    if (data.uc && data.uc !== 'N/A' && data.uc.toString().length === 10) score += weights.uc;
    if (data.tarifa_kwh && data.tarifa_kwh > 0.3 && data.tarifa_kwh < 2.0) score += weights.tarifa_kwh;
    if (data.consumo_atual_kwh && data.consumo_atual_kwh > 0) score += weights.consumo_atual_kwh;
    if (data.consumo_historico && data.consumo_historico.length >= 1) score += weights.consumo_historico;

    return score;
  }

  // FASE 3: Validação robusta de credenciais Google Cloud
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
  getFallbackData(fileName: string): ExtractedEnergyBillData {
    return this.fallbackProvider.getFallbackData(fileName);
  }
}