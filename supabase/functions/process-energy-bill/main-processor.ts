// Main energy bill processor orchestrating all modules

import type { ExtractedEnergyBillData, ProcessingConfig, ExtractionQualityWeights } from './types.ts';
import { ImageProcessor } from './image-processor.ts';
import { GoogleAuthManager } from './google-auth.ts';
import { GoogleVisionClient } from './google-vision.ts';
import { CEEEDataParser } from './ceee-parser.ts';
import { FallbackDataProvider } from './fallback-data.ts';

export class GoogleVisionEnergyBillProcessor {
  private credentials: string;
  private projectId: string;
  private config: ProcessingConfig;
  private imageProcessor: ImageProcessor;
  private authManager: GoogleAuthManager;
  private visionClient: GoogleVisionClient;
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

    // Verificar credenciais Google Cloud
    console.log('🔑 Google Cloud credentials check:');
    console.log('📊 Credentials status:', { 
      hasCredentials: !!this.credentials,
      hasProjectId: !!this.projectId,
      projectId: this.projectId,
      timestamp: new Date().toISOString()
    });
    
    if (!this.credentials || !this.projectId) {
      console.log('⚠️ Google Cloud credentials missing - using intelligent fallback');
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
    
    // PARSING ESPECIALIZADO PARA DADOS CEEE
    const extractedData = this.ceeeParser.parseCEEEDataFromText(fullText);
    
    console.log('✅ Google Vision extraction completed:', {
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

  // Public method for fallback access
  getFallbackData(fileName: string): ExtractedEnergyBillData {
    return this.fallbackProvider.getFallbackData(fileName);
  }
}