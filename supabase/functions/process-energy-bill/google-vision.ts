// Google Vision API integration utilities

import type { ProcessingConfig } from './types.ts';

export class GoogleVisionClient {
  private config: ProcessingConfig;

  constructor(config: ProcessingConfig) {
    this.config = config;
  }

  async callGoogleVisionWithRetry(base64Data: string, accessToken: string, fileName: string): Promise<string> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      const startProcess = Date.now();
      console.log(`🚀 Google Vision API attempt ${attempt}/${this.config.maxRetries}...`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutApiMs);

        const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Drystore-EnergyBill-Processor/1.0'
          },
          body: JSON.stringify({
            requests: [{
              image: { content: base64Data },
              features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
            }]
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📡 Google Vision API Response (attempt ${attempt}):`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          processTime: Date.now() - startProcess + 'ms'
        });

        if (!response.ok) {
          const errorText = await response.text();
          const apiError = new Error(`Google Vision API failed: ${response.status} - ${errorText.substring(0, 200)}`);
          
          // Rate limiting ou erro temporário - tentar novamente
          if (response.status === 429 || response.status >= 500) {
            console.warn(`⚠️ Temporary error (${response.status}), will retry...`);
            lastError = apiError;
            
            if (attempt < this.config.maxRetries) {
              const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          throw apiError;
        }

        const result = await response.json();
        console.log('🔍 Google Vision API Response received successfully');
        
        const textAnnotations = result.responses?.[0]?.textAnnotations;
        
        if (!textAnnotations || textAnnotations.length === 0) {
          console.warn('⚠️ No text detected by Google Vision API');
          throw new Error('No text detected by Google Vision API');
        }

        const fullText = textAnnotations[0].description;
        
        console.log('📊 OCR Text Extraction Metrics:', {
          totalCharacters: fullText.length,
          totalLines: fullText.split('\n').length,
          confidence: result.responses?.[0]?.textAnnotations?.[0]?.confidence || 'not provided',
          processingTime: Date.now() - startProcess + 'ms'
        });

        return fullText;

      } catch (error) {
        console.error(`❌ Google Vision API attempt ${attempt} failed:`, error.message);
        lastError = error as Error;
        
        if (error.name === 'AbortError') {
          lastError = new Error(`Google Vision API timeout after ${this.config.timeoutApiMs}ms`);
        }
        
        // Se não é o último attempt, aguardar antes de tentar novamente
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Todos os attempts falharam
    console.error(`❌ All ${this.config.maxRetries} attempts failed. Last error:`, lastError!.message);
    throw lastError!;
  }
}